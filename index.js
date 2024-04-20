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

    if(!getSettings().users[0]) {
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
    } else {
        permissions = "BAD USER"
    }

    if (!auth || permissions == "BAD USER") {
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
            next();
        } else {
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

// app.get('/form', (req, res) => {
//     formContent = ""

//     res.render('scouting', {form: formContent});
// }) 

app.get('/data', (req, res) => {
    const sheet = req.query.sheet
    if (sheet) {
        res.render('data', {data: getSheet(sheet)});
    } else {
        sheets = fs.readFileSync(__dirname + "/scouting.json").toString() == "" ? false : Object.keys(JSON.parse(fs.readFileSync(__dirname + "/scouting.json").toString()))
        res.render('data-home', {sheets: sheets})
    }
})

app.get('/admin', (req, res) => {
    res.render('admin', {users: getSettings().users, perms: getSettings().permissionLevels})
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

    switch (req.body.action) {
        case "getSheet":
            res.send({res: getSheet(body.sheet)});
            break
        case "addRow":
            addRowToSheet(body.sheet, body.data, Buffer.from(req.headers.authorization.substring(6), 'base64').toString().split(':')[0]);
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
            break
        case "addPerm":
            var settings = getSettings()
            settings.permissionLevels.push(body.data)
            writeSettings(settings) 
            break
        case "changeKey":
            var settings = getSettings()
            settings.eventKey = body.data
            writeSettings(settings)
            break
        case "getKey":
            res.send({res: getSettings().eventKey})
            break
        default:
            res.send({res: "Invalid Request"});
            break
    }
    
})

app.post('/admin', (req, res) => {
    const body = req.body

    switch (req.body.action) {
        case "deleteDatabase":
            var settings = getSettings()
            settings.users = []
            settings.eventKey = "NONE"
            writeSettings(settings)
            fs.writeFileSync(__dirname + "/scouting.json", JSON.stringify({}))
            break
        case "deleteDatabaseAndPerms":
            var settings = getSettings()
            settings.users = []
            settings.eventKey = "NONE"
            settings.permissionLevels = []
            writeSettings(settings)
            fs.writeFileSync(__dirname + "/scouting.json", JSON.stringify({}))
            break
        default:
            res.send({res: "Invalid Request"});
            break
    }
})

// Get Settings

function getSettings() {
    return JSON.parse(fs.readFileSync(__dirname + "/settings.json").toString())
}

function writeSettings(data) {
    fs.writeFileSync(__dirname + "/settings.json", JSON.stringify(data))
}

/* EXAMPLE OF USAGE

    var settings = getSettings()
    settings.users.push({username: "g3", password: "robotics"})
    writeSettings(settings) 

*/

function makeSheet(sheet) {
    let newJSON = JSON.parse(fs.readFileSync(__dirname + "/scouting.json").toString())
    if (!newJSON[sheet]) {
        newJSON[sheet] = {"cols":[], "rows": []}
        fs.writeFileSync(__dirname + "/scouting.json", JSON.stringify(newJSON))
        return "OK"
    } else {
        return "Sheet Already Made"
    }
}

function getSheet(sheet) {
    return JSON.parse(fs.readFileSync(__dirname + "/scouting.json").toString())[sheet]
}

function addRowToSheet(sheet, data, username) {
    data.push({name: "scout", value: username})
    let newJSON = JSON.parse(fs.readFileSync(__dirname + "/scouting.json").toString())
    for (let i=0; i < data.length; i++) {
        !newJSON[sheet].cols.includes(data[i].name) ? newJSON[sheet].cols.push(data[i].name) : ""
    }
    newJSON[sheet].rows.push(data)
    fs.writeFileSync(__dirname + "/scouting.json", JSON.stringify(newJSON))
}

function addColumnToSheet(sheet, column) {
    let newJSON = JSON.parse(fs.readFileSync(__dirname + "/scouting.json").toString())
    newJSON[sheet].cols.push(column)
    fs.writeFileSync(__dirname + "/scouting.json", JSON.stringify(newJSON))
}

function deleteRowFromSheet(sheet, row) {
    let newJSON = JSON.parse(fs.readFileSync(__dirname + "/scouting.json").toString())
    newJSON[sheet].rows.splice(row, 1)
    fs.writeFileSync(__dirname + "/scouting.json", JSON.stringify(newJSON))
}

console.log(`listening on port ${PORT}!`);
app.listen(PORT);