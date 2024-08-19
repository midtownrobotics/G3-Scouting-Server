import express from 'express';
import {Settings, Scout, AssignedMatch, Sheet, User, getFile, getSettings, writeSettings, getSheet, addRowToSheet, completeMatch, addColumnToSheet, deleteRowFromSheet, saveForm, deleteForm } from './storage';
import * as fs from 'fs';

const app = express();

let PORT: number = 8082;

app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

if (process.argv.indexOf("port") > -1) {
    PORT = parseInt(process.argv[process.argv.indexOf("port") + 1])
}

app.use(function(req, res, next) {

    if(!getSettings().users[0] || !getSettings().users.find((user) => user.permissions == "0")) {
        let settings: Settings = getSettings()
        settings.users.push({username: "admin", password: "password", permissions: "0"})
        writeSettings(settings) 
    }

    if(!getSettings().permissionLevels[0]) {
        let settings: Settings = getSettings();
        settings.permissionLevels.push({name: "admin", blacklist: []})
        writeSettings(settings) 
    }

    let auth: Array<string> | null = null;

    let url: string = req.url;
    if (url.charAt(url.length - 1) == "/") {
        url = url.substring(0, url.length-1)
    }

    if (req.headers.authorization) {
        auth = Buffer.from(req.headers.authorization.substring(6), 'base64').toString().split(':');
    }

    let permissions: "BAD USER" | number;

    if (auth) {
        permissions = checkAuth(auth[0], auth[1])
        if (permissions == "BAD USER") {
            // console.log(`User ${auth[0]} was denied access to your website!`)
        }
    } else {
        permissions = "BAD USER"
    }

    if (permissions == "BAD USER") {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="G3"');
        res.end('Unauthorized');
    } else {
        const blacklist: Array<string> = getSettings().permissionLevels[permissions].blacklist
        let bad: boolean = false;
        for (let i=0; i < blacklist.length; i++) {
            if (url.includes(blacklist[i])) {
                bad = true
                break
            }
        }
        if (!bad) {
            // console.log(`User ${auth[0]} navigated to ${req.url} succesfully!`)
            next();
        } else {
            // console.log(`User ${auth[0]} was denied access to ${req.url}!`)
            res.sendFile(__dirname + "/src/401.html");
        } 
    }
});

function checkAuth(username: string, password: string): 'BAD USER' | number {
    const users: Array<User> = getSettings().users
    for (let i = 0; i < users.length; i++) {
        if (users[i].username == username && users[i].password == password) {
            return parseInt(users[i].permissions)
        }
    }
    return "BAD USER";
}

app.use(express.static(__dirname + '/static/'));

app.get('/logout', (req, res) => {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="G3"');
    res.send('Unauthorized');
})

app.get('/forms', (req, res) => {
    const form: string | undefined = req.query.form?.toString()
    if (form) {
        res.render('form', {data: getSheet(form), nav: getFile("/src/nav.html")});
    } else if (getFile("/storage/scouting.json").toString()){
        const sheets: Array<string> = Object.keys(getFile("/storage/scouting.json"))
        res.render('form-home', {sheets: sheets, nav: getFile("/src/nav.html")})
    } else {
        res.render('form-home', {sheets: false, nav: getFile("/src/nav.html")})
    }
})

app.get('/data', (req, res) => {
    const sheet: string | undefined = req.query.sheet?.toString()
    if (sheet) {
        res.render('data', {data: getSheet(sheet), nav: getFile("/src/nav.html")});
    } else if (getFile("/storage/scouting.json").toString()){
        const sheets: Array<string> = Object.keys(getFile("/storage/scouting.json"))
        res.render('data-home', {sheets: sheets, nav: getFile("/src/nav.html")})
    } else {
        res.render('data-home', {sheets: false, nav: getFile("/src/nav.html")})
    }
})

app.get('/data/tba', (req, res) => {
    res.render('data-tba', {nav: getFile("/src/nav.html")})
})

