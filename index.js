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
        settings.permissionLevels.push({name: "admin", blacklist: ""})
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
        if (!getSettings().permissionLevels[permissions].blacklist.includes(url)) {
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

app.get('/pit', (req, res) => {
    formContent = JSON.parse(fs.readFileSync("./src/pitForm.html")).toString();

    res.render('scouting', {title: 'Pit Scouting Form', form: formContent});
}) 

app.get('/qualitative', (req, res) => {
    formContent = JSON.parse(fs.readFileSync("./src/qualitativeForm.html")).toString();

    res.render('scouting', {title: 'Qualitative Scouting Form', form: formContent});
}) 

app.get('/quantitative', (req, res) => {
    formContent = JSON.parse(fs.readFileSync("./src/quantitativeForm.html")).toString();

    res.render('scouting', {title: 'Quantitative Scouting Form', form: formContent});
}) 

app.get('/data', (req, res) => {
    res.render('data', {data: getSheet('testing-sheet')});
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
            addRowToSheet(body.sheet, body.data);
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
            fs.writeFileSync(__dirname + "/src/data/scouting.json", JSON.stringify({}))
            break
        case "deleteDatabaseAndPerms":
            var settings = getSettings()
            settings.users = []
            settings.eventKey = "NONE"
            settings.permissionLevels = []
            writeSettings(settings)
            fs.writeFileSync(__dirname + "/src/data/scouting.json", JSON.stringify({}))
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

function getSheet(sheet) {
    return JSON.parse(fs.readFileSync(__dirname + "/src/data/scouting.json").toString())[sheet]
}

function addRowToSheet(sheet, row) {
    let newJSON = JSON.parse(fs.readFileSync(__dirname + "/src/data/scouting.json").toString())
    newJSON[sheet].rows.push(row)
    fs.writeFileSync(__dirname + "/src/data/scouting.json", JSON.stringify(newJSON))
}

function addColumnToSheet(sheet, column) {
    let newJSON = JSON.parse(fs.readFileSync(__dirname + "/src/data/scouting.json").toString())
    newJSON[sheet].cols.push(column)
    fs.writeFileSync(__dirname + "/src/data/scouting.json", JSON.stringify(newJSON))
}

function deleteRowFromSheet(sheet, row) {
    let newJSON = JSON.parse(fs.readFileSync(__dirname + "/src/data/scouting.json").toString())
    newJSON[sheet].rows.splice(row, 1)
    fs.writeFileSync(__dirname + "/src/data/scouting.json", JSON.stringify(newJSON))
}

console.log(`listening on port ${PORT}!`);
app.listen(PORT);