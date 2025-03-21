import ResponseModel from "./models/ResponseModel";
import { ResponseCreationAttributes } from "./models/types";
import UserModel from "./models/UserModel";
import { ResponseKeyValuePair } from "./types";
import { google } from "googleapis";
import fs from "fs";
import path from "path";

export default function (keyValuePairs: ResponseKeyValuePair[], user?: UserModel) {
    const data: { [field: string]: string } = {}

    keyValuePairs.forEach(e => {
        data[e.name] = e.value
    });

    data.scoutId = user?.id?.toString() ?? "UNKNOWN"
    data.scout = user?.username ?? "UNKNOWN"

    const typedData = data as unknown as ResponseCreationAttributes

    user?.update({ lastMatchScouted: parseInt(typedData.matchNum) })
    ResponseModel.create(typedData)
    sendDataToGoogleSheets(typedData)
}

const SERVICE_ACCOUNT_FILE = path.join(__dirname + "/../storage/gapi-service-account.json");
const SHEET_ID = "1XjeNkzz5bvoRGhfhx92peMuDdm_U5DVa6-k5Ppi4Zfw";

async function authorize() {
    return new google.auth.GoogleAuth({
        credentials: JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, "utf8")),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
}

async function sendDataToGoogleSheets(data: ResponseCreationAttributes) {
    let listData: string[] = []
    const keys = Object.keys(data) as (keyof ResponseCreationAttributes)[]

    for (let i = 0; i < keys.length; i++) {
        const theData = data[keys[i]]
        if (typeof theData == "string") listData.push(theData);
        if (typeof theData == "number") listData.push(theData.toString());
        if (typeof theData == "undefined") listData.push("");
    }

    appendToSheet([listData])
}

async function appendToSheet(data: string[][]) {
    const authClient = await authorize();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "ScoutingSWOutput!A1",
        valueInputOption: "RAW",
        requestBody: { values: data },
    });

    console.log("Data added!");
}