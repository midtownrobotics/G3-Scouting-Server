function TBHAPI(theUrl){
    const parsedUrl = "https://www.thebluealliance.com/api/v3" + theUrl + "?X-TBA-Auth-Key=LVDMCD06pMcEyS94sswn0hp8mGup9P2vfYhXZ6MgTgWt5oLzlNCP3RdBsm41g8Zs"
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", parsedUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return JSON.parse(xmlHttp.responseText);
}

async function getTeams() {
    const teamsObj = TBHAPI(`/event/${await eventKey}/teams`)
    let teamNumbList = [];
    let teamNameList = [];

    for (let i = 0; i < teamsObj.length; i++) {
        teamNumbList.push(teamsObj[i].team_number);
        teamNameList.push(teamsObj[i].nickname);
    }

    return {"team_numbers": teamNumbList, "team_names": teamNameList, "full_object": teamsObj};
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

async function postData(data) {
    return fetch("/post/", {
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