$('.collapse-icon').parent().next().slideUp(0)

setCurrentKey()
makeMatchTable()

postData({action: "getSchedule"}).then(function(res){
    if (res !== "") {
        makeMatchTable(res)
    }
})

// List of stations to convert index 0-5 to station
indexToStation = [
    "red1",
    "red2",
    "red3",
    "blue1",
    "blue2",
    "blue3"
]

// List of alliances to convert index 0-5 to alliance
indexToAlliance = [
    "red",
    "red",
    "red",
    "blue",
    "blue",
    "blue"
]

stationToIndex = {
    "red1":0,
    "red2":1,
    "red3":2,
    "blue1":3,
    "blue2":4,
    "blue3":5
}

async function assignMatches() {
    // Gets neccicary data
    const matches = await getMatches()
    const doNotAssign = $("#aas-dna").val().replace(/\s/g, '').split(",")
    const priorityTeams = $("#aas-hpt").val().replace(/\s/g, '').split(",")
    const lengthOfBreaks = parseInt($("#aas-lob").val().replace(/\s/g, '')) || 0
    const lengthOfOnDuty = parseInt($("#aas-mbb").val().replace(/\s/g, '')) || 0
    const breakOffset = parseInt($("#aas-off").val().replace(/\s/g, '')) || 0
    const stickToOneAlliance = document.getElementById('aas-soa').checked
    const highPriorityOverBreaks = document.getElementById('aas-hob').checked
    const scoutingGroupsInput = $("#aas-sgr").val().replace(/\s/g, '').split("[")
    const manualAssignments = $("#ma-list").text().split(",")

    // makes scouting groups based on input
    let scoutingGroups = {};
    for(let i=0; i<scoutingGroupsInput.length; i++) {
        if (scoutingGroupsInput[i] !== "") {
            let justNames = scoutingGroupsInput[i].split("]")[0]
            justNames.split(",").forEach((val) => {
                scoutingGroups[val] = {id: i, alliance: !(i % 2) ? "red" : "blue"}
            })
        }
    }

    // Remove users that shouldn't be assigned matches
    let remainingUsers = getUsers()
    for (let i = 0; i < doNotAssign.length; i++) {
        const index = remainingUsers.indexOf(doNotAssign[i]);
        if (index > -1) {
            remainingUsers.splice(index, 1)
        }
    }

    // Makes scout for each user that should be scouting
    let scouts = [];
    for (let i = 0; i < remainingUsers.length; i++) { 
        scouts.push({name: remainingUsers[i], 
            matchNumbs: [], 
            matches: [], 
            breaks: [], 
            id: i, 
            assignedAlliance: scoutingGroups[remainingUsers[i]]?.alliance || "",
            group: scoutingGroups[remainingUsers[i]]?.id || "n/a"
        })
    }

    // let assignedAlliance = {red: 0, blue: 0}
    if (stickToOneAlliance) {
        for(let i = 0; i < remainingUsers.length; i+=2 ){

            if (scouts[i].assignedAlliance == "") {
                scouts[i].assignedAlliance = "blue"
            }
            // assignedAlliance.blue++

            if (!scouts[i+1]){
                break;
            }
            
            if (scouts[i+1].assignedAlliance == "") {
                scouts[i+1].assignedAlliance = "red"
            }
            // assignedAlliance.red++
        }
    }

    // if (stickToOneAlliance && assignedAlliance.blue !== assignedAlliance.red) {
    //     scouts[0].assignedAlliance = "both"
    // }

    // Finds all matches and ranks them by priority (if applicable)
    let priorityScouting = []
    let nonPriorityScouting = []
    for (let i = 0; i < matches.length; i++) {
        for (let x = 0; x < 6; x++) {
            if (priorityTeams.indexOf(matches[i][x]) > -1) {
                priorityScouting.push({match: i+1, index: x, team: matches[i][x], priority: priorityTeams.indexOf(matches[i][x])})
            } else {
                nonPriorityScouting.push({match: i+1, index: x, team: matches[i][x]})
            }
        }
    }

    // Puts all scouting matches into one object, with the priority ones first
    let allScouting = [];
    Array.prototype.push.apply(allScouting, [...priorityScouting].sort(JSONCompareByPriority))
    Array.prototype.push.apply(allScouting, nonPriorityScouting)

    // Assigns all manually assigned matches
    for (let i = 0; i < manualAssignments.length; i++) {
        if(manualAssignments[i] == "") {
            continue;
        }

        const info = manualAssignments[i].split(":")
        const scout = scouts.findIndex((scout) => scout.name == info[2])

        scouts[scout].matchNumbs.push(parseInt(info[0]))
        scouts[scout].matches.push({
            alliance: info[1].toLowerCase(),
            highPriority: false,
            number: parseInt(info[0]),
            scouted: false,
            team: matches[info[0]-1][stationToIndex[info[1].toLowerCase()]]
        })
        allScouting.find((team) => (team.match == info[0] && team.index == stationToIndex[info[1].toLowerCase()])).assigned = info[2]
    }

    // Assignes matches
    for (let i = 0; i < allScouting.length; i++) {
        const matchNumb = allScouting[i].match
        scouts.sort(JSONCompareByNumberOfMatches)
        for (let x = 0; x < scouts.length; x++) {
            let highPriority = false
            if (allScouting[i].priority !== undefined) {
                highPriority = true
            }

            const offsetNumber = scouts[x].group !== "n/a" ? scouts[x].group-1 : scouts[x].id

            const onBreak = (highPriority && highPriorityOverBreaks) ? false : (((matchNumb+offsetNumber*breakOffset) % (lengthOfOnDuty + lengthOfBreaks)) - (lengthOfBreaks-1)) <= 0
            const correctAlliance = stickToOneAlliance ? (scouts[x].assignedAlliance == indexToAlliance[allScouting[i].index] || scouts[x].assignedAlliance == "both") : true

            const shouldAssignMatch = !onBreak && correctAlliance && !scouts[x].matchNumbs.includes(matchNumb) && !allScouting[i].assigned

            if (shouldAssignMatch) {
                allScouting[i].assigned = scouts[x].name
                scouts[x].matchNumbs.push(matchNumb)
                scouts[x].matches.push({number: matchNumb, alliance: indexToStation[allScouting[i].index], team: allScouting[i].team, highPriority: highPriority, scouted: false})
                break
            }
        }
    }

    // Finds breaks and adds them to scout
    const allMatchNumbers = Array.from(Array(matches.length).keys(), ((x) => x+1)) // Makes array of every match by number
    for (let i = 0; i < scouts.length; i++) {
        scouts[i].breaks = allMatchNumbers.filter(x => !scouts[i].matchNumbs.includes(x));
    }

    const matchesCovered = Math.round((matches.length*6 - [...allScouting].filter((el) => !el.assigned).length) / (matches.length * 6) * 1000)/10
    const priorityMatches = [...allScouting].filter((el) => el.priority !== undefined)
    const priorityCovered = Math.round((priorityMatches.length - priorityMatches.filter((el) => !el.assigned).length) / (priorityMatches.length) * 1000)/10
    const averageNumberOfMatches = Math.round(scouts.map(value => value.matchNumbs.length).reduce((a,b) => a+b) / scouts.length * 10)/10;
    const averageNumberOfBreaks = Math.round(scouts.map(value => value.breaks.length).reduce((a,b) => a+b) / scouts.length * 10)/10;

    $('#aas-results').html(`
        <br>
        <h4>Results:</h4>
        <a>Percent of all matches scouted: ${matchesCovered}%</a><br>
        <a>Average number of matches: ${averageNumberOfMatches}</a><br>
        <a>Average number of breaks: ${averageNumberOfBreaks}</a><br>
        ${(priorityCovered) ? ("<a>Percent of priority matches scouted: "+priorityCovered+"%</a>") : ""}
    `)

    makeMatchTable([...allScouting].sort(JSONCompareByMatchNumber), "simulator-table")

    return {scouts: scouts, matches: allScouting}
}

