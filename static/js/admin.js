var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
import { postDataAdmin, postDataGeneral } from "./global.js";
$('.collapse-icon').parent().next().slideUp(0);
setDarkMode(((_a = document.cookie.split(";").find(a => a.includes("darkMode"))) === null || _a === void 0 ? void 0 : _a.trim().split("=")[1]) != "false");
$('#color-switcher').click(function () {
    setDarkMode(!$("#color-switcher i").hasClass("bi-sun"));
});
function setDarkMode(dark) {
    if (dark) {
        $("input, select").css("background-color", "rgb(173, 176, 179)");
        $("input, select").css("border-color", "rgb(173, 176, 179)");
    }
    else {
        $("input, select").css("background-color", "#BFBFBF");
        $("input, select").css("border-color", "rgb(39,38,38)");
    }
}
setCurrentKey();
// makeMatchTable()
// postData({ action: "getSchedule" }).then(function (res) {
//         if (res !== "") {
//                 makeMatchTable(res)
//         }
// })
// function getSchedule() {
//         return postData({ action: "getSchedule" }).then((res) => {
//                 console.log(res)
//                 return res
//         })
// }
// function loadSettings(settings) {
//         let settingsBoxes = Object.keys(settings)
//         for (let i = 0; i < settingsBoxes.length; i++) {
//                 let settingHTML = $(`#${settingsBoxes[i]}`) as JQuery<HTMLInputElement>
//                 if (settingHTML.hasClass("form-check-input")) {
//                         if (settingHTML[0].checked !== settings[settingsBoxes[i]]) {
//                                 settingHTML.click()
//                         }
//                 } else {
//                         settingHTML.val(settings[settingsBoxes[i]])
//                 }
//         }
// }
const stations = [
    "red1",
    "red2",
    "red3",
    "blue1",
    "blue2",
    "blue3"
];
// async function makeMatchTable(matchesScouting: Match[], tableId = "match-table") {
//         $('#' + tableId + ' tbody').empty()
//         const matches = await getMatches()
//         for (let i = 0; i < matches.length; i++) {
//                 let rows = "";
//                 if (!matchesScouting) {
//                         for (let x = 0; x < 6; x++) {
//                                 rows += `<td>${matches[i][x]}</td>`
//                         }
//                 } else {
//                         for (let x = 0; x < 6; x++) {
//                                 const assigned = matchesScouting?.filter((m) => m.number == i + 1).find((el) => el.station == stations[x])?.;
//                                 if (assigned == undefined) {
//                                         rows += `<td class="team table-danger">${matches[i][x]}</td>`
//                                 } else {
//                                         rows += `<td class="team">${matches[i][x]}: ${assigned}</td>`
//                                 }
//                         }
//                 }
//                 $('#' + tableId + ' tbody').append(`
//             <tr>
//                 <td><b>${i + 1}</b></td>
//                 ${rows}
//             </tr>
//         `)
//         }
// }
$('#aas-equ').on('input', function () {
    $("#qualitativeOptions").slideToggle();
});
$("#qualitativeOptions").slideToggle();
$('#aas-sgr').on('input', function () {
    if ($(this).val() !== "") {
        $("#aas-soa").prop('checked', true);
        $("#aas-soa").prop('disabled', true);
    }
    else {
        $("#aas-soa").prop('disabled', false);
    }
});
$("#ma-add").on('click', function () {
    const station = $('#ma-station').val();
    const person = $('#ma-person').val();
    const match = $('#ma-match').val();
    if (station && person && match) {
        $("#ma-list").append('<span class="ma-item">' + ($("#ma-list").text() ? ", " : "") + match + ":" + station + ":" + person + "</span>");
    }
});
$("#ma-list").on('click', '.ma-item', function () {
    $(this).remove();
    if ($("#ma-list").children().first().text().includes(", ")) {
        $("#ma-list").children().first().text($("#ma-list").children().first().text().substring(2));
    }
});
function setCurrentKey() {
    return __awaiter(this, void 0, void 0, function* () {
        $("#currentKey").text("Current Event: " + (yield postDataGeneral({ action: "getKey" })));
    });
}
$('#save-settings').on('click', function () {
    var _a;
    if ($('#eventKey').val() !== "") {
        postDataAdmin({ action: 'changeKey', data: ((_a = $('#eventKey').val()) === null || _a === void 0 ? void 0 : _a.toString()) || "" }, true);
        $('#eventKey').val("");
        setCurrentKey();
    }
});
$('.collapse-icon-parent').on("click", function () {
    var _a;
    $(this).children().toggleClass('bi-caret-down-fill');
    $(this).children().toggleClass('bi-caret-up-fill');
    $(this).next().slideToggle();
    document.cookie = `{MENU}${(_a = $(this).attr('id')) === null || _a === void 0 ? void 0 : _a.replace('-h2', '')}=${$(this).children().hasClass('bi-caret-up-fill')}; path=/admin`;
});
// opens / closes to last saved position
for (let i = 0; i < document.cookie.split(";").length; i++) {
    if (document.cookie.split(";")[i].includes("{MENU}")) {
        const cookie = document.cookie.split(";")[i].trim().replace('{MENU}', '').split("=");
        if (cookie[1] == "true") {
            $(`#${cookie[0]}-h2 i`).toggleClass("bi-caret-up-fill").toggleClass("bi-caret-down-fill");
            $(`#${cookie[0]}`).slideToggle(0);
        }
    }
}
// gets last saved scroll position and goes to it after 500ms
setTimeout(function () {
    var _a;
    const scrollTopPos = parseInt(((_a = document.cookie.split(";").find((p) => p.includes("scroll"))) === null || _a === void 0 ? void 0 : _a.replace("scroll=", "").trim()) || "0");
    ;
    window.scrollTo({
        top: scrollTopPos,
        left: 0,
        behavior: 'instant'
    });
}, 500);
// sets scroll position after page leave
$(window).on("unload", function () {
    document.cookie = `scroll=${Math.round(window.scrollY)}; path=/admin`;
});
$("#add-perm").on("click", function () {
    var _a;
    const newName = prompt("What should the name of this permission be?");
    let blacklist = (_a = prompt("What pages should they not be allowed on? EX: /page1,/page2/ex")) === null || _a === void 0 ? void 0 : _a.split(",");
    if ((blacklist === null || blacklist === void 0 ? void 0 : blacklist.length) == 1 && blacklist[0] == "")
        blacklist = [];
    if (newName && blacklist) {
        postDataAdmin({
            action: "addPerm",
            data: {
                name: newName,
                blacklist
            }
        }, true).then(function () {
            window.location.reload();
        });
    }
    else {
        alert("Error making permission.");
    }
});
$("#add-user").on("click", function () {
    return __awaiter(this, void 0, void 0, function* () {
        const newName = prompt("What is this users username?");
        const newPassword = prompt("What is this users password?");
        const perm = prompt("What is the ID of the permission they should have?");
        const permId = perm ? parseInt(perm) : null;
        console.log(newName, newPassword, permId);
        if (newName && newPassword && (permId || permId == 0)) {
            postDataAdmin({
                action: "addUser", data: {
                    username: newName,
                    password: newPassword,
                    permissionId: permId
                }
            }, true).then(function (res) {
                if (res == 'Bad User') {
                    alert('Bad User!');
                }
                else {
                    window.location.reload();
                }
            });
        }
        else {
            alert("Error making user.");
        }
    });
});
// $(".perm-delete").on('click', function() {
//     const id = $(this).parent().next().text().trim()
//     confirm(`You are about to permission #${id}!`)
// })
$(".user-delete").on('click', function () {
    const name = $(this).parent().next().text().trim();
    if (confirm(`You are about to delete user ${name}!`)) {
        // TODO: get user id from table
        postDataAdmin({ action: "deleteUser", data: 0 }, true).then(function () {
            window.location.reload();
        });
    }
});
$(".user-field").on('click', function () {
    const id = $(this).parent().children().eq(1).text().trim();
    const field = $(this).closest('table').find('th').eq($(this).index()).text().trim();
    const updated = prompt(`What would you like to change user #${id}'s ${field} to?`);
    if (!updated || !(field == "username" || field == "password" || field == "permissionId")) {
        return;
    }
    postDataAdmin({
        action: "editUserField",
        data: {
            id: parseInt(id),
            field: field,
            updated: updated
        }
    }, true).then(function (res) {
        if (res != "Bad User") {
            window.location.reload();
        }
        else {
            alert("Bad User!");
        }
    });
});
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