app.get('/admin', (req, res) => {
    res.render('admin', {users: getSettings().users, perms: getSettings().permissionLevels, nav: getFile("/src/nav.html")})
})

app.get('/', (req, res) => {
    const username: string = Buffer.from(req.headers.authorization?.substring(6) || "", 'base64').toString().split(':')[0]
    res.render('user', {username: username, nav: getFile("/src/nav.html")})
})

app.get('/user-get', (req, res) => {
    const name: string = Buffer.from(req.headers.authorization?.substring(6) || "", 'base64').toString().split(':')[0]
    const user: Scout = getFile("/storage/scouts.json").find((p: Scout) => p.name == name)
    const matchNumb: number = user.matchNumbs.reduce((a: number, b: number) => Math.min(a, b))
    const match: AssignedMatch | undefined = user.matches.find((m: AssignedMatch) => m.number == matchNumb)
    let matches: Array<AssignedMatch> = user.matches.filter((m: AssignedMatch) => m.scouted == false)
    matches.sort((a: AssignedMatch, b: AssignedMatch) => (a.number > b.number ? 1 : -1))

    let matchesAndBreaks: Array<AssignedMatch | "break"> = [];

    for (let i = 0; i < matches.length; i++) {
        matchesAndBreaks[matches[i].number-1] = matches[i]
    }

    for (let i = 0; i < matchesAndBreaks.length; i++) {
        if (!matchesAndBreaks[i]) {
            matchesAndBreaks[i] = "break"
        }
    }

    res.send({
        name: name,
        nextMatch: {
            number: matchNumb, 
            team: match?.team, 
            station: match?.alliance, // Upercases first letter
            highPriority: match?.highPriority
        },
        matches: matchesAndBreaks
    })
})

app.get('/data/analysis', (req, res) => {
    if (req.query.team && req.query.sheet) {

        let sheet: Sheet = getFile("/storage/scouting.json")[req.query.sheet.toString()]

        if (!sheet) {
            res.render('data-analysis-home', {nav: getFile("/src/nav.html"), sheets: Object.keys(getFile("/storage/scouting.json")), error: "No sheet found!"})
            return;
        }

        sheet.rows = sheet.rows.filter((row) => row.find((value) => value.name == "TeamNum")?.value == req.query.team)

        if (!sheet.rows[0]) {
            res.render('data-analysis-home', {nav: getFile("/src/nav.html"), sheets: Object.keys(getFile("/storage/scouting.json")), error: "No data found for team!"})
            return;
        }

        res.render('data-analysis', {nav: getFile("/src/nav.html"), info: sheet, sheets: Object.keys(getFile("/storage/scouting.json"))})

    } else {
        res.render('data-analysis-home', {nav: getFile("/src/nav.html"), sheets: Object.keys(getFile("/storage/scouting.json")), error: null})
    }
})

app.get('/forms-get', (req, res) => {
    res.sendFile(__dirname + "/storage/forms.json")
})

app.post('/post', (req, res) => {
    const body: any = req.body

    const username: string = Buffer.from(req.headers.authorization?.substring(6) || "", 'base64').toString().split(':')[0];

    // console.log(`Action ${body.action} was posted.`)

    switch (req.body.action) {
        case "getSheet":
            res.send({res: getSheet(body.sheet)});
            break
        case "addRow":
            addRowToSheet(body.sheet, body.data, username);
            if (body.sheet == "Numeric") {
                completeMatch(body.matchNumb, username)
            }
            res.send({res: "OK"});
            break
        case "addColumn":
            addColumnToSheet(body.sheet, body.data);
            res.send({res: "OK"});
            break
        case "deleteRow":
            deleteRowFromSheet(body.sheet, body.data);
            res.send({res: "OK"})
            break
        case "getKey":
            res.send({res: getSettings().eventKey})
            break
        case "getScout":
            {
                const scouts: Array<Scout> = getFile("/storage/scouts.json")
                res.send({res: scouts.find(p => p.name == username)})
            }
            break
        case "getSchedule":
            res.send({res: getFile("/storage/matches.json")})
            break
        case "syncOffline":
            {
                for (let i=0; i < Object.keys(body.data.scoutingData).length; i++) {
                    const sheetName: string = Object.keys(body.data.scoutingData)[i]
                    const sheet: Sheet = body.data.scoutingData[sheetName]

                    for (let i=0; i < sheet.rows.length; i++) {
                        const scoutName: string = sheet.rows[i].find((item) => (item.name == "scout"))?.value;
                        const matchNumber: number = parseInt(sheet.rows[i].find((item) => (item.name == "matchNum"))?.value)
                        if (scoutName && matchNumber) {
                            addRowToSheet(sheetName, sheet.rows[i], scoutName)
                            completeMatch(matchNumber, scoutName)
                        }
                    }
                }

                res.send({res: "OK"})
            }
            break
        default:
            res.send({res: "Invalid Request"});
            break
    }
    
})

