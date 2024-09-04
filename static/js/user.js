function rotateReload() {
        $("#reload").css("transition-duration", "1s")
        $("#reload").css('transform', 'rotate(360deg)');
        setTimeout(function () {
                $("#reload").css("transition-duration", "0s")
                $("#reload").css('transform', 'rotate(0deg)');
        }, 1000)
}

function generateTable(userGet) {
        matches = userGet.matches

        $("#table").html(`                
        <tr style="font-weight: bold;" id="top-row">
            <td>Number</td>
            <td>Team Number</td>
            <td>Team Name</td>
            <td>Form</td>
            <td>Station</td>
        </tr>
    `)

        let firstNonBreak = false;

        for (let i = 0; i < matches.length; i++) {
                if (matches[i] !== "break") {

                        firstNonBreak = true;

                        $("#table").append(`
                <tr>
                    <td>${matches[i].number}</td>
                    <td>${matches[i].team}</td>
                    <td>${getTeamName(matches[i].team)}</td>
                    <td>${matches[i].form}</td>
                    <td>${matches[i].alliance.charAt(0).toUpperCase() + matches[i].alliance.slice(1)} </td>
                </tr>
            `);

                } else if (firstNonBreak == true) {

                        $("#table").append(`
                <tr class="table-primary">
                    <td colspan="5">${i + 1}</td>
                </tr>
            `);

                }
        }
}

async function getNextMatch(userGet) {
        const nextMatch = userGet.nextMatch
        const currentMatchNumber = await currentMatch()
        console.log(currentMatchNumber)

        $("#nm-until").text()
        $("#nm-number").text(nextMatch.number)
        $("#nm-team").text(nextMatch.team)
        $("#nm-teamname").text(getTeamName(nextMatch.team))
        $("#nm-station").text(nextMatch.station.charAt(0).toUpperCase() + nextMatch.station.slice(1))
        $("#nm-form").text(nextMatch.form)
        // $("#nm-hp").text(nextMatch.highPriority ? "Yes" : "No")
        $("#nm-mu").text(currentMatchNumber == "CANNOT ACCESS" ? "????" : nextMatch.number - currentMatchNumber || "Already Happened")
}

if (document.cookie.split(";").find(a => a.includes("darkMode"))?.trim().split("=")[1] != "false") {
        $("#reload").css("color", "rgb(173, 176, 179)")
}


$('#color-switcher').click(function () {
        if (!$("#color-switcher i").hasClass("bi-sun")) {
                $("#reload").css("color", "rgb(173, 176, 179)")
        } else {
                $("#reload").css("color", "rgb(39,38,38)")
        }
})

let teams = [];
getTeams().then((res) => {
        teams = res
})

function getTeamName(number) {
        return teams.team_names[teams.team_numbers.findIndex((p) => p == number)] || "????"
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

setTimeout(function () {
        reloadData()
}, 400)

setInterval(function () {
        reloadData()
        rotateReload()
}, 60000)
