import { postDataGeneral, parseIntPlus, getNextMatchInfo } from "./global.js"

let currentForm: string = new URLSearchParams(window.location.search).get('form') ?? "NONE"

if (!currentForm) {
    window.location.href = "/forms";
    currentForm = ""
}

async function setNextMatchInfo() {
    let nextMatch = await getNextMatchInfo()
    $("#matchNum").val(nextMatch.number)
    $("#teamNum").val(nextMatch.team)
}
setNextMatchInfo()

$('#submitButton').on('click', function (e) {
    submitForm()
});

$(".plus").on('click', function () {
    $(this).prev().children().first().val((parseIntPlus($(this).prev().children().first().val()) ?? 0) + 1);
});

$(".minus").on('click', function () {
    const val = parseIntPlus($(this).next().children().first().val()) ?? 0
    $(this).next().children().first().val(val <= 1 ? 0 : (val - 1));
});

function submitForm() {
    const formData = $('form').serializeArray()
    formData.push({ name: "timestamp", value: formatDate(new Date()) })
    const matchNumber = parseIntPlus($("#matchNum").val())
    $('#submitButton').attr("disabled", "disabled")
    postDataGeneral({ 
        action: "postFormData", 
        form: currentForm, 
        data: formData, 
        matchNumber 
    }).then(async function (res) {
        if (res.status == "OK") {
            setTimeout(() => {
                window.location.reload()
            }, 500)
        } else {
            alert("FORM NOT SAVED!")
            $('#submitButton').removeAttr("disabled")
        }
    })
}

function formatDate(date: Date) {
    return [date.getMonth(), "/", date.getDate(), "/", date.getFullYear().toString().substring(2), " ", date.getHours(), ":", date.getMinutes(), ":", date.getSeconds()].join("");
}