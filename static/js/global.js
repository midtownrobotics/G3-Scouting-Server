var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function TBA(url) {
    const parsedUrl = "https://www.thebluealliance.com/api/v3" + url + "?X-TBA-Auth-Key=LVDMCD06pMcEyS94sswn0hp8mGup9P2vfYhXZ6MgTgWt5oLzlNCP3RdBsm41g8Zs";
    var xmlHttp = new XMLHttpRequest();
    try {
        xmlHttp.open("GET", parsedUrl, false); // false for synchronous request
        xmlHttp.send(null);
    }
    catch (err) {
        console.warn("Cannot access TBA API.");
        return null;
    }
    ;
    return JSON.parse(xmlHttp.responseText);
}
export function getTeams() {
    return __awaiter(this, void 0, void 0, function* () {
        const teamsObj = TBA(`/event/${yield postDataGeneral({ action: "getKey" })}/teams`);
        let teamNumbList = [];
        let teamNameList = [];
        for (let i = 0; i < teamsObj.length; i++) {
            teamNumbList.push(teamsObj[i].team_number);
            teamNameList.push(teamsObj[i].nickname);
        }
        return { "teamNumbers": teamNumbList, "teamNames": teamNameList, "fullObject": teamsObj };
    });
}
export function currentMatch() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const matches = TBA(`/event/${yield postDataGeneral({ action: "getKey" })}/matches`);
        if (matches == null) {
            return null;
        }
        var matchesNotHappened = [];
        for (let i = 0; i < matches.length; i++) {
            if (!matches[i].actual_time) {
                matchesNotHappened.push(matches[i]);
            }
        }
        return (_a = matchesNotHappened[0]) === null || _a === void 0 ? void 0 : _a.match_number;
    });
}
function getMatches() {
    return __awaiter(this, void 0, void 0, function* () {
        const matchesObj = TBA(`/event/${yield postDataGeneral({ action: "getKey" })}/matches/simple`);
        let matches = [];
        for (let i = 0; i < matchesObj.length; i++) {
            if (matchesObj[i].comp_level == "qm") {
                const red = matchesObj[i].alliances.red.team_keys;
                const blue = matchesObj[i].alliances.blue.team_keys;
                matches.push([red[0].substring(3), red[1].substring(3), red[2].substring(3), blue[0].substring(3), blue[1].substring(3), blue[2].substring(3)]);
            }
        }
        return matches;
    });
}
export function postDataAdmin(data_1) {
    return __awaiter(this, arguments, void 0, function* (data, admin = false) {
        const url = admin ? "/admin/" : "/post/";
        console.log(url);
        return fetch(url, {
            method: "POST",
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(res => res.json()).then(data => {
            return data.res;
        });
    });
}
export function postDataGeneral(data_1) {
    return __awaiter(this, arguments, void 0, function* (data, admin = false) {
        const url = admin ? "/admin/" : "/post/";
        console.log(url);
        return fetch(url, {
            method: "POST",
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(res => res.json()).then(data => {
            return data.res;
        });
    });
}
$(document).ready(function () {
    var _a;
    let darkMode = (_a = document.cookie.split(";").find(a => a.includes("darkMode"))) === null || _a === void 0 ? void 0 : _a.trim().split("=")[1];
    if (darkMode == "true") {
        switchColor();
    }
    if (darkMode == undefined) {
        document.cookie = "darkMode=false; path/";
    }
});
function switchColor() {
    if ($("#color-switcher i").hasClass("bi-sun")) {
        $("#color-switcher i").removeClass("bi-sun");
        $("#color-switcher i").addClass("bi-moon");
        $("body").css("backgroundColor", "rgb(39,38,38)");
        $("h1, h3, div, body, a:not(nav a)").css("color", "rgb(173, 176, 179)");
        console.log("dark");
        document.cookie = "darkMode=true; path=/";
    }
    else {
        $("#color-switcher i").removeClass("bi-moon");
        $("#color-switcher i").addClass("bi-sun");
        $("body").css("backgroundColor", "rgb(173, 176, 179)");
        $("h1, h3, div, body, a:not(nav a)").css("color", "rgb(39,38,38)");
        console.log("light");
        document.cookie = "darkMode=false; path=/";
    }
}
function logoutUser() {
    fetch('/logout');
    window.location.reload();
}
function sortTable(tableId, column, reverse = false) {
    var _a, _b;
    let i;
    const table = document.getElementById(tableId);
    let switching = true;
    let shouldSwitch = false;
    while (switching) {
        switching = false;
        let rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            let x = rows[i].getElementsByTagName("TD")[column];
            let y = rows[i + 1].getElementsByTagName("TD")[column];
            if ((reverse ? x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase() : x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) && !Number.isFinite(parseInt(x.innerHTML))) {
                shouldSwitch = true;
                break;
            }
            else if (reverse ? parseInt(x.innerHTML) < parseInt(y.innerHTML) : parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            (_b = (_a = rows[i]) === null || _a === void 0 ? void 0 : _a.parentNode) === null || _b === void 0 ? void 0 : _b.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}
