function rotateReload() {
    $("#reload").css("transition-duration", "1s")
    $("#reload").css('transform','rotate(360deg)');
    setTimeout(function(){
        $("#reload").css("transition-duration", "0s")
        $("#reload").css('transform','rotate(0deg)');
    }, 1000)
}

function generateTable(userGet) {
    matches = userGet.matches

    $("#table").html(`                
        <tr style="font-weight: bold;" id="top-row">
            <td>Number</td>
            <td>Team</td>
            <td>Station</td>
            <td>High Priority</td>
        </tr>
    `)

    for(let i=0; i < matches.length; i++) { 
        if (matches[i] !== "break") {

            $("#table").append(`
                <tr>
                    <td>${matches[i].number}</td>
                    <td>${matches[i].team} </td>
                    <td>${matches[i].alliance.charAt(0).toUpperCase() + matches[i].alliance.slice(1)} </td>
                    <td>${matches[i].highPriority ? "Yes" : "No"}</td>
                </tr>
            `)

        } else { 

            $("#table").append(`
                <tr class="table-primary">
                    <td colspan="4">${i+1 }</td>
                </tr>
            `)

        } 
    } 
}

async function getNextMatch(userGet) {
    const nextMatch = userGet.nextMatch
    const teams = await getTeams()

    $("#nm-until").text()
    $("#nm-number").text(nextMatch.number)
    $("#nm-team").text(nextMatch.team)
    $("#nm-teamname").text(teams.team_names[teams.team_numbers.findIndex((p) => p == nextMatch.team)])
    $("#nm-station").text(nextMatch.station.charAt(0).toUpperCase() + nextMatch.station.slice(1))
    $("#nm-hp").text(nextMatch.highPriority ? "Yes" : "No")
    $("#nm-mu").text(nextMatch.number - (await currentMatch()) || "Already Happened")
}

async function reloadData() {
    const userGet = await fetch("/user-get/").then((res) => res.json())
    getNextMatch(userGet)
    generateTable(userGet)
}

$("#reload").click(function () {
    reloadData()
    rotateReload()
})

reloadData()

setInterval(function () {
    reloadData()
    rotateReload()
}, 60000)