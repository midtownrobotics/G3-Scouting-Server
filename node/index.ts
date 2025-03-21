import express, { Request } from 'express';
import http from 'http';
import TheBlueAllianceV3, { APICalls } from 'thebluealliancev3';
import { WebSocketServer } from 'ws';
import { generateSchedule, setMatch } from './assigner';
import syncDatabase from './models/syncDatabase';
import UserModel from './models/UserModel';
import { getDeployedForms, getFile, getFormHTML, getSettings, getSettingsSync, writeSettings } from './storage';
import { AdminPostRequest, GeneralPostRequest, Settings, UserGetData } from './types';
import formDataHandler from './formDataHandler';
import ResponseModel from './models/ResponseModel';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let nav: string = "";

let PORT: number = 9955;
const SCOUTING_BLOCKS = ["1-11:00", "1-11:30", "1-12:00", "1-12:30", "1-1:00", "1-1:30", "1-2:00", "1-2:30", "1-3:00", "1-3:30", "1-4:00", "1-4:30", "1-5:00", "1-5:30", "1-6:00", "1-6:30", "2-9:30", "2-10:00", "2-10:30", "2-11:00", "2-11:30", "2-12:00"]
const TIME_OFFSET = 4;

export const TBA = new TheBlueAllianceV3(getSettingsSync().apiKey);

export async function getCurrentScoutingBlock(): Promise<string | null> {
    const date = new Date();
    const minutesRounded = Math.floor(date.getMinutes() / 30) * 30
    const dayNumber = (await getSettings()).dayNumber
    if (!dayNumber) {
        console.error("No dayNumber set!")
        return null;
    }

    return dayNumber + "-" + ((date.getHours() - 1 - TIME_OFFSET) % 12 + 1).toString() + ":" + minutesRounded.toString().padStart(2, "0")
}

interface AuthReq extends Request {
    user?: UserModel
}

syncDatabase()

app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.argv.indexOf("port") > -1) {
    PORT = parseInt(process.argv[process.argv.indexOf("port") + 1])
}

