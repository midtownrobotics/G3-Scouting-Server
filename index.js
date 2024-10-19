"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var storage_1 = require("./storage");
var fs = __importStar(require("fs"));
var app = (0, express_1.default)();
var PORT = 8082;
app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
if (process.argv.indexOf("port") > -1) {
    PORT = parseInt(process.argv[process.argv.indexOf("port") + 1]);
}
app.use(function (req, res, next) {
    if (!(0, storage_1.getSettings)().users[0] || !(0, storage_1.getSettings)().users.find(function (user) { return user.permissions == "0"; })) {
        var settings = (0, storage_1.getSettings)();
        settings.users.push({ username: "admin", password: "password", permissions: "0" });
        (0, storage_1.writeSettings)(settings);
    }
    if (!(0, storage_1.getSettings)().permissionLevels[0]) {
        var settings = (0, storage_1.getSettings)();
        settings.permissionLevels.push({ name: "admin", blacklist: [] });
        (0, storage_1.writeSettings)(settings);
    }
    var auth = null;
    var url = req.url;
    if (url.charAt(url.length - 1) == "/") {
        url = url.substring(0, url.length - 1);
    }
    if (req.headers.authorization) {
        auth = Buffer.from(req.headers.authorization.substring(6), 'base64').toString().split(':');
    }
    var permissions;
    if (auth) {
        permissions = checkAuth(auth[0], auth[1]);
        if (permissions == "BAD USER") {
            // console.log(`User ${auth[0]} was denied access to your website!`)
        }
    }
    else {
        permissions = "BAD USER";
    }
    if (permissions == "BAD USER") {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="G3"');
        res.end('Unauthorized');
    }
    else {
        var blacklist = (0, storage_1.getSettings)().permissionLevels[permissions].blacklist;
        var bad = false;
        for (var i = 0; i < blacklist.length; i++) {
            if (url.includes(blacklist[i])) {
                bad = true;
                break;
            }
        }
        if (!bad) {
            // console.log(`User ${auth[0]} navigated to ${req.url} succesfully!`)
            next();
        }
        else {
            // console.log(`User ${auth[0]} was denied access to ${req.url}!`)
            res.render("401", { nav: (0, storage_1.getFile)('/src/nav.html') });
        }
    }
});
function checkAuth(username, password) {
    var users = (0, storage_1.getSettings)().users;
    for (var i = 0; i < users.length; i++) {
        if (users[i].username == username && users[i].password == password) {
            return parseInt(users[i].permissions);
        }
    }
    return "BAD USER";
}
app.use(express_1.default.static(__dirname + '/static/'));
app.use('/admin/formMaker', express_1.default.static(__dirname + '/src/formMaker/'));
app.get('/form.css', function (req, res) {
    res.sendFile(__dirname + '/src/formMaker/formMaker.css');
});
app.get('/logout', function (req, res) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="G3"');
    res.send('Unauthorized');
});
app.get('/forms', function (req, res) {
    var _a;
    var form = (_a = req.query.form) === null || _a === void 0 ? void 0 : _a.toString();
    if (form && (0, storage_1.getDeployedForms)().includes(form)) {
        res.render('form', { data: (0, storage_1.getForm)(form), nav: (0, storage_1.getFile)("/src/nav.html") });
    }
    else if ((0, storage_1.getDeployedForms)().length > 0) {
        res.render('form-home', { sheets: (0, storage_1.getDeployedForms)(), nav: (0, storage_1.getFile)("/src/nav.html") });
    }
    else {
        res.render('form-home', { sheets: false, nav: (0, storage_1.getFile)("/src/nav.html") });
    }
});
app.get('/data', function (req, res) {
    var _a;
    var sheet = (_a = req.query.sheet) === null || _a === void 0 ? void 0 : _a.toString();
    if (sheet) {
        res.render('data', { data: (0, storage_1.getSheet)(sheet), nav: (0, storage_1.getFile)("/src/nav.html") });
    }
    else if ((0, storage_1.getFile)("/storage/scouting.json").toString()) {
        var sheets = Object.keys((0, storage_1.getFile)("/storage/scouting.json"));
        res.render('data-home', { sheets: sheets, nav: (0, storage_1.getFile)("/src/nav.html") });
    }
    else {
        res.render('data-home', { sheets: false, nav: (0, storage_1.getFile)("/src/nav.html") });
    }
});
app.get('/data/tba', function (req, res) {
    res.render('data-tba', { nav: (0, storage_1.getFile)("/src/nav.html") });
});
app.get('/admin', function (req, res) {
    res.render('admin', { users: (0, storage_1.getSettings)().users, perms: (0, storage_1.getSettings)().permissionLevels, nav: (0, storage_1.getFile)("/src/nav.html"), data: Object.keys((0, storage_1.getFile)("/storage/scouting.json")) });
});
app.get('/', function (req, res) {
    var _a;
    var username = Buffer.from(((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.substring(6)) || "", 'base64').toString().split(':')[0];
    res.render('user', { username: username, nav: (0, storage_1.getFile)("/src/nav.html") });
});
app.get('/user-get', function (req, res) {
    var _a;
    var name = Buffer.from(((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.substring(6)) || "", 'base64').toString().split(':')[0];
    var user = (0, storage_1.getFile)("/storage/scouts.json").find(function (p) { return p.name == name; });
    var matchNumb = user.matchNumbs.reduce(function (a, b) { return Math.min(a, b); });
    var match = user.matches.find(function (m) { return m.number == matchNumb; });
    var matches = user.matches.filter(function (m) { return m.scouted == false; });
    matches.sort(function (a, b) { return (a.number > b.number ? 1 : -1); });
    var matchesAndBreaks = [];
    for (var i = 0; i < matches.length; i++) {
        matchesAndBreaks[matches[i].number - 1] = matches[i];
    }
    for (var i = 0; i < matchesAndBreaks.length; i++) {
        if (!matchesAndBreaks[i]) {
            matchesAndBreaks[i] = "break";
        }
    }
    res.send({
        name: name,
        nextMatch: {
            number: matchNumb,
            team: match === null || match === void 0 ? void 0 : match.team,
            station: match === null || match === void 0 ? void 0 : match.alliance, // Upercases first letter
            highPriority: match === null || match === void 0 ? void 0 : match.highPriority,
            form: match === null || match === void 0 ? void 0 : match.form
        },
        matches: matchesAndBreaks
    });
});
app.get('/data/analysis', function (req, res) {
    if (req.query.team && req.query.sheet) {
        var sheet = (0, storage_1.getFile)("/storage/scouting.json")[req.query.sheet.toString()];
        if (!sheet) {
            res.render('data-analysis-home', { nav: (0, storage_1.getFile)("/src/nav.html"), sheets: Object.keys((0, storage_1.getFile)("/storage/scouting.json")), error: "No sheet found!" });
            return;
        }
        sheet.rows = sheet.rows.filter(function (row) { var _a; return ((_a = row.find(function (value) { return value.name == "TeamNum"; })) === null || _a === void 0 ? void 0 : _a.value) == req.query.team; });
        if (!sheet.rows[0]) {
            res.render('data-analysis-home', { nav: (0, storage_1.getFile)("/src/nav.html"), sheets: Object.keys((0, storage_1.getFile)("/storage/scouting.json")), error: "No data found for team!" });
            return;
        }
        res.render('data-analysis', { nav: (0, storage_1.getFile)("/src/nav.html"), info: sheet, sheets: Object.keys((0, storage_1.getFile)("/storage/scouting.json")) });
    }
    else {
        res.render('data-analysis-home', { nav: (0, storage_1.getFile)("/src/nav.html"), sheets: Object.keys((0, storage_1.getFile)("/storage/scouting.json")), error: null });
    }
});
app.get('/forms-get', function (req, res) {
    res.sendFile(__dirname + "/storage/forms.json");
});
app.post('/post', function (req, res) {
    var _a, _b, _c;
    var body = req.body;
    var username = Buffer.from(((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.substring(6)) || "", 'base64').toString().split(':')[0];
    // console.log(`Action ${body.action} was posted.`)
    switch (req.body.action) {
        case "getSheet":
            res.send({ res: (0, storage_1.getSheet)(body.sheet) });
            break;
        case "addRow":
            (0, storage_1.addRowToSheet)(body.sheet, body.data, username);
            (0, storage_1.completeMatch)(body.matchNumb, username, body.sheet);
            res.send({ res: "OK" });
            break;
        case "addColumn":
            (0, storage_1.addColumnToSheet)(body.sheet, body.data);
            res.send({ res: "OK" });
            break;
        case "deleteRow":
            (0, storage_1.deleteRowFromSheet)(body.sheet, body.data);
            res.send({ res: "OK" });
            break;
        case "getKey":
            res.send({ res: (0, storage_1.getSettings)().eventKey });
            break;
        case "getScout":
            {
                var scouts = (0, storage_1.getFile)("/storage/scouts.json");
                res.send({ res: scouts.find(function (p) { return p.name == username; }) });
            }
            break;
        case "getSchedule":
            res.send({ res: (0, storage_1.getFile)("/storage/matches.json") });
            break;
        case "syncOffline":
            {
                for (var i = 0; i < Object.keys(body.data.scoutingData).length; i++) {
                    var sheetName = Object.keys(body.data.scoutingData)[i];
                    var sheet = body.data.scoutingData[sheetName];
                    for (var i_1 = 0; i_1 < sheet.rows.length; i_1++) {
                        var scoutName = (_b = sheet.rows[i_1].find(function (item) { return (item.name == "scout"); })) === null || _b === void 0 ? void 0 : _b.value;
                        var matchNumber = parseInt((_c = sheet.rows[i_1].find(function (item) { return (item.name == "matchNum"); })) === null || _c === void 0 ? void 0 : _c.value);
                        if (scoutName && matchNumber) {
                            (0, storage_1.addRowToSheet)(sheetName, sheet.rows[i_1], scoutName);
                            (0, storage_1.completeMatch)(matchNumber, scoutName, sheetName);
                        }
                    }
                }
                res.send({ res: "OK" });
            }
            break;
        default:
            res.send({ res: "Invalid Request" });
            break;
    }
});
function isValidUser(userObject) {
    var settings = (0, storage_1.getSettings)();
    if (!!userObject.username && !!userObject.password && parseInt(userObject.permissions) < settings.permissionLevels.length) {
        return true;
    }
    else {
        return false;
    }
}
app.post('/admin', function (req, res) {
    var body = req.body;
    switch (req.body.action) {
        case "deleteDatabase":
            var settings = (0, storage_1.getSettings)();
            settings.users = [];
            settings.permissionLevels = [];
            settings.eventKey = "NONE";
            (0, storage_1.writeSettings)(settings);
            fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify({}));
            fs.writeFileSync(__dirname + "/storage/matches.json", JSON.stringify({}));
            fs.writeFileSync(__dirname + "/storage/scouts.json", JSON.stringify({}));
            fs.writeFileSync(__dirname + "/storage/forms.json", JSON.stringify({}));
            res.send({ res: "OK" });
            break;
        case "deleteTable":
            (0, storage_1.deleteSheet)(body.data);
            break;
        case "editUserField":
            { // needed to declare const only used in this case
                var settings = (0, storage_1.getSettings)();
                var userIndex = settings.users.findIndex(function (p) { return p.username == body.data.name; });
                var field = body.data.field;
                settings.users[userIndex][field] = body.data.updated;
                if (isValidUser(settings.users[userIndex])) {
                    (0, storage_1.writeSettings)(settings);
                    res.send({ res: "OK" });
                }
                else {
                    res.send({ res: "Bad User" });
                }
            }
            break;
        case "setSchedule":
            fs.writeFileSync(__dirname + "/storage/matches.json", JSON.stringify(body.data));
            res.send({ res: "OK" });
            break;
        case "assignMatches":
            fs.writeFileSync(__dirname + "/storage/scouts.json", JSON.stringify(body.data));
            res.send({ res: "OK" });
            break;
        case "addUser":
            var settings = (0, storage_1.getSettings)();
            if (isValidUser(body.data)) {
                settings.users.push(body.data);
                (0, storage_1.writeSettings)(settings);
                res.send({ res: "OK" });
            }
            else {
                res.send({ res: "Bad User" });
            }
            break;
        case "deleteUser":
            { // needed to declare const only used in this case
                var settings = (0, storage_1.getSettings)();
                var userIndex = settings.users.findIndex(function (item) { return item.username === body.data; });
                settings.users.splice(userIndex, 1);
                (0, storage_1.writeSettings)(settings);
                res.send({ res: "OK" });
            }
            break;
        case "addPerm":
            var settings = (0, storage_1.getSettings)();
            settings.permissionLevels.push(body.data);
            (0, storage_1.writeSettings)(settings);
            res.send({ res: "OK" });
            break;
        case "changeKey":
            var settings = (0, storage_1.getSettings)();
            settings.eventKey = body.data;
            (0, storage_1.writeSettings)(settings);
            res.send({ res: "OK" });
            break;
        case "saveForm":
            (0, storage_1.saveForm)(body.name, body.data);
            res.send({ res: "OK" });
            break;
        case "deleteForm":
            (0, storage_1.deleteForm)(body.name);
            res.send({ res: "OK" });
            break;
        case "overwriteForm":
            (0, storage_1.saveForm)(body.name, body.data, true);
            res.send({ res: "OK" });
            break;
        case "deployForm":
            (0, storage_1.deployForm)(body.name, body.data);
            res.send({ res: "OK" });
            break;
        default:
            res.send({ res: "Invalid Request" });
            break;
    }
});
app.get("*", function (req, res) {
    res.render("404", { nav: (0, storage_1.getFile)("/src/nav.html") });
});
console.log("listening on port ".concat(PORT, "! enjoy!"));
app.listen(PORT);