function isValidUser(userObject: User) {
    const settings: Settings = getSettings()
    if (!!userObject.username && !!userObject.password && parseInt(userObject.permissions) < settings.permissionLevels.length) {
        return true;
    } else {
        return false;
    }
}

app.post('/admin', (req, res) => {
    const body: any = req.body

    switch (req.body.action) {
        case "deleteDatabase":
            var settings: Settings = getSettings()
            settings.users = []
            settings.permissionLevels = []
            settings.eventKey = "NONE"
            writeSettings(settings)
            fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify({}))
            fs.writeFileSync(__dirname + "/storage/matches.json", JSON.stringify({}))
            fs.writeFileSync(__dirname + "/storage/scouts.json", JSON.stringify({}))
            res.send({res: "OK"})
            break
        case "editUserField":
            { // needed to declare const only used in this case
                var settings: Settings = getSettings()
                const userIndex = settings.users.findIndex(p => p.username == body.data.name)
                const field: "username" | "password" | "permissions" = body.data.field
                settings.users[userIndex][field] = body.data.updated
                if (isValidUser(settings.users[userIndex])) {
                    writeSettings(settings)
                    res.send({res: "OK"})
                } else {
                    res.send({res: "Bad User"});
                }
            }
            break
        case "setSchedule":
            fs.writeFileSync(__dirname+"/storage/matches.json", JSON.stringify(body.data))
            res.send({res: "OK"})
            break
        case "assignMatches":
            fs.writeFileSync(__dirname+"/storage/scouts.json", JSON.stringify(body.data))
            res.send({res: "OK"})
            break
        case "addUser":
            var settings: Settings = getSettings()
            if (isValidUser(body.data)) {
                settings.users.push(body.data)
                writeSettings(settings) 
                res.send({res: "OK"})
            } else {
                res.send({res: "Bad User"});
            }
            break
        case "deleteUser":
            { // needed to declare const only used in this case
                var settings: Settings = getSettings()
                const userIndex: number = settings.users.findIndex(item => item.username === body.data)
                settings.users.splice(userIndex, 1)
                writeSettings(settings) 
                res.send({res: "OK"})
            }
            break
        case "addPerm":
            var settings: Settings = getSettings()
            settings.permissionLevels.push(body.data)
            writeSettings(settings) 
            res.send({res: "OK"})
            break
        case "changeKey":
            var settings: Settings = getSettings()
            settings.eventKey = body.data
            writeSettings(settings)
            res.send({res: "OK"})
            break
        case "saveForm":
            saveForm(body.name, body.data)
            res.send({res: "OK"})
            break
        case "deleteForm":
            deleteForm(body.name)
            res.send({res: "OK"})
            break
        case "overwriteForm":
            console.log(body.name)
            saveForm(body.name, body.data, true)
            res.send({res: "OK"})
            break
        default:
            res.send({res: "Invalid Request"});
            break
    }
})

app.get("*", (req, res) => {
    res.sendFile(__dirname+"/src/404.html")
})

console.log(`listening on port ${PORT}! enjoy!`);
app.listen(PORT);