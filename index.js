const express = require('express');
const app = express();
const fs = require('fs');
const XLSX = require('xlsx') 

const PORT = 8080;

app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(function(req, res, next) {

    if(!getSettings().users[0] || !getSettings().users.find(item => item.permissions == "0")) {
        var settings = getSettings()
        settings.users.push({username: "admin", password: "password", permissions: "0", matches: []})
        writeSettings(settings) 
    }

    if(!getSettings().permissionLevels[0]) {
        var settings = getSettings()
        settings.permissionLevels.push({name: "admin", blacklist: []})
        writeSettings(settings) 
    }

    var auth;
    let url = req.url;
    if (url.charAt(url.length - 1) == "/") {
        url = url.substring(0, url.length-1)
    }

    if (req.headers.authorization) {
        auth = Buffer.from(req.headers.authorization.substring(6), 'base64').toString().split(':');
    }

    let permissions;

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
        const blacklist = getSettings().permissionLevels[permissions].blacklist
        let bad = false;
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

function checkAuth(username, password) {
    const users = getSettings().users
    for (i = 0; i < users.length; i++) {
        if (users[i].username == username && users[i].password == password) {
            return users[i].permissions
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
    const form = req.query.form
    if (form) {
        res.render('form', {data: getSheet(form), nav: getFile("/src/nav.html")});
    } else {
        const sheets = getFile("/storage/scouting.json").toString() == "" ? false : Object.keys(getFile("/storage/scouting.json"))
        res.render('form-home', {sheets: sheets, nav: getFile("/src/nav.html")})
    }
})

app.get('/data', (req, res) => {
    const sheet = req.query.sheet
    if (sheet) {
        res.render('data', {data: getSheet(sheet), nav: getFile("/src/nav.html")});
    } else {
        const sheets = getFile("/storage/scouting.json").toString() == "" ? false : Object.keys(getFile("/storage/scouting.json"))
        res.render('data-home', {sheets: sheets, nav: getFile("/src/nav.html")})
    }
})

app.get('/data/tba', (req, res) => {
    res.render('data-tba', {nav: getFile("/src/nav.html")})
})

app.get('/admin', (req, res) => {
    res.render('admin', {users: getSettings().users, perms: getSettings().permissionLevels, nav: getFile("/src/nav.html")})
})

app.get('/', (req, res) => {
    const auth = Buffer.from(req.headers.authorization.substring(6), 'base64').toString().split(':')
    res.render('user', {username: auth[0], nav: getFile("/src/nav.html")})
})

app.get('/user-get', (req, res) => {
    const name = Buffer.from(req.headers.authorization.substring(6), 'base64').toString().split(':')[0]
    const user = getFile('/storage/scouts.json').find((p) => p.name == name)
    const matchNumb = user.matchNumbs.reduce((a, b) => Math.min(a, b))
    const match = user.matches.find((p) => p.number == matchNumb)
    var matches = user.matches.filter((p) => p.scouted == false).sort((a, b) => (a.number > b.number ? 1 : -1)) // Only shows matches that havent been scouted
    var matchesAndBreaks = []
    for (let i = 0; i < matches.length; i++) {
        matchesAndBreaks[matches[i].number-1] = matches[i]
    }
    matchesAndBreaks = Array.from(matchesAndBreaks, item => item || "break");
    res.send({
        nextMatch: {
            number: matchNumb, 
            team: match.team, 
            station: match.alliance, // Upercases first letter
            highPriority: match.highPriority
        },
        matches: matchesAndBreaks
    })
})

app.get('/data/analysis', (req, res) => {
    if (req.query.team) {

        const sheet = req.query.sheet

        let rows = getFile('/storage/scouting.json')[sheet]?.rows

        console.log(rows)

        if (!rows) {
            res.render('data-analysis-home', {nav: getFile("/src/nav.html"), sheets: Object.keys(getFile("/storage/scouting.json")), error: "No data found for team!"})
            return;
        }

        let infoFields = {}
        let info = []

        for (let i = 0; i < rows.length; i++) {
            if (rows[i].findIndex((t) => t.value == req.query.team) !== -1) {
                for (let x = 0; x < rows[i].length; x++) {

                    if (infoFields[rows[i][x].name] == undefined) {
                        infoFields[rows[i][x].name] = Object.keys(infoFields).length
                    }

                    if (info[infoFields[rows[i][x].name]] == undefined) {
                        info[infoFields[rows[i][x].name]] = []
                    }

                    info[parseInt(infoFields[rows[i][x].name])].push(rows[i][x].value)

                }
            }
        }

        if (!info[0]) {
            res.render('data-analysis-home', {nav: getFile("/src/nav.html"), sheets: Object.keys(getFile("/storage/scouting.json")), error: "No data found for team!"})
            return;
        }

        res.render('data-analysis', {nav: getFile("/src/nav.html"), info: info, infoFields: infoFields})

    } else {
        res.render('data-analysis-home', {nav: getFile("/src/nav.html"), sheets: Object.keys(getFile("/storage/scouting.json")), error: null})
    }
})

// app.get('/sheets', async (req, res) => {
//     if (req.query.id) {
//         const sheetToGet = req.query.id
//         let sheet = XLSX.utils.json_to_sheet(getSheet(sheetToGet))
//         let newWorkBook = XLSX.utils.book_new()
//         XLSX.utils.book_append_sheet(newWorkBook, sheet)
//         await XLSX.writeFile(newWorkBook, "./src/sheets/displaySheets/" + sheetToGet + ".xlsx")
//         res.sendFile(__dirname + '/src/sheets/displaySheets/' + sheetToGet + ".xlsx")
//     } else {
//         res.send("sheet not found")
//     }
// })

app.post('/post', (req, res) => {
    const body = req.body

    // console.log(`Action ${body.action} was posted.`)

    switch (req.body.action) {
        case "getSheet":
            res.send({res: getSheet(body.sheet)});
            break
        case "addRow":
            addRowToSheet(body.sheet, body.data, Buffer.from(req.headers.authorization.substring(6), 'base64').toString().split(':')[0]);
            completeMatch(body.matchNumb, Buffer.from(req.headers.authorization.substring(6), 'base64').toString().split(':')[0])
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
        case "addUser":
            var settings = getSettings()
            settings.users.push(body.data)
            writeSettings(settings) 
            res.send({res: "OK"})
            break
        case "deleteUser":
            { // needed to declare const only used in this case
                var settings = getSettings()
                const userIndex = settings.users.findIndex(item => item.username === body.data)
                settings.users.splice(userIndex, 1)
                writeSettings(settings) 
                res.send({res: "OK"})
            }
            break
        case "addPerm":
            var settings = getSettings()
            settings.permissionLevels.push(body.data)
            writeSettings(settings) 
            res.send({res: "OK"})
            break
        case "changeKey":
            var settings = getSettings()
            settings.eventKey = body.data
            writeSettings(settings)
            res.send({res: "OK"})
            break
        case "getKey":
            res.send({res: getSettings().eventKey})
            break
        case "assignMatches":
            fs.writeFileSync(__dirname+"/storage/scouts.json", JSON.stringify(body.data))
            res.send({res: "OK"})
            break
        case "getScout":
            const scouts = getFile('/storage/scouts.json')
            res.send({res: scouts[scouts.findIndex(p => p.name == Buffer.from(req.headers.authorization.substring(6), 'base64').toString().split(':')[0])]})
            break
        case "getSchedule":
            res.send({res: getFile("/storage/matches.json")})
            break
        case "setSchedule":
            fs.writeFileSync(__dirname+"/storage/matches.json", JSON.stringify(body.data))
            res.send({res: "OK"})
            break
        default:
            res.send({res: "Invalid Request"});
            break
    }
    
})

function getFile(relativePath) {
    const file = fs.readFileSync(__dirname+relativePath).toString()
    try {
        return JSON.parse(file)
    } catch {
        return file
    }
}   

app.post('/admin', (req, res) => {
    const body = req.body

    switch (req.body.action) {
        case "deleteDatabase":
            var settings = getSettings()
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
                var settings = getSettings()
                const userIndex = settings.users.findIndex(p => p.username == body.data.name)
                settings.users[userIndex][body.data.field] = body.data.updated
                writeSettings(settings)
                res.send({res: "OK"})
            }
            break
        // case "deleteDatabaseAndPerms":
        //     var settings = getSettings()
        //     settings.users = []
        //     settings.eventKey = "NONE"
        //     settings.permissionLevels = []
        //     writeSettings(settings)
        //     fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify({}))
        //     res.send({res: "OK"})
        //     break
        default:
            res.send({res: "Invalid Request"});
            break
    }
})

app.get("*", (req, res) => {
    res.sendFile(__dirname+"/src/404.html")
})

// Get Settings

function getSettings() {
    return getFile("/storage/settings.json")
}

function writeSettings(data) {
    fs.writeFileSync(__dirname + "/storage/settings.json", JSON.stringify(data))
}

/* EXAMPLE OF USAGE

    var settings = getSettings()
    settings.users.push({username: "g3", password: "robotics"})
    writeSettings(settings) 

*/

function makeSheet(sheet) {
    let newJSON = getFile("/storage/scouting.json")
    if (!newJSON[sheet]) {
        newJSON[sheet] = {"cols":[], "rows": []}
        fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify(newJSON))
        return "OK"
    } else {
        return "Sheet Already Made"
    }
}

function completeMatch(matchNumber, username) {
    let scouts = getFile("/storage/scouts.json")
    const user = scouts.findIndex(({name}) => name == username)
    scouts[user].matches.find(({number}) => number == matchNumber) ? scouts[user].matches.find(({number}) => number == matchNumber).scouted = true : ""
    scouts[user].matchNumbs.splice(scouts[user].matchNumbs.indexOf(parseInt(matchNumber)), 1)
    fs.writeFileSync(__dirname+"/storage/scouts.json", JSON.stringify(scouts))
}

function getSheet(sheet) {
    return getFile("/storage/scouting.json")[sheet]
}

function addRowToSheet(sheet, data, username) {
    data.push({name: "scout", value: username})
    let newJSON = getFile("/storage/scouting.json")
    for (let i=0; i < data.length; i++) {
        !newJSON[sheet].cols.includes(data[i].name) ? newJSON[sheet].cols.push(data[i].name) : ""
    }
    newJSON[sheet].rows.push(data)
    fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify(newJSON))
}

function addColumnToSheet(sheet, column) {
    let newJSON = getFile("/storage/scouting.json")
    newJSON[sheet].cols.push(column)
    fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify(newJSON))
}

function deleteRowFromSheet(sheet, row) {
    let newJSON = getFile("/storage/scouting.json")
    newJSON[sheet].rows.splice(row, 1)
    fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify(newJSON))
}

// console.log(`listening on port ${PORT}!`);
app.listen(PORT);