app.use(async function (req: AuthReq, res, next) {

    const allUsers = await UserModel.getAllUsers()

    if (!allUsers[0] || !allUsers.find((user) => user.permissionId == 0)) {
        UserModel.addUser("admin", "password", 0)
    }

    const settings: Settings = await getSettings();

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
        const blacklist = settings.permissionLevels[user.permissionId].blacklist
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

        if (bad) {
            res.render("401", { nav });
        } else {
            req.user = user
            next();
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

app.get('/logout', (req, res) => {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="G3"');
    res.send('Unauthorized');
})

app.get('/forms', async (req: AuthReq, res) => {
    const user = req.user
    if (!user) return res.render("401");

    const form: string | undefined = req.query.form?.toString()
    const deployedForms: string[] = await getDeployedForms()

    if (form && deployedForms.includes(form)) {
        if (user.lastMatchScouted == (await getSettings()).match) {
            res.render('form-waiting', { nav })
        } else {
            res.render('form', { data: await getFormHTML(form), nav });
        }
    } else if (deployedForms.length > 0) {
        res.redirect(`/forms?form=${deployedForms[0]}`)
        // res.render('form-home', { sheets: deployedForms, nav })
    } else {
        res.render('form-home', { sheets: false, nav })
    }
})

app.get('/admin', async (req, res) => {
    const settings = await getSettings()
    const allUsers = await UserModel.getAllUsers()
    const currentResponses = await ResponseModel.findAll({ where: { matchNum: settings.match } })
    const lastResponses = await ResponseModel.findAll({ where: { matchNum: settings.match - 1 } })
    const currentEvilScouts = allUsers.filter((s) => s.assignedMatches.includes(settings.match) && !currentResponses.some((m) => m.scoutId == s.id))
    const lastEvilScouts = allUsers.filter((s) => s.assignedMatches.includes(settings.match - 1) && !lastResponses.some((m) => m.scoutId == s.id))

    res.render('admin', {
        users: allUsers,
        matchReview: {
            current: {
                responses: currentResponses,
                evilScouts: currentEvilScouts,
                number: settings.match
            },
            last: {
                responses: lastResponses,
                evilScouts: lastEvilScouts,
                number: settings.match - 1
            }
        },
        times: SCOUTING_BLOCKS,
        perms: settings.permissionLevels,
        match: settings.match,
        nav
    })
})

app.get('/', async (req: AuthReq, res) => {
    const user = req.user;
    if (!user || !user.assignments) return res.render('schedule-error', { nav });

    const currentScoutingBlock = await getCurrentScoutingBlock();
    const currentAssignment = user.assignments.findIndex((a) => a.time == currentScoutingBlock)

    let lastMatchingTime = "is over.";

    if (currentAssignment > 0) {
        if (user.assignments[currentAssignment + 1]) {
            lastMatchingTime = user.assignments[currentAssignment + 1].time
        }

        for (let i = currentAssignment + 1; i < user.assignments.length; i++) {
            if (user.assignments[i].status == user.assignments[currentAssignment].status) {
                if (!user.assignments[i + 1]) {
                    lastMatchingTime = "is over."
                } else {
                    lastMatchingTime = user.assignments[i + 1].time;
                }
            } else {
                break;
            }
        }
    }

    return res.render('user', {
        username: user.username,
        schedule: user.assignments,
        current: {
            status: currentAssignment == -1 ? "Day over!" : user.assignments[currentAssignment].status,
            until: lastMatchingTime,
            time: currentScoutingBlock
        },
        nav
    })
})

app.get('/user-get', async (req: AuthReq, res) => {
    const user = req.user
    if (!user) return res.sendStatus(403);

    const data: UserGetData = {
        name: user.username,
        lastMatchScouted: user.lastMatchScouted,
        nextMatch: user.nextMatch
    }

    return res.send(data)
})

app.get('/forms-get', (req, res) => {
    res.sendFile(__dirname + "/storage/forms.json")
})

app.post('/post', async (req: AuthReq, res) => {
    const body = req.body as GeneralPostRequest
    const sendPostResponce = (postRes: any) => res.send(postRes);

    switch (body.action) {
        case "getKey":
            sendPostResponce({ key: (await getSettings()).eventKey })
            break
        case "getDayNumber":
            sendPostResponce({ dayNumber: (await getSettings()).dayNumber })
            break
        case "getBlocks":
            sendPostResponce({ blocks: SCOUTING_BLOCKS })
            break
        case "getCurrentMatch":
            sendPostResponce({ match: (await getSettings()).match })
            break
        case "postFormData":
            formDataHandler(body.data, req.user)
            sendPostResponce({ status: 'OK' })
            break
    }

})

async function isValidUser(userObject: UserModel) {
    const settings: Settings = await getSettings()
    return (
        !!userObject.username &&
        !!userObject.password &&
        userObject.permissionId < settings.permissionLevels.length
    )
}

app.post('/admin', async (req, res) => {
    const body: AdminPostRequest = req.body

    const sendPostResponce = (postRes: object) => res.send(postRes);

    switch (body.action) {
        case "editUserField":
            {
                const users = await UserModel.getAllUsers()
                const user = users.find(p => p.id == body.data.id)
                if (!user) {
                    sendPostResponce({ status: "Bad User" });
                    return;
                }

                const field = body.data.field
                if (field == "permissionId") {
                    user[field] = parseInt(body.data.updated)
                } else {
                    user[field] = body.data.updated
                }

                if (await isValidUser(user)) {
                    user.save()
                    sendPostResponce({ status: "OK" })
                } else {
                    sendPostResponce({ status: "Bad User" });
                }
            }
            break
        case "addUser":
            {
                const settings: Settings = await getSettings()
                if (
                    !!body.data.username &&
                    !!body.data.password &&
                    body.data.permissionId < settings.permissionLevels.length
                ) {
                    UserModel.addUser(body.data.username, body.data.password, body.data.permissionId)
                    sendPostResponce({ status: "OK" })
                } else {
                    sendPostResponce({ status: "Bad User" });
                }
            }
            break
        case "deleteUser":
            await (await UserModel.findOne({ where: { id: body.data } }))?.destroy()
            sendPostResponce({ status: "OK" })
            break
        case "addPerm":
            {
                const settings: Settings = await getSettings()
                settings.permissionLevels.push({
                    name: body.data.name,
                    blacklist: body.data.blacklist
                })
                writeSettings(settings)
                sendPostResponce({ status: "OK" })
            }
            break
        case "changeKey":
            {
                const settings: Settings = await getSettings()
                settings.eventKey = body.data
                writeSettings(settings)
                sendPostResponce({ status: "OK" })
            }
            break
        case "changeDayNumber":
            {
                const settings: Settings = await getSettings()
                settings.dayNumber = body.dayNumber
                writeSettings(settings)
                sendPostResponce({ status: "OK" })
            }
            break
        case "deploySchedule":
            generateSchedule(body.schedule)
            sendPostResponce({ status: "OK" })
            break;
        case "setMatch":
            setMatch(body.match)
            sendPostResponce({ status: "OK" })
            break
        case "resetAssignedMatchData":
            UserModel.resetAssignedMatchData()
            sendPostResponce({ status: "OK" })
            break
        case "deleteRow":
            (await ResponseModel.findOne({ where: { id: body.rowId } }))?.destroy()
            break;
    }
})

app.get('/data', async (req, res) => {
    const jsonData: object[] = []
        ; (await ResponseModel.findAll()).forEach((r) => jsonData.push(r.toJSON()))

    if (jsonData.length == 0) { return res.render("404", { nav }) }

    res.render("data", { nav, data: { cols: Object.keys(jsonData[0]), rows: jsonData } })
})

app.get("*", async (req, res) => {
    res.render("404", { nav })
})

    ; (async () => {
        nav = await getFile("/../src/nav.html")
        server.listen(PORT);
        console.log(`listening on port ${PORT}! enjoy!`);
    })()