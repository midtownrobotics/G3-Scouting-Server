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

export function completeMatch(matchNumberParam: number | string, username: string) {
    let matchNumber: number;

    if (typeof matchNumberParam == "string") {
        matchNumber = parseInt(matchNumberParam)
    } else {
        matchNumber = matchNumberParam
    }

    let scouts: Array<Scout> = getFile("/storage/scouts.json")
    const user: Scout | undefined = scouts.find((s) => s.name == username)
    if (user) {
        const matchIndex: number = user.matches.findIndex((s) => s.number == matchNumber)
        if (matchIndex > -1) {
            user.matches[matchIndex].scouted = true
            user.matchNumbs.splice(user.matchNumbs.indexOf(matchNumber), 1)
        }
    }
    fs.writeFileSync(__dirname+"/storage/scouts.json", JSON.stringify(scouts))
}

export function getSheet(sheet: string) {
    return getFile("/storage/scouting.json")[sheet]
}

export function addRowToSheet(sheet: string, data: Row, username: string) {
    data.push({name: "scout", value: username})
    let newJSON: any = getFile("/storage/scouting.json")
    if (!newJSON[sheet]) {
        newJSON[sheet] = {
            cols: [],
            rows: []
        }
    }
    for (let i=0; i < data.length; i++) {
        if (!newJSON[sheet].cols.includes(data[i].name)) { 
            newJSON[sheet].cols.push(data[i].name)
        }
    }
    newJSON[sheet].rows.push(data)
    fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify(newJSON))
}

export function addColumnToSheet(sheet: string, column: string) {
    let sheetFile: any = getFile("/storage/scouting.json")
    if (sheetFile[sheet].cols.includes(column)) {
        sheetFile[sheet].cols.push(column)
        fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify(sheetFile))
    }
}

export function deleteRowFromSheet(sheet: string, row: string) {
    let newJSON: any = getFile("/storage/scouting.json")
    newJSON[sheet].rows.splice(row, 1)
    fs.writeFileSync(__dirname + "/storage/scouting.json", JSON.stringify(newJSON))
}