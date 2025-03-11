var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { postDataGeneral, TBA } from "./global.js";
let key;
let qualMatches = [];
function async() {
    return __awaiter(this, void 0, void 0, function* () {
        key = yield postDataGeneral({ action: "getKey" });
        const allMatches = TBA(`/event/${key}/matches`);
        for (let i = 0; i < allMatches.length; i++) {
            if (allMatches[i].comp_level == "qm") {
                qualMatches.push(allMatches[i]);
            }
        }
        qualMatches.sort(JSONCompareByMatchNumber);
        $("#match-number").on("input propertychange paste", function () {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                if ($(this).val() !== "") {
                    search(((_a = $("#search").val()) === null || _a === void 0 ? void 0 : _a.toString()) || "");
                }
                else {
                    $("#blue").empty();
                    $("#red").empty();
                }
            });
        });
        $("#search").on("input propertychange paste", function () {
            var _a;
            search(((_a = $(this).val()) === null || _a === void 0 ? void 0 : _a.toString()) || "");
        });
    });
}
async();
function displayData(matchNumb) {
    return __awaiter(this, void 0, void 0, function* () {
        const match = qualMatches[matchNumb - 1];
        $("#blue").empty();
        $("#red").empty();
        if (match.winning_alliance == "blue") {
            $("#blue-h3").css("font-weight", "bold");
            $("#red-h3").css("font-weight", "normal");
        }
        else {
            $("#red-h3").css("font-weight", "bold");
            $("#blue-h3").css("font-weight", "normal");
        }
        $("#blue").append(`<span>Won: ${match.winning_alliance == "blue" ? true : false}</span><br>`);
        $("#red").append(`<span>Won: ${match.winning_alliance == "red" ? true : false}</span><br>`);
        $("#blue").append(`<span>Teams: ${match.alliances.blue.team_keys[0].substring(3)}, ${match.alliances.blue.team_keys[1].substring(3)}, ${match.alliances.blue.team_keys[2].substring(3)}</span><br>`);
        $("#red").append(`<span>Teams: ${match.alliances.red.team_keys[0].substring(3)}, ${match.alliances.red.team_keys[1].substring(3)}, ${match.alliances.red.team_keys[2].substring(3)}</span><br>`);
        for (let i = 0; i < Object.keys(match.score_breakdown.blue).length; i++) {
            $("#blue").append(`<span>${camelCaseToWords(Object.keys(match.score_breakdown.blue)[i])}: ${match.score_breakdown.blue[Object.keys(match.score_breakdown.blue)[i]]}</span><br>`);
            $("#red").append(`<span>${camelCaseToWords(Object.keys(match.score_breakdown.blue)[i])}: ${match.score_breakdown.red[Object.keys(match.score_breakdown.blue)[i]]}</span><br>`);
        }
    });
}
function search(query) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        yield displayData(parseInt(((_a = $("#match-number").val()) === null || _a === void 0 ? void 0 : _a.toString()) || ""));
        query = query.toLowerCase();
        const numberOfFieldsBlue = $("#blue").children("span").length;
        const numberOfFieldsRed = $("#red").children("span").length;
        let newBlue = "";
        let newRed = "";
        console.log(newRed);
        for (let i = 0; i < numberOfFieldsBlue; i++) {
            if ($("#blue").children("span")[i].innerHTML.toLowerCase().split(':')[0].includes(query)) {
                newBlue += `<span>${$("#blue").children("span")[i].innerHTML}</span><br>`;
            }
        }
        for (let i = 0; i < numberOfFieldsRed; i++) {
            if ($("#red").children("span")[i].innerHTML.toLowerCase().split(':')[0].includes(query)) {
                newRed += `<span>${$("#red").children("span")[i].innerHTML}</span><br>`;
            }
        }
        $("#blue").html(newBlue);
        $("#red").html(newRed);
    });
}
function camelCaseToWords(s) {
    const result = s.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
}
function JSONCompareByMatchNumber(a, b) {
    if (a.match_number < b.match_number) {
        return -1;
    }
    if (a.match_number > b.match_number) {
        return 1;
    }
    return 0;
}