async function makeMatchTable(matchesScouting, tableId = "match-table") {
    $('#'+tableId+' tbody').empty()

    const matches = await getMatches()

    for (let i = 0; i < matches.length; i++) {
        let rows = "";
        if (!matchesScouting) {
            for (let x = 0; x < 6; x++) {
                rows += `<td>${matches[i][x]}</td>`
            }
        } else {
            for (let x = 0; x < 6; x++) {
                const assigned = matchesScouting.filter((el) => el.match == i+1).find((el) => el.index == x).assigned;
                if (assigned == undefined) {
                    rows += `<td class="team table-danger">${matches[i][x]}</td>`
                } else {
                    rows += `<td class="team">${matches[i][x]}: ${assigned}</td>`
                }
            }
        }

        $('#'+tableId+' tbody').append(`
            <tr>
                <td><b>${i+1}</b></td>
                ${rows}
            </tr>
        `)
    }

    $('.team').on('click', function () {
        const matchNumber = $(this).closest('tr').children().first().children('b').text()
        const alliance = $(this).index()-1
    })
}

$('#aas-sgr').on('input', function(){
    if($(this).val() !== "") {
        $("#aas-soa").prop('checked', true)
        $("#aas-soa").prop('disabled', true)
    } else {
        $("#aas-soa").prop('disabled', false)
    }
})

