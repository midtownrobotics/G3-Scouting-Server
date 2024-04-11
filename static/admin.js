// $('.collapse-icon').parent().next().slideUp(0)

setCurrentKey()
makeMatchTable()

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

    let priorityScouting = []
    let nonPriorityScouting = []

    // Finds all matches and ranks them by priority (if applicable)
    for (let i = 0; i < matches.length; i++) {
        for (let x = 0; x < 6; x++) {
            if (matches[i].indexOf(priorityTeams[x]) > -1) {
                priorityScouting.push({match: i+1, index: matches[i].indexOf(priorityTeams[x]), team: priorityTeams[x], priority: x})
            } else {
                nonPriorityScouting.push({match: i+1, index: x, team: matches[i][x]})
            }
        }
    }

    console.log(priorityScouting.sort(JSONCompareByPriority))
    console.log(nonPriorityScouting)
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

$("#add-user").on("click", function () {
    const newName = prompt("What is this users name?");
    const newPassword = prompt("What is theis users password?");
    const perm = prompt("What is the ID of the permission they should have?")

    if (newName && newPassword && Number.isInteger(parseInt(perm)) && Math.round(perm) == perm) {
        postData({action: "addUser", data: {username: newName, password: newPassword, permissions: perm, matches: []}})
    } else {
        alert("Error making user.")
    }
})