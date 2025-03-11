import express, {Response, Request} from 'express';
import MatchModel from './models/MatchModel';
import UserModel from './models/UserModel';
import { deleteForm, deployForm, getDeployedForms, getFile, getForm, getSettings, saveForm, writeSettings } from './storage';
import { AdminPostRequest, AdminPostResponse, GeneralPostRequest, GeneralPostResponse, Settings, Station, UserGetData } from './types';
import syncDatabase from './models/syncDatabase';

const app = express();

syncDatabase()

let PORT: number = 8082;

app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.argv.indexOf("port") > -1) {
    PORT = parseInt(process.argv[process.argv.indexOf("port") + 1])
}

app.use(async function (req, res, next) {

    const allUsers = await UserModel.getAllUsers()

    if (!allUsers[0] || !allUsers.find((user) => user.permissionId == 0)) {
        UserModel.addUser("admin", "password", 0)
    }

    const settings: Settings = getSettings();

    if (!settings.permissionLevels[0]) {
        settings.permissionLevels.push({ name: "admin", blacklist: [] })
        writeSettings(settings)
    }

    let url: string = req.url;
    if (url.charAt(url.length - 1) == "/") {
        url = url.substring(0, url.length - 1)
    }

    const user = await getUserFromAuth(req.headers.authorization)

    if (!user) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="G3"');
        res.end('Unauthorized');
    } else {
        const blacklist = getSettings().permissionLevels[user.permissionId].blacklist
        let bad: boolean = false;

        if (!blacklist) {
            bad = true;
        } else {
            for (let i = 0; i < blacklist.length; i++) {
                if (url.includes(blacklist[i])) {
                    bad = true
                    break
                }
            }
        }

        if (!bad) {
            next();
        } else {
            res.render("401", { nav: getFile('/../src/nav.html') });
        }
    }
});

async function getUserFromAuth(authHeader: string | undefined): Promise<UserModel | undefined> {
    if (!authHeader) return undefined;
    const auth = Buffer.from(authHeader.substring(6), 'base64').toString().split(':');
    const username = auth[0], password = auth[1];
    const users = await UserModel.getAllUsers()
    return users.find((u) => u.username == username && u.password == password)
}

app.use(express.static(__dirname + '/../static/'));
app.use('/admin/formMaker', express.static(__dirname + '/src/formMaker/'))

app.get('/form.css', (req, res) => {
    res.sendFile(__dirname + '/src/formMaker/formMaker.css')
})

app.get('/logout', (req, res) => {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="G3"');
    res.send('Unauthorized');
})

app.get('/forms', (req, res) => {
    const form: string | undefined = req.query.form?.toString()
    if (form && getDeployedForms().includes(form)) {
        res.render('form', { data: getForm(form), nav: getFile("/../src/nav.html") });
    } else if (getDeployedForms().length > 0) {
        res.render('form-home', { sheets: getDeployedForms(), nav: getFile("/../src/nav.html") })
    } else {
        res.render('form-home', { sheets: false, nav: getFile("/../src/nav.html") })
    }
})

// app.get('/data', (req, res) => {
//     const sheet: string | undefined = req.query.sheet?.toString()
//     if (sheet) {
//         res.render('data', { data: getSheet(sheet), nav: getFile("/../src/nav.html") });
//     } else if (getFile("/../storage/scouting.json").toString()) {
//         const sheets: Array<string> = Object.keys(getFile("/../storage/scouting.json"))
//         res.render('data-home', { sheets: sheets, nav: getFile("/../src/nav.html") })
//     } else {
//         res.render('data-home', { sheets: false, nav: getFile("/../src/nav.html") })
//     }
// })

app.get('/data/tba', (req, res) => {
    res.render('data-tba', { nav: getFile("/../src/nav.html") })
})

app.get('/admin', async (req, res) => {
    res.render('admin', { users: await UserModel.getAllUsers(), perms: getSettings().permissionLevels, nav: getFile("/../src/nav.html"), data: Object.keys(getFile("/../storage/scouting.json")) })
})

app.get('/', (req, res) => {
    const username: string = Buffer.from(req.headers.authorization?.substring(6) || "", 'base64').toString().split(':')[0]
    res.render('user', { username: username, nav: getFile("/../src/nav.html") })
})

