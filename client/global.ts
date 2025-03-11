import { AdminPostRequest, AdminPostResponse, GeneralPostRequest, GeneralPostResponse } from "../node/types";
import { TeamGetRes } from "./types";

export function TBA(url: string) {
    const parsedUrl = "https://www.thebluealliance.com/api/v3" + url + "?X-TBA-Auth-Key=LVDMCD06pMcEyS94sswn0hp8mGup9P2vfYhXZ6MgTgWt5oLzlNCP3RdBsm41g8Zs"
    var xmlHttp = new XMLHttpRequest();
    try {
        xmlHttp.open("GET", parsedUrl, false); // false for synchronous request
        xmlHttp.send(null)
    } catch (err) {
        console.warn("Cannot access TBA API.")
        return null
    };
    return JSON.parse(xmlHttp.responseText);
}

export async function getTeams(): Promise<TeamGetRes> {
    const teamsObj = TBA(`/event/${await postDataGeneral({ action: "getKey" })}/teams`)
    let teamNumbList: number[] = [];
    let teamNameList: string[] = [];

    for (let i = 0; i < teamsObj.length; i++) {
        teamNumbList.push(teamsObj[i].team_number);
        teamNameList.push(teamsObj[i].nickname);
    }

    return { "teamNumbers": teamNumbList, "teamNames": teamNameList, "fullObject": teamsObj };
}

export async function currentMatch() {
    const matches = TBA(`/event/${await postDataGeneral({ action: "getKey" })}/matches`)
    if (matches == null) {
        return null
    }
    var matchesNotHappened = []
    for (let i = 0; i < matches.length; i++) {
        if (!matches[i].actual_time) {
            matchesNotHappened.push(matches[i])
        }
    }

    return matchesNotHappened[0]?.match_number;
}

async function getMatches() {
    const matchesObj = TBA(`/event/${await postDataGeneral({ action: "getKey" })}/matches/simple`)
    let matches = [];

    for (let i = 0; i < matchesObj.length; i++) {
        if (matchesObj[i].comp_level == "qm") {
            const red = matchesObj[i].alliances.red.team_keys
            const blue = matchesObj[i].alliances.blue.team_keys
            matches.push([red[0].substring(3), red[1].substring(3), red[2].substring(3), blue[0].substring(3), blue[1].substring(3), blue[2].substring(3)])
        }
    }

    return matches;
}

export async function postDataAdmin(data: AdminPostRequest, admin: boolean = false) {
    const url = admin ? "/admin/" : "/post/"
    console.log(url)
    return fetch(url, {
        method: "POST",
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(res => res.json()).then(data => {
        return data.res as AdminPostResponse
    });
}

export async function postDataGeneral(data: GeneralPostRequest, admin: boolean = false) {
    const url = admin ? "/admin/" : "/post/"
    console.log(url)
    return fetch(url, {
        method: "POST",
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(res => res.json()).then(data => {
        return data.res as GeneralPostResponse
    });
}

$(document).ready(function () {
    let darkMode = document.cookie.split(";").find(a => a.includes("darkMode"))?.trim().split("=")[1]

    if (darkMode == "true") {
        switchColor()
    } if (darkMode == undefined) {
        document.cookie = "darkMode=false; path/"
    }

})

function switchColor() {
    if ($("#color-switcher i").hasClass("bi-sun")) {
        $("#color-switcher i").removeClass("bi-sun")
        $("#color-switcher i").addClass("bi-moon")
        $("body").css("backgroundColor", "rgb(39,38,38)")
        $("h1, h3, div, body, a:not(nav a)").css("color", "rgb(173, 176, 179)")
        console.log("dark")
        document.cookie = "darkMode=true; path=/"
    } else {
        $("#color-switcher i").removeClass("bi-moon")
        $("#color-switcher i").addClass("bi-sun")
        $("body").css("backgroundColor", "rgb(173, 176, 179)")
        $("h1, h3, div, body, a:not(nav a)").css("color", "rgb(39,38,38)")
        console.log("light")
        document.cookie = "darkMode=false; path=/"
    }
}

function logoutUser() {
    fetch('/logout')
    window.location.reload();
}

function sortTable(tableId: string, column: number, reverse: boolean = false) {
    let i: number;
    const table = document.getElementById(tableId) as HTMLTableElement;
    let switching: boolean = true;

    let shouldSwitch: boolean = false;

    while (switching) {
        switching = false;
        let rows = table.rows;

        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;

            let x = rows[i].getElementsByTagName("TD")[column];
            let y = rows[i + 1].getElementsByTagName("TD")[column];

            if ((reverse ? x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase() : x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) && !Number.isFinite(parseInt(x.innerHTML))) {
                shouldSwitch = true;
                break;
            } else if (reverse ? parseInt(x.innerHTML) < parseInt(y.innerHTML) : parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i]?.parentNode?.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}
