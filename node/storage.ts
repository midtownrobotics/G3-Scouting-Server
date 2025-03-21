import * as fs from 'fs';
import { Settings } from './types';
import path from 'path';

export async function getFile(relativePath: string): Promise<any> {
    return new Promise((resolve) => {
        fs.readFile(path.join(__dirname, relativePath), (err, data) => {
            let finalData
            try {
                finalData = JSON.parse(data.toString())
            } catch {
                finalData = data.toString()
            }
            resolve(finalData)
        })
    })
}

export async function getSettings(): Promise<Settings> {
    return await getFile("/../storage/settings.json") as Settings
}

export function getSettingsSync(): Settings {
    return JSON.parse(fs.readFileSync(path.join(__dirname, "/../storage/settings.json")).toString()) as Settings
}

export function writeSettings(data: Settings) {
    fs.writeFile(__dirname + "/../storage/settings.json", JSON.stringify(data), () => {})
}

/* EXAMPLE OF USAGE

    var settings = getSettings()
    settings.users.push({username: "g3", password: "robotics"})
    writeSettings(settings) 

*/

// Called when form is submitted

// export function completeMatch(matchNumberParam: number | string, username: string, form: string) {
//         let matchNumber: number;

//         if (typeof matchNumberParam == "string") {
//                 matchNumber = parseInt(matchNumberParam)
//         } else {
//                 matchNumber = matchNumberParam
//         }

//         if (matchNumber == -1) {
//                 return;
//         }



//         // Completes match on scout profile
//         let scouts: Array<Scout> = getFile("/../storage/scouts.json");
//         const user: Scout | undefined = scouts.find((s) => s.name == username);
//         if (user) {
//                 const matchIndex: number = user.matches.findIndex((s) => s.number == matchNumber && s.form == form);
//                 if (matchIndex > -1) {
//                         user.matches[matchIndex].scouted = true;
//                         user.matchNumbs.splice(user.matchNumbs.indexOf(matchNumber), 1);
//                 }
//         }
//         fs.writeFileSync(__dirname + "/storage/scouts.json", JSON.stringify(scouts));

//         // Completes match on schedule
//         let schedule: Schedule = getFile("/../storage/matches.json");
//         let matchIndex: number = schedule.findIndex((a: ToScout) => a.match == matchNumber && a.assigned == username);
//         if (matchIndex > -1) {
//                 schedule[matchIndex].scouted = true;
//                 fs.writeFileSync(__dirname + "/storage/matches.json", JSON.stringify(schedule));
//         }

// }

// Form management

export async function getFormHTML(form: string): Promise<string> {
    return (await getFile("/../storage/forms.json"))[form].html
}

export async function getDeployedForms(): Promise<string[]> {
    const allForms: Array<string> = Object.keys(await getFile("/../storage/forms.json"))
    let deployedForms: Array<string> = []
    for (let i = 0; i < allForms.length; i++) {
        if ((await getFile("/../storage/forms.json"))[allForms[i]].status == "deployed") {
            deployedForms.push(allForms[i])
        }
    }
    return deployedForms
}
