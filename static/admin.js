// $('.collapse-icon').parent().next().slideUp(0)

setCurrentKey()
makeMatchTable()

// List of stations to convert index 0-5 to station
indexToStation = [
    "red1",
    "red2",
    "red3",
    "blue1",
    "blue2",
    "blue3"
]

async function assignMatches() {
    // Gets neccicary data
    const matches = await getMatches()
    const doNotAssign = $("#aas-dna").val().replace(/\s/g, '').split(",")
    const priorityTeams = $("#aas-hpt").val().replace(/\s/g, '').split(",")
    const lengthOfBreaks = parseInt($("#aas-lob").val().replace(/\s/g, '')) || 0
    const lengthOfOnDuty = parseInt($("#aas-mbb").val().replace(/\s/g, '')) || 0
    const breakOffset = parseInt($("#aas-off").val().replace(/\s/g, '')) || 0

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
        scouts.push({name: remainingUsers[i], matchNumbs: [], matches: [], breaks: [], id: i})
    }

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

    // Assignes matches
    for (let i = 0; i < allScouting.length; i++) {
        const matchNumb = allScouting[i].match
        scouts.sort(JSONCompareByNumberOfMatches)
        for (let x = 0; x < scouts.length; x++) {
            let highPriority = false
            if (allScouting[i].priority !== undefined) {
                highPriority = true
            }

            const onBreak = (((matchNumb+scouts[x].id*breakOffset) % (lengthOfOnDuty + lengthOfBreaks)) - (lengthOfBreaks-1)) <= 0

            if ((!onBreak || highPriority) && !scouts[x].matchNumbs.includes(matchNumb) && !allScouting[i].assigned) {
                allScouting[i].assigned = scouts[x].name
                scouts[x].matchNumbs.push(matchNumb)
                scouts[x].matches.push({number: matchNumb, alliance: indexToStation[allScouting[i].index], team: allScouting[i].team, highPriority: highPriority})
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

    $('#aas-results').html(`
        <br>
        <h4>Results:</h4>
        <p>Percent of all matches scouted: ${matchesCovered}%</p>
        ${(priorityCovered) ? ("<p>Percent of priority matches scouted: "+priorityCovered+"%</p>") : ""}
    `)

    makeMatchTable([...allScouting].sort(JSONCompareByMatchNumber))
}

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

async function makeMatchTable(matchesScouting) {
    $('#match-table tbody').empty()

    const matches = await getMatches()

    for (let i = 0; i < matches.length; i++) {
        let rows;
        if (!matchesScouting) {
            for (let x = 0; x < 6; x++) {
                rows += `<td>${matches[i][x]}</td>`
            }
        } else {
            for (let x = 0; x < 6; x++) {
                const assigned = matchesScouting.filter((el) => el.match == i+1).find((el) => el.index == x).assigned;
                if (assigned == undefined) {
                    rows += `<td class="table-danger">${matches[i][x]}</td>`
                } else {
                    rows += `<td>${matches[i][x]}: ${assigned}</td>`
                }
            }
        }

        $('#match-table tbody').append(`
            <tr>
                <td><b>${i+1}</b></td>
                ${rows}
            </tr>
        `)
    }

    $('.team').on('click', function () {
        console.log($(this).text())
    })
}

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
        postData({action: 'changeKey', data: $('#eventKey').val()})
        $('#eventKey').val("")
        setCurrentKey()
    }
})

$('.collapse-icon').on("click", function() {
    $(this).toggleClass('bi-caret-down-fill');
    $(this).toggleClass('bi-caret-up-fill');
    $(this).parent().next().slideToggle()
})

$("#add-perm").on("click", function() {
    const newName = prompt("What should the name of this permission be?");
    let blackList = prompt("What pages should they not be allowed on? EX: /page1,/page2/ex");

    blackList = blackList.split(",")

    if (newName && blackList) {
        postData({action: "addPerm", data: {name: newName, blacklist: blackList}})
    } else {
        alert("Error making permission.")
    }
})

$("#add-user").on("click", async function () {
    const newName = prompt("What is this users name?");
    const newPassword = prompt("What is theis users password?");
    const perm = prompt("What is the ID of the permission they should have?")

    if (newName && newPassword && Number.isInteger(parseInt(perm)) && Math.round(perm) == perm) {
        await postData({action: "addUser", data: {username: newName, password: newPassword, permissions: perm, matches: []}})
        window.location.reload()
    } else {
        alert("Error making user.")
    }
})

$(".perm-delete").on('click', function() {
    const id = $(this).parent().next().text().trim()
    confirm(`You are about to permission #${id}!`)

})

$(".user-delete").on('click', function() {
    const name = $(this).parent().next().text().trim()
    confirm(`You are about to delete user ${name}!`)
})