app.get('/user-get', async (req, res) => {
    const user = await getUserFromAuth(req.headers.authorization)

    if (!user) {
        res.render("401", { nav: getFile('/src/nav.html') });
        return;
    }

    const matchNumb: number | undefined = user.matches.filter((m) => !m.scouted).sort((a, b) => a.number - b.number)[0]?.number

    const match: MatchModel | undefined = user.matches.find((m) => m.number == matchNumb)
    const matches: MatchModel[] = user.matches.filter((m: MatchModel) => m.scouted == false).sort((a, b) => (a.number > b.number ? 1 : -1))

    const data: UserGetData = {
        name: user.username,
        nextMatch: {
            number: matchNumb,
            team: match?.team,
            station: match?.alliance,
            highPriority: match?.highPriority
        },
        matches
    }

    res.send(data)
})

// app.get('/data/analysis', (req, res) => {
//     if (req.query.team && req.query.sheet) {

//         let sheet: Sheet = getFile("/../storage/scouting.json")[req.query.sheet.toString()]

//         if (!sheet) {
//             res.render('data-analysis-home', { nav: getFile("/../src/nav.html"), sheets: Object.keys(getFile("/../storage/scouting.json")), error: "No sheet found!" })
//             return;
//         }

//         sheet.rows = sheet.rows.filter((row) => row.find((value) => value.name == "TeamNum")?.value == req.query.team)

//         if (!sheet.rows[0]) {
//             res.render('data-analysis-home', { nav: getFile("/../src/nav.html"), sheets: Object.keys(getFile("/../storage/scouting.json")), error: "No data found for team!" })
//             return;
//         }

//         res.render('data-analysis', { nav: getFile("/../src/nav.html"), info: sheet, sheets: Object.keys(getFile("/../storage/scouting.json")) })

//     } else {
//         res.render('data-analysis-home', { nav: getFile("/../src/nav.html"), sheets: Object.keys(getFile("/../storage/scouting.json")), error: null })
//     }
// })

app.get('/forms-get', (req, res) => {
    res.sendFile(__dirname + "/storage/forms.json")
})

app.post('/post', (req, res) => {
    const body: any = req.body as GeneralPostRequest

    const sendPostResponce = (postRes: GeneralPostResponse) => res.send(postRes);

    switch (req.body.action) {
        case "getKey":
            sendPostResponce({ key: getSettings().eventKey })
            break
        default:
            sendPostResponce("Invalid Request")
            break
    }

})

function isValidUser(userObject: UserModel) {
    const settings: Settings = getSettings()
    return (
        !!userObject.username &&
        !!userObject.password &&
        userObject.permissionId < settings.permissionLevels.length
    )
}

app.post('/admin', async (req, res) => {
    const body: AdminPostRequest = req.body

    const sendPostResponce = (postRes: AdminPostResponse) => res.send(postRes);

    switch (body.action) {
        case "editUserField":
            {
                const users = await UserModel.getAllUsers()
                const user = users.find(p => p.id == body.data.id)
                if (!user) {
                    sendPostResponce("Bad User");
                    return;
                }

                const field = body.data.field
                if (field == "permissionId") {
                    user[field] = parseInt(body.data.updated)
                } else {
                    user[field] = body.data.updated
                }

                if (isValidUser(user)) {
                    user.save()
                    sendPostResponce("OK")
                } else {
                    sendPostResponce("Bad User");
                }
            }
            break
        case "addUser":
            {
                const settings: Settings = getSettings()
                if (
                    !!body.data.username &&
                    !!body.data.password &&
                    body.data.permissionId < settings.permissionLevels.length
                ) {
                    UserModel.addUser(body.data.username, body.data.password, body.data.permissionId)
                    sendPostResponce("OK")
                } else {
                    sendPostResponce("Bad User");
                }
            }
            break
        case "deleteUser":
            UserModel.findOne({ where: { id: body.data } })
            sendPostResponce("OK")
            break
        case "addPerm":
            {
                const settings: Settings = getSettings()
                settings.permissionLevels.push({
                    name: body.data.name,
                    blacklist: body.data.blacklist
                })
                writeSettings(settings)
                sendPostResponce("OK")
            }
            break
        case "changeKey":
            {
                const settings: Settings = getSettings()
                settings.eventKey = body.data
                writeSettings(settings)
                sendPostResponce("OK")
            }
            break
        case "saveForm":
            saveForm(body.name, body.data)
            sendPostResponce("OK")
            break
        case "deleteForm":
            deleteForm(body.name)
            sendPostResponce("OK")
            break
        case "overwriteForm":
            saveForm(body.name, body.data, true)
            sendPostResponce("OK")
            break
        case "deployForm":
            deployForm(body.name, body.data)
            sendPostResponce("OK")
            break
        default:
            sendPostResponce("Invalid Request");
            break
    }
})

app.get("*", (req, res) => {
    res.render("404", { nav: getFile("/../src/nav.html") })
})

console.log(`listening on port ${PORT}! enjoy!`);
app.listen(PORT);
