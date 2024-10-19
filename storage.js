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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFile = getFile;
exports.getSettings = getSettings;
exports.writeSettings = writeSettings;
exports.completeMatch = completeMatch;
exports.getSheet = getSheet;
exports.deleteSheet = deleteSheet;
exports.addRowToSheet = addRowToSheet;
exports.addColumnToSheet = addColumnToSheet;
exports.deleteRowFromSheet = deleteRowFromSheet;
exports.getForm = getForm;
exports.saveForm = saveForm;
exports.deleteForm = deleteForm;
exports.deployForm = deployForm;
exports.getDeployedForms = getDeployedForms;
var fs = __importStar(require("fs"));
function getFile(relativePath) {
    var file = fs.readFileSync(__dirname + relativePath).toString();
    try {
        return JSON.parse(file);
    }
    catch (_a) {
        return file;
    }
}
function getSettings() {
    // todo: make sure the thing actually can be a settings object
    return getFile("/storage/settings.json");
}
function writeSettings(data) {
    fs.writeFileSync(__dirname + "/storage/settings.json", JSON.stringify(data));
}
/* EXAMPLE OF USAGE

    var settings = getSettings()
    settings.users.push({username: "g3", password: "robotics"})
    writeSettings(settings)

*/
// Called when form is submitted
function completeMatch(matchNumberParam, username, form) {
    var matchNumber;
    if (typeof matchNumberParam == "string") {
        matchNumber = parseInt(matchNumberParam);
    }
    else {
        matchNumber = matchNumberParam;
    }
    if (matchNumber == -1) {
        return;
    }
    // Completes match on scout profile
    var scouts = getFile("/storage/scouts.json");
    var user = scouts.find(function (s) { return s.name == username; });
    if (user) {
        var matchIndex_1 = user.matches.findIndex(function (s) { return s.number == matchNumber && s.form == form; });
        if (matchIndex_1 > -1) {
            user.matches[matchIndex_1].scouted = true;
            user.matchNumbs.splice(user.matchNumbs.indexOf(matchNumber), 1);
        }
    }
    fs.writeFileSync(__dirname + "/storage/scouts.json", JSON.stringify(scouts));
    // Completes match on schedule
    var schedule = getFile("/storage/matches.json");
    var matchIndex = schedule.findIndex(function (a) { return a.match == matchNumber && a.assigned == username; });
    if (matchIndex > -1) {
        schedule[matchIndex].scouted = true;
        fs.writeFileSync(__dirname + "/storage/matches.json", JSON.stringify(schedule));
    }
}
// Sheet management
function getSheet(sheet) {
    return getFile("/storage/scouting.json")[sheet];
}
function deleteSheet(sheet) {
    var scoutingJSON = getFile("/storage/scouting.json");
    delete scoutingJSON[sheet];
    fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify(scoutingJSON));
}
function addRowToSheet(sheet, data, username) {
    data.push({ name: "scout", value: username });
    var scoutingJSON = getFile("/storage/scouting.json");
    if (!scoutingJSON[sheet]) {
        scoutingJSON[sheet] = {
            cols: [],
            rows: []
        };
    }
    for (var i = 0; i < data.length; i++) {
        if (!scoutingJSON[sheet].cols.includes(data[i].name)) {
            scoutingJSON[sheet].cols.push(data[i].name);
        }
    }
    scoutingJSON[sheet].rows.push(data);
    fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify(scoutingJSON));
}
function addColumnToSheet(sheet, column) {
    var sheetFile = getFile("/storage/scouting.json");
    if (sheetFile[sheet].cols.includes(column)) {
        sheetFile[sheet].cols.push(column);
        fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify(sheetFile));
    }
}
function deleteRowFromSheet(sheet, row) {
    var scoutingJSON = getFile("/storage/scouting.json");
    scoutingJSON[sheet].rows.splice(row, 1);
    fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify(scoutingJSON));
}
// Form management
function getForm(form) {
    return getFile("/storage/forms.json")[form].html;
}
function saveForm(name, data, overwrite) {
    var formsFile = getFile("/storage/forms.json");
    var updatedName = name;
    var duplicateNumber = 1;
    if (!overwrite) {
        while (formsFile[updatedName]) {
            updatedName = name;
            updatedName += duplicateNumber;
            duplicateNumber++;
        }
    }
    formsFile[updatedName] = data;
    fs.writeFileSync(__dirname + "/storage/forms.json", JSON.stringify(formsFile));
}
function deleteForm(name) {
    var formsFile = getFile("/storage/forms.json");
    delete formsFile[name];
    fs.writeFileSync(__dirname + "/storage/forms.json", JSON.stringify(formsFile));
}
function deployForm(name, undeploy) {
    if (undeploy === void 0) { undeploy = false; }
    var formsFile = getFile("/storage/forms.json");
    formsFile[name].status = undeploy ? "none" : "deployed";
    fs.writeFileSync(__dirname + "/storage/forms.json", JSON.stringify(formsFile));
}
function getDeployedForms() {
    var allForms = Object.keys(getFile("/storage/forms.json"));
    var deployedForms = [];
    for (var i = 0; i < allForms.length; i++) {
        if (getFile("/storage/forms.json")[allForms[i]].status == "deployed") {
            deployedForms.push(allForms[i]);
        }
    }
    return deployedForms;
}
