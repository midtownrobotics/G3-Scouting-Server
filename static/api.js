function TBHAPI(theUrl){
    const parsedUrl = "https://www.thebluealliance.com/api/v3" + theUrl + "?X-TBA-Auth-Key=LVDMCD06pMcEyS94sswn0hp8mGup9P2vfYhXZ6MgTgWt5oLzlNCP3RdBsm41g8Zs"
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", parsedUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return JSON.parse(xmlHttp.responseText);
}

function getTeams(event) {
    const teamsObj = TBHAPI(`/event/${event}/teams`)
    let teamNumbList = [];
    let teamNameList = [];

    for (let i = 0; i < teamsObj.length; i++) {
        teamNumbList.push(teamsObj[i].team_number);
        teamNameList.push(teamsObj[i].nickname);
    }

    return {"team_numbers": teamNumbList, "team_names": teamNameList, "full_object": teamsObj};
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