$("#ma-add").on('click', function(){
    const station = $('#ma-station').val()
    const person = $('#ma-person').val()
    const match = $('#ma-match').val()
    if(station && person && match) {
        $("#ma-list").append('<span class="ma-item">' + ($("#ma-list").text() ? ", " : "") + match + ":" + station + ":" + person + "</span>")
    }
})

$("#ma-list").on('click', '.ma-item', function(){
    $(this).remove()
    if($("#ma-list").children().first().text().includes(", ")) {
        $("#ma-list").children().first().text($("#ma-list").children().first().text().substring(2))
    }
})

async function setCurrentKey() {
    $("#currentKey").text("Current Event: " + await postData({action: "getKey"}))
}

function getUsers() {
    let users = []
    for (i = 0 ; i < $('#user-table tbody').children().length; i++) {
        users.push( $($($('#user-table tbody').children()[i]).children()[1]).text().trim() )
    }

    return users;
}

$('#aas-button').on('click', function(){
    assignMatches()
})

$('#save-settings').on('click', function() {
    if ($('#eventKey').val() !== "") {
        postData({action: 'changeKey', data: $('#eventKey').val()}, true)
        $('#eventKey').val("")
        setCurrentKey()
    }
})

$('.collapse-icon-parent').on("click", function() {
    $(this).children().toggleClass('bi-caret-down-fill');
    $(this).children().toggleClass('bi-caret-up-fill');
    $(this).next().slideToggle()
    document.cookie = `{MENU}${$(this).attr('id').replace('-h2', '')}=${$(this).children().hasClass('bi-caret-up-fill')}; path=/admin`
})

// opens / closes to last saved position
for (let i=0; i < document.cookie.split(";").length; i++) {
    if (document.cookie.split(";")[i].includes("{MENU}")) {
        const cookie = document.cookie.split(";")[i].trim().replace('{MENU}', '').split("=")
        if (cookie[1] == "true") {
            $(`#${cookie[0]}-h2 i`).toggleClass("bi-caret-up-fill").toggleClass("bi-caret-down-fill")
            $(`#${cookie[0]}`).slideToggle(0)
        }
    }
}

// gets last saved scroll position and goes to it after 500ms
setTimeout(function(){
    let scrollTopPos;
    try {
        scrollTopPos = parseInt(document.cookie.split(";").find((p) => p.includes("scroll")).replace("scroll=", "").trim());
    } catch (err) {
        scrollTopPos = 0;
    }
    window.scrollTo({
        top: scrollTopPos,
        left: 0,
        behavior: 'instant'
    });
}, 500)

// sets scroll position after page leave
$(window).on( "unload", function(){
    document.cookie = `scroll=${Math.round(window.scrollY)}; path=/admin`
})

$("#add-perm").on("click", function() {
    const newName = prompt("What should the name of this permission be?");
    let blackList = prompt("What pages should they not be allowed on? EX: /page1,/page2/ex");

    blackList = blackList.split(",")

    if (newName && blackList) {
        postData({action: "addPerm", data: {
            name: newName, 
            blacklist: blackList
        }}, true).then(function () {
            window.location.reload()
        })
    } else {
        alert("Error making permission.")
    }
})

$("#add-user").on("click", async function () {
    const newName = prompt("What is this users name?");
    const newPassword = prompt("What is theis users password?");
    const perm = prompt("What is the ID of the permission they should have?")

    if (newName && newPassword && Number.isInteger(parseInt(perm)) && Math.round(perm) == perm) {
        postData({action: "addUser", data: {
                username: newName, 
                password: newPassword, 
                permissions: perm
            }
        }, true).then(function(res) {
            if (res == 'Bad User') {
                alert('Bad User!')
            } else {
                window.location.reload()
            }
        })
    } else {
        alert("Error making user.")
    }
})

// $(".perm-delete").on('click', function() {
//     const id = $(this).parent().next().text().trim()
//     confirm(`You are about to permission #${id}!`)
// })

$(".user-delete").on('click', function() {
    const name = $(this).parent().next().text().trim()
    if (confirm(`You are about to delete user ${name}!`)) {
        postData({action: "deleteUser", data: name}, true).then(function () {
            window.location.reload()
        })
    }
})

$(".user-field").on('click', function() {
    const name = $(this).parent().children().eq(1).text().trim()
    const field = $(this).closest('table').find('th').eq($(this).index()).text().trim();
    const updated = prompt(`What would you like to change ${name}'s ${field} to?`)
    if (!updated) {
        return
    }
    postData({
        action: "editUserField", 
        data: {
            name: name, 
            field: field, 
            updated: updated
        }
    }, true).then(function(res) {
        if (res != "Bad User") {
            window.location.reload()
        } else {
            alert("Bad User!")
        }
    })
})

$("#clear-database").on('click', function(){
    if (confirm("You are about to delete the whole database. This includes all scouting data, users, perms, schedules, scouts, and settings. HIGHLY DESTRUCTIVE!!!")) {
        if (prompt("Please type 'Delete Everything' if you REALLY want to reset the database!!") == 'Delete Everything') {
            postData({
                action: "deleteDatabase"
            }, true).then((res) => {
                if (res == "OK") {
                    alert("Succesfully deleted database.")
                    window.location.reload()
                }
            })
            return
        }
    }
    alert("ERROR: Database NOT deleted!")
})

// $("#clear-database-perm").on('click', function(){
//     if (confirm("You are about to delete the whole database. This includes all scouting data, users, permissions, and settings. HIGHLY DESTRUCTIVE!!!")) {
//         if (prompt("Please type 'Delete Everything' if you REALLY want to reset the database!!") == 'Delete Everything') {
//             alert("Succesfully deleted database. Contact server administrator to restore data.")
//             postData({action: "deleteDatabaseAndPerms"}, true)
//         }
//     }
// })

$("#aad-button").on('click', async function () {
    if (confirm("You are about to deploy the current schedule based on the selected parameters. This will overright any current schedule and become effective immediately.")) {
        const assignMatchesObj = await assignMatches()
        postData({action: "assignMatches", data: assignMatchesObj.scouts}, true)
        postData({action: "setSchedule", data: assignMatchesObj.matches}, true)
    }
})

function JSONCompareByNumberOfMatches(a, b) {
    if (a.matchNumbs.length < b.matchNumbs.length) {
        return -1;
    }
    if (a.matchNumbs.length > b.matchNumbs.length) {
        return 1;
    }
    return 0;
}

function JSONCompareByPriority(a, b) {
    if (a.priority < b.priority) {
      return -1;
    }
    if (a.priority > b.priority) {
      return 1;
    }
    return 0;
}

function JSONCompareByMatchNumber(a, b) {
    if (a.match < b.match) {
        return -1;
    }
    if (a.match > b.match) {
        return 1;
    }
    return 0;
}