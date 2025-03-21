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
import { postDataGeneral, parseIntPlus, getNextMatchInfo } from "./global.js";
let currentForm = (_a = new URLSearchParams(window.location.search).get('form')) !== null && _a !== void 0 ? _a : "NONE";
if (!currentForm) {
    window.location.href = "/forms";
    currentForm = "";
}
function setNextMatchInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        let nextMatch = yield getNextMatchInfo();
        $("#matchNum").val(nextMatch.number);
        $("#teamNum").val(nextMatch.team);
    });
}
setNextMatchInfo();
$('#submitButton').on('click', function (e) {
    submitForm();
});
$(".plus").on('click', function () {
    var _a;
    $(this).prev().children().first().val(((_a = parseIntPlus($(this).prev().children().first().val())) !== null && _a !== void 0 ? _a : 0) + 1);
});
$(".minus").on('click', function () {
    var _a;
    const val = (_a = parseIntPlus($(this).next().children().first().val())) !== null && _a !== void 0 ? _a : 0;
    $(this).next().children().first().val(val <= 1 ? 0 : (val - 1));
});
function submitForm() {
    const formData = $('form').serializeArray();
    formData.push({ name: "timestamp", value: formatDate(new Date()) });
    const matchNumber = parseIntPlus($("#matchNum").val());
    $('#submitButton').attr("disabled", "disabled");
    postDataGeneral({
        action: "postFormData",
        form: currentForm,
        data: formData,
        matchNumber
    }).then(function (res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (res.status == "OK") {
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
            else {
                alert("FORM NOT SAVED!");
                $('#submitButton').removeAttr("disabled");
            }
        });
    });
}
function formatDate(date) {
    return [date.getMonth(), "/", date.getDate(), "/", date.getFullYear().toString().substring(2), " ", date.getHours(), ":", date.getMinutes(), ":", date.getSeconds()].join("");
}
