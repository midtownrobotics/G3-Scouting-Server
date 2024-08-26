import * as fs from 'fs';

export type Settings = {
    eventKey: string;
    users: Array<User>;
    permissionLevels: Array<Permission>;
}

export type User = {
    username: string;
    password: string;
    permissions: string;
}

type Permission = {
    name: string;
    blacklist: Array<string>;
}

export type Scout = {
    name: string;
    matchNumbs: Array<number>;
    matches: Array<AssignedMatch>;
    breaks: Array<number>;
    id: number;
    assignedAlliance: "blue" | "red" | "";
    group: number | "n/a";
}

export type AssignedMatch = {
    number: number;
    alliance: "blue1" | "blue2" | "blue3" | "red1" | "red2" | "red3";
    team: string;
    highPriority: boolean;
    scouted: boolean;
    form: string;
}

export type Sheet = {
    cols: Array<string>;
    rows: Array<Row>;
}

export type Row = Array<Value>

type Value = {
    name: string;
    value: any;
}

export function getFile(relativePath: string): any {
    const file: string = fs.readFileSync(__dirname + relativePath).toString()
    try {
        return JSON.parse(file)
    } catch {
        return file
    }
}

export function getSettings(): Settings {
    // todo: make sure the thing actually can be a settings object
    return getFile("/storage/settings.json") as Settings
}

export function writeSettings(data: Settings) {
    fs.writeFileSync(__dirname + "/storage/settings.json", JSON.stringify(data))
}

/* EXAMPLE OF USAGE

    var settings = getSettings()
    settings.users.push({username: "g3", password: "robotics"})
    writeSettings(settings) 

*/

export function completeMatch(matchNumberParam: number | string, username: string, form: string) {
    let matchNumber: number;

    if (typeof matchNumberParam == "string") {
        matchNumber = parseInt(matchNumberParam)
    } else {
        matchNumber = matchNumberParam
    }

    let scouts: Array<Scout> = getFile("/storage/scouts.json")
    const user: Scout | undefined = scouts.find((s) => s.name == username)
    if (user) {
        const matchIndex: number = user.matches.findIndex((s) => s.number == matchNumber && s.form == form)
        if (matchIndex > -1) {
            user.matches[matchIndex].scouted = true
            user.matchNumbs.splice(user.matchNumbs.indexOf(matchNumber), 1)
        }
    }
    fs.writeFileSync(__dirname+"/storage/scouts.json", JSON.stringify(scouts))
}

// Sheet management

export function getSheet(sheet: string): any {
    return getFile("/storage/scouting.json")[sheet]
}

export function deleteSheet(sheet: string) {
    let scoutingJSON: any = getFile("/storage/scouting.json")
    delete scoutingJSON[sheet]
    fs.writeFileSync(__dirname+"/storage/scouting.json", JSON.stringify(scoutingJSON))
}

export function addRowToSheet(sheet: string, data: Row, username: string) {
    data.push({name: "scout", value: username})
    let scoutingJSON: any = getFile("/storage/scouting.json")
    if (!scoutingJSON[sheet]) {
        scoutingJSON[sheet] = {
            cols: [],
            rows: []
        }
    }
    for (let i=0; i < data.length; i++) {
        if (!scoutingJSON[sheet].cols.includes(data[i].name)) { 
            scoutingJSON[sheet].cols.push(data[i].name)
        }
    }
    scoutingJSON[sheet].rows.push(data)
    fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify(scoutingJSON))
}

export function addColumnToSheet(sheet: string, column: string) {
    let sheetFile: any = getFile("/storage/scouting.json")
    if (sheetFile[sheet].cols.includes(column)) {
        sheetFile[sheet].cols.push(column)
        fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify(sheetFile))
    }
}

export function deleteRowFromSheet(sheet: string, row: string) {
    let scoutingJSON: any = getFile("/storage/scouting.json")
    scoutingJSON[sheet].rows.splice(row, 1)
    fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify(scoutingJSON))
}

// Form management

export function getForm(form: string): string {
    return getFile("/storage/forms.json")[form].html
}

export function saveForm(name: string, data: Object, overwrite?: boolean) {
    let formsFile: any = getFile("/storage/forms.json");
    let updatedName: string = name;
    let duplicateNumber: number = 1;
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

export function deleteForm(name: string) {
    let formsFile: any = getFile("/storage/forms.json");
    delete formsFile[name];
    fs.writeFileSync(__dirname + "/storage/forms.json", JSON.stringify(formsFile));
}

export function deployForm(name: string, undeploy: boolean = false) {
    let formsFile: any = getFile("/storage/forms.json");
    formsFile[name].status = undeploy ? "none" : "deployed";
    fs.writeFileSync(__dirname + "/storage/forms.json", JSON.stringify(formsFile));
}

export function getDeployedForms(): Array<string> {
    const allForms: Array<string> = Object.keys(getFile("/storage/forms.json"))
    let deployedForms: Array<string> = []
    for (let i = 0; i < allForms.length; i++) {
        if (getFile("/storage/forms.json")[allForms[i]].status == "deployed") {
            deployedForms.push(allForms[i])
        }
    }
    return deployedForms
}