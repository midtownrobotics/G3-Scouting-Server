function TBHAPI(theUrl){
    const parsedUrl = "https://www.thebluealliance.com/api/v3" + theUrl + "?X-TBA-Auth-Key=LVDMCD06pMcEyS94sswn0hp8mGup9P2vfYhXZ6MgTgWt5oLzlNCP3RdBsm41g8Zs"
    var xmlHttp = new XMLHttpRequest();
    try { 
        xmlHttp.open( "GET", parsedUrl, false ); // false for synchronous request
        xmlHttp.send( null ) 
    } catch (err) {
        console.warn("Cannot access TBA API.")
        return "CANNOT ACCESS"
    };
    return JSON.parse(xmlHttp.responseText);
}

async function getTeams() {
    const teamsObj = TBHAPI(`/event/${await postData({action: "getKey"})}/teams`)
    let teamNumbList = [];
    let teamNameList = [];

    for (let i = 0; i < teamsObj.length; i++) {
        teamNumbList.push(teamsObj[i].team_number);
        teamNameList.push(teamsObj[i].nickname);
    }

    return {"team_numbers": teamNumbList, "team_names": teamNameList, "full_object": teamsObj};
}

async function currentMatch() {
    const matches = TBHAPI(`/event/${await postData({action: "getKey"})}/matches`)
    if (matches == "CANNOT ACCESS") {
        return "CANNOT ACCESS"
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
    const matchesObj = TBHAPI(`/event/${await postData({action: "getKey"})}/matches/simple`)
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


async function postData(data, admin = false) {
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
        return data.res
    });
}

function logoutUser() {
    fetch('/logout')
    window.location.reload();
}

function sortTable(tableId, column, reverse = false) {
    let i;
    let table = document.getElementById(tableId);
    let switching = true;

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
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}