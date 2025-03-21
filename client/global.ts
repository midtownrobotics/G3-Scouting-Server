import { AdminPostRequest, AdminPostResponse, GeneralPostRequest, GeneralPostResponse, NextMatch } from "../node/types";

export async function postDataAdmin<T extends AdminPostRequest>(data: T) {
    const url = "/admin/"
    console.log(url)
    return fetch(url, {
        method: "POST",
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(async (data) => {
        return await data.json() as AdminPostResponse[T["action"]]
    });
}

export async function postDataGeneral<T extends GeneralPostRequest>(data: T) {
    const url = "/post/"
    console.log(url)
    return fetch(url, {
        method: "POST",
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(res => res.json()).then(data => {
        console.log(data)
        return data as GeneralPostResponse[T["action"]]
    });
}

$(document).ready(function () {
    let darkMode = document.cookie.split(";").find(a => a.includes("darkMode"))?.trim().split("=")[1]

    if (darkMode == "true") {
        switchColor()
    } if (darkMode == undefined) {
        document.cookie = "darkMode=false; path/"
    }

    $('#logout-button').on('click', () => {
        logoutUser()
    })

    $('#color-switcher-button').on('click', () => {
        switchColor()
    })

})

function switchColor() {
    if ($("#color-switcher-button i").hasClass("bi-sun")) {
        $("#color-switcher-button i").removeClass("bi-sun")
        $("#color-switcher-button i").addClass("bi-moon")
        $("body").css("backgroundColor", "rgb(39,38,38)")
        $("h1, h3, div, body, a:not(nav a)").css("color", "rgb(173, 176, 179)")
        console.log("dark")
        document.cookie = "darkMode=true; path=/"
    } else {
        $("#color-switcher-button i").removeClass("bi-moon")
        $("#color-switcher-button i").addClass("bi-sun")
        $("body").css("backgroundColor", "rgb(173, 176, 179)")
        $("h1, h3, div, body, a:not(nav a)").css("color", "rgb(39,38,38)")
        console.log("light")
        document.cookie = "darkMode=false; path=/"
    }
}

function logoutUser() {
    fetch('/logout')
    window.location.reload();
}

export function parseIntPlus(val: string | string[] | number | undefined): number | undefined {
    if (typeof val == "number") return val;
    if (typeof val == "string") return parseInt(val);
    if (typeof val == "undefined") return undefined;
    return parseInt(val.toString());
}

export async function getNextMatchInfo(): Promise<NextMatch> {
    return (await fetch("/user-get/").then((res) => res.json())).nextMatch as NextMatch
}