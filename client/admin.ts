import * as assigner from "./assigner.js";
import { postDataAdmin, postDataGeneral } from "./global.js"

$('.collapse-icon').parent().next().slideUp(0)

setDarkMode(document.cookie.split(";").find(a => a.includes("darkMode"))?.trim().split("=")[1] != "false")

$('#color-switcher').click(function () {
    setDarkMode(!$("#color-switcher i").hasClass("bi-sun"))
})

function setDarkMode(dark: boolean) {
    if (dark) {
        $("input, select").css("background-color", "rgb(173, 176, 179)")
        $("input, select").css("border-color", "rgb(173, 176, 179)")
    } else {
        $("input, select").css("background-color", "#BFBFBF")
        $("input, select").css("border-color", "rgb(39,38,38)")
    }
}

setCurrentKey()
setEventDay()

async function setCurrentKey() {
    const res = await postDataGeneral({ action: "getKey" })
    $("#currentKey").text("Current Event: " + res.key)
}

async function setEventDay() {
    const res = await postDataGeneral({ action: "getDayNumber" })
    $("#currentDay").text("Current Day: " + res.dayNumber)
}

$('#save-settings').on('click', function () {
    if ($('#eventKey').val()) {
        postDataAdmin({ action: 'changeKey', data: $('#eventKey').val()?.toString() || "" })
        $('#eventKey').val("")
        setCurrentKey()
    }

    const newDay = $('#eventDay').val()

    if (newDay) {
        postDataAdmin({ action: 'changeDayNumber', dayNumber: parseInt(newDay.toString()) })
        $('#eventDay').val("")
        setEventDay()
    }
})

$("#setMatch").on('click', () => {
    const matchNumber = $("#matchNumber").val()
    if (!matchNumber) return;

    postDataAdmin({ action: "setMatch", match: parseInt(matchNumber.toString()) })
    setTimeout(async () => {
        window.location.reload()
    }, 1000);

    $("#setMatch").attr("disabled", "disabled")
    setTimeout(() => {
        $("#setMatch").removeAttr("disabled")
    }, 5000);
})

$('.collapse-icon-parent').on("click", function () {
    $(this).children().toggleClass('bi-caret-down-fill');
    $(this).children().toggleClass('bi-caret-up-fill');
    $(this).next().slideToggle()
    document.cookie = `{MENU}${$(this).attr('id')?.replace('-h2', '')}=${$(this).children().hasClass('bi-caret-up-fill')}; path=/admin`
})

// opens / closes to last saved position
for (let i = 0; i < document.cookie.split(";").length; i++) {
    if (document.cookie.split(";")[i].includes("{MENU}")) {
        const cookie = document.cookie.split(";")[i].trim().replace('{MENU}', '').split("=")
        if (cookie[1] == "true") {
            $(`#${cookie[0]}-h2 i`).toggleClass("bi-caret-up-fill").toggleClass("bi-caret-down-fill")
            $(`#${cookie[0]}`).slideToggle(0)
        }
    }
}

// gets last saved scroll position and goes to it after 500ms
setTimeout(function () {
    const scrollTopPos = parseInt(document.cookie.split(";").find((p) => p.includes("scroll"))?.replace("scroll=", "").trim() || "0");;

    window.scrollTo({
        top: scrollTopPos,
        left: 0,
        behavior: 'instant'
    });
}, 500)

// sets scroll position after page leave
$(window).on("unload", function () {
    document.cookie = `scroll=${Math.round(window.scrollY)}; path=/admin`
})

$("#add-perm").on("click", function () {
    const newName = prompt("What should the name of this permission be?");
    let blacklist = prompt("What pages should they not be allowed on? EX: /page1,/page2/ex")?.split(",")

    if (blacklist?.length == 1 && blacklist[0] == "") blacklist = [];

    if (newName && blacklist) {
        postDataAdmin({
            action: "addPerm",
            data: {
                name: newName,
                blacklist
            }
        }).then(function () {
            window.location.reload()
        })
    } else {
        alert("Error making permission.")
    }
})

$("#add-user").on("click", async function () {
    const newName = prompt("What is this users username?");
    const newPassword = prompt("What is this users password?");
    const perm = prompt("What is the ID of the permission they should have?")
    const permId = perm ? parseInt(perm) : null

    console.log(newName, newPassword, permId)

    if (newName && newPassword && (permId || permId == 0)) {
        postDataAdmin({
            action: "addUser", data: {
                username: newName,
                password: newPassword,
                permissionId: permId
            }
        }).then(function (res) {
            if (res.status == 'Bad User') {
                alert('Bad User!')
            } else {
                window.location.reload()
            }
        })
    } else {
        alert("Error making user.")
    }
})

$(".user-delete").on('click', function () {
    const id = $(this).parent().next().text().trim()
    if (confirm(`You are about to delete user #${id}!`)) {
        postDataAdmin({ action: "deleteUser", data: parseInt(id) }).then(function () {
            window.location.reload()
        })
    }
})

$(".user-field").on('click', function () {
    const id = $(this).parent().children().eq(1).text().trim()
    const field = $(this).closest('table').find('th').eq($(this).index()).text().trim();
    const updated = prompt(`What would you like to change user #${id}'s ${field} to?`)
    if (!updated || !(field == "username" || field == "password" || field == "permissionId")) {
        return
    }
    postDataAdmin({
        action: "editUserField",
        data: {
            id: parseInt(id),
            field: field,
            updated: updated
        }
    }).then(function (res) {
        if (res.status != "Bad User") {
            window.location.reload()
        } else {
            alert("Bad User!")
        }
    })
})

$("#resetAssignedMatchData").on('click', () => {
    const confirmation = confirm("You are about to delete data about assigned matches. This will effectivly erase scout relability data.");
    if (confirmation) {
        postDataAdmin({ action: "resetAssignedMatchData" })
    } else alert("Cancelled.")
})

assigner.init()