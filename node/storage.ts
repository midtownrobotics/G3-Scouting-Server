import * as fs from 'fs';
import { Settings } from './types';
import path from 'path';

export function getFile(relativePath: string): any {
        const file: string = fs.readFileSync(path.join(__dirname, relativePath)).toString()
        try {
                return JSON.parse(file)
        } catch {
                return file
        }
}

export function getSettings(): Settings {
        // todo: make sure the thing actually can be a settings object
        return getFile("/../storage/settings.json") as Settings
}

export function writeSettings(data: Settings) {
        fs.writeFileSync(__dirname + "/../storage/settings.json", JSON.stringify(data))
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

export function getForm(form: string): string {
        return getFile("/../storage/forms.json")[form].html
}

export function saveForm(name: string, data: Object, overwrite?: boolean) {
        let formsFile: any = getFile("/../storage/forms.json");
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
        let formsFile: any = getFile("/../storage/forms.json");
        delete formsFile[name];
        fs.writeFileSync(__dirname + "/storage/forms.json", JSON.stringify(formsFile));
}

export function deployForm(name: string, undeploy: boolean = false) {
        let formsFile: any = getFile("/../storage/forms.json");
        formsFile[name].status = undeploy ? "none" : "deployed";
        fs.writeFileSync(__dirname + "/../storage/forms.json", JSON.stringify(formsFile));
}

export function getDeployedForms(): Array<string> {
        const allForms: Array<string> = Object.keys(getFile("/../storage/forms.json"))
        let deployedForms: Array<string> = []
        for (let i = 0; i < allForms.length; i++) {
                if (getFile("/../storage/forms.json")[allForms[i]].status == "deployed") {
                        deployedForms.push(allForms[i])
                }
        }
        return deployedForms
}
