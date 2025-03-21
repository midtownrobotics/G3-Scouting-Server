var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function postDataAdmin(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = "/admin/";
        console.log(url);
        return fetch(url, {
            method: "POST",
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then((data) => __awaiter(this, void 0, void 0, function* () {
            return yield data.json();
        }));
    });
}
export function postDataGeneral(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = "/post/";
        console.log(url);
        return fetch(url, {
            method: "POST",
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(res => res.json()).then(data => {
            console.log(data);
            return data;
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
    $('#logout-button').on('click', () => {
        logoutUser();
    });
    $('#color-switcher-button').on('click', () => {
        switchColor();
    });
});
function switchColor() {
    if ($("#color-switcher-button i").hasClass("bi-sun")) {
        $("#color-switcher-button i").removeClass("bi-sun");
        $("#color-switcher-button i").addClass("bi-moon");
        $("body").css("backgroundColor", "rgb(39,38,38)");
        $("h1, h3, div, body, a:not(nav a)").css("color", "rgb(173, 176, 179)");
        console.log("dark");
        document.cookie = "darkMode=true; path=/";
    }
    else {
        $("#color-switcher-button i").removeClass("bi-moon");
        $("#color-switcher-button i").addClass("bi-sun");
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
export function parseIntPlus(val) {
    if (typeof val == "number")
        return val;
    if (typeof val == "string")
        return parseInt(val);
    if (typeof val == "undefined")
        return undefined;
    return parseInt(val.toString());
}
export function getNextMatchInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield fetch("/user-get/").then((res) => res.json())).nextMatch;
    });
}
