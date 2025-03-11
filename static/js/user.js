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
import { currentMatch, getTeams } from "./global.js";
function rotateReload() {
    $("#reload").css("transition-duration", "1s");
    $("#reload").css('transform', 'rotate(360deg)');
    setTimeout(function () {
        $("#reload").css("transition-duration", "0s");
        $("#reload").css('transform', 'rotate(0deg)');
    }, 1000);
}
function generateTable(userGet) {
    const matches = userGet.matches;
    $("#table").html(`                
        <tr style="font-weight: bold;" id="top-row">
            <td>Number</td>
            <td>Team Number</td>
            <td>Team Name</td>
            <td>Form</td>
            <td>Station</td>
        </tr>
    `);
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
        }
        else if (firstNonBreak == true) {
            $("#table").append(`
                <tr class="table-primary">
                    <td colspan="5">${i + 1}</td>
                </tr>
            `);
        }
    }
}
function getNextMatch(userGet) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const nextMatch = userGet.nextMatch;
        const currentMatchNumber = yield currentMatch();
        console.log(currentMatchNumber);
        $("#nm-until").text();
        $("#nm-number").text(nextMatch.number);
        $("#nm-team").text(nextMatch.team || "????");
        $("#nm-teamname").text(getTeamName(nextMatch.team));
        $("#nm-station").text(((_a = nextMatch.station) === null || _a === void 0 ? void 0 : _a.charAt(0).toUpperCase()) || "" + ((_b = nextMatch.station) === null || _b === void 0 ? void 0 : _b.slice(1)) || "");
        // $("#nm-form").text(nextMatch.form)
        // $("#nm-hp").text(nextMatch.highPriority ? "Yes" : "No")
        $("#nm-mu").text(currentMatchNumber == "CANNOT ACCESS" ? "????" : nextMatch.number - currentMatchNumber || "Already Happened");
    });
}
if (((_a = document.cookie.split(";").find(a => a.includes("darkMode"))) === null || _a === void 0 ? void 0 : _a.trim().split("=")[1]) != "false") {
    $("#reload").css("color", "rgb(173, 176, 179)");
}
$('#color-switcher').click(function () {
    if (!$("#color-switcher i").hasClass("bi-sun")) {
        $("#reload").css("color", "rgb(173, 176, 179)");
    }
    else {
        $("#reload").css("color", "rgb(39,38,38)");
    }
});
let teams = undefined;
getTeams().then((res) => {
    teams = res;
});
function getTeamName(number) {
    return (teams === null || teams === void 0 ? void 0 : teams.teamNames[teams.teamNumbers.findIndex((t) => t == number)]) || "????";
}
function reloadData() {
    return __awaiter(this, void 0, void 0, function* () {
        const userGet = yield fetch("/user-get/").then((res) => res.json());
        getNextMatch(userGet);
        generateTable(userGet);
    });
}
$("#reload").click(function () {
    reloadData();
    rotateReload();
});
setTimeout(function () {
    reloadData();
}, 400);
setInterval(function () {
    reloadData();
    rotateReload();
}, 60000);
