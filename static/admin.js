// $('.collapse-icon').parent().next().slideUp(0)

setCurrentKey()
makeMatchTable()

indexToAlliance = [
    "red1",
    "red2",
    "red3",
    "blue1",
    "blue2",
    "blue3"
]

async function assignMatches() {
    const matches = await getMatches()
    const doNotAssign = $("#aas-dna").val().replace(/\s/g, '').split(",")
    const priorityTeams = $("#aas-hpt").val().replace(/\s/g, '').split(",")

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
    for (i = 0; i < remainingUsers.length; i++) {
        scouts.push({name: remainingUsers[i], matchNumbs: [], matches: []})
    }

    // Finds all matches and ranks them by priority (if applicable)
    let priorityScouting = []
    let nonPriorityScouting = []
    for (let i = 0; i < matches.length; i++) {
        for (let x = 0; x < 6; x++) {
            if (matches[i].indexOf(priorityTeams[x]) > -1) {
                priorityScouting.push({match: i+1, index: matches[i].indexOf(priorityTeams[x]), team: priorityTeams[x], priority: x})
            } else {
                nonPriorityScouting.push({match: i+1, index: x, team: matches[i][x]})
            }
        }
    }
    priorityScouting.sort(JSONCompareByPriority)

    // Puts all scouting matches into one object, with the priority ones first
    let allScouting = priorityScouting
    for (let i = 0; i < nonPriorityScouting.length; i++) {
        allScouting.push(nonPriorityScouting[i])
    }

    
    for (let i = 0; i < allScouting.length; i++) {
        scouts.sort(JSONCompareByNumberOfMatches)
        for (let x = 0; x < scouts.length; x++) {
            if (!scouts[x].matchNumbs.includes(allScouting[i].match)) {
                scouts[x].matchNumbs.push(allScouting[i].match)
                let highPriority = false
                if (allScouting[i].priority) {
                    highPriority = true
                }
                scouts[x].matches.push({number: allScouting[i].match, alliance: indexToAlliance[allScouting[i].index], team: allScouting[i].team, highPriority: highPriority})
                break
            }
        }
    }

    console.log(scouts)
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

async function makeMatchTable() {
    $('#match-table tbody').empty()

    const matches = await getMatches()

    for (let i = 0; i < matches.length; i++) {
        $('#match-table tbody').append(`
            <tr>
                <td><b>${i+1}</b></td>
                <td class="team">${matches[i][0]}</td>
                <td class="team">${matches[i][1]}</td>
                <td class="team">${matches[i][2]}</td>
                <td class="team">${matches[i][3]}</td>
                <td class="team">${matches[i][4]}</td>
                <td class="team">${matches[i][5]}</td>
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
        users.push( $($($('#user-table tbody').children()[i]).children()[0]).text().trim() )
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