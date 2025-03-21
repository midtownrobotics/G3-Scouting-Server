import { APICalls, MatchSimple } from "thebluealliancev3";
import { getCurrentScoutingBlock, TBA } from ".";
import UserModel from "./models/UserModel";
import { getSettings, writeSettings } from "./storage";
import { Schedule } from "./types";

let matches: MatchSimple[] = [];

export let assignedScouts: UserModel[] = []

export async function generateSchedule(schedule: Schedule) {
    const userIds = Object.keys(schedule);

    for (let i = 0; i < userIds.length; i++) {
        const user = await UserModel.findOne({ where: { id: parseInt(userIds[i]) } })
        if (!user) continue;
        user?.update({ assignments: schedule[userIds[i]].assignments })
        user?.update({ assignedAlliance: schedule[userIds[i]].alliance })
    }

    const settings = await getSettings()
    settings.match = 0
    writeSettings(settings)
}

export async function setMatch(matchNumber: number) {
    if (!matches || matches.length <= 0) {
        console.log("Re-fetching match data from TBA...")
        matches = await TBA.get({ call: APICalls.event.matches.simple, event_key: (await getSettings()).eventKey });
        console.log("Done!")
    }

    const match = matches.find((m) => m.match_number == matchNumber && m.comp_level == "qm")
    if (!match) {
        console.error(`ERROR: Could not find data for match #${matchNumber}`)
        return
    }
    const currentScoutingBlock = await getCurrentScoutingBlock();
    const blueTeams = match.alliances.blue.team_keys;
    const redTeams = match.alliances.red.team_keys
    const avalibleScouts = (await UserModel.getAllUsers()).filter((u) => u.assignments?.find((a) => a.time == currentScoutingBlock))
    const redScouts = avalibleScouts.filter((u) => u.assignedAlliance == "red")
    const blueScouts = avalibleScouts.filter((u) => u.assignedAlliance == "blue")

    assignedScouts = avalibleScouts

    for (let i = 0; i < redScouts.length; i++) {
        const currentMatches = redScouts[i].assignedMatches
        redScouts[i].update({
            nextMatch: {
                number: matchNumber,
                team: parseInt(redTeams[i % 3].slice(3))
            },
            assignedMatches: [...currentMatches, matchNumber]
        })
    }

    for (let i = 0; i < blueScouts.length; i++) {
        const currentMatches = blueScouts[i].assignedMatches
        blueScouts[i].update({
            nextMatch: {
                number: matchNumber,
                team: parseInt(blueTeams[i % 3].slice(3))
            },
            assignedMatches: [...currentMatches, matchNumber]
        })
    }

    const settings = await getSettings()
    settings.match = matchNumber
    writeSettings(settings)
}