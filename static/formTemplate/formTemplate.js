$(".section_head").click(function(){
    $(this).next().slideToggle(100);
});

let breakTimes = []

$("#matchNum").on('input propertychange paste', function(){
    if(Object.keys(breakTimes).some(function(matchNumber){return matchNumber == $("#matchNum").val();})){
        $("#matchNumErr").html("You do not need to scout for this match, you are " + breakTimes[$("#matchNum").val()]);
    } else if ($("#matchNumErr").html() != "") {
        $("#matchNumErr").html("");
    }

    if (!isValidWholeNumber($("#matchNum").val())){
        $("#preGeneralErr").html("One of your inputs is not a whole number");
    } else if ($("#preGeneralErr").html() != "") {
        $("#preGeneralErr").html("");
    }
});

$("#TeamNum").on('input propertychange paste', function(){
    if(dontScout.some(function(teamNumber){return teamNumber == $("#TeamNum").val();}) == true){
        $("#teamNumErr").html("You do not need to scout for this team.");
    } else if ($("#teamNumErr").html() != "" && isValidWholeNumber($("#TeamNum").val()) != false) {
        $("#teamNumErr").html("");
    }

    if (isValidWholeNumber($("#TeamNum").val()) == false){
        $("#preGeneralErr").html("One of your inputs is not a whole number");
    } else if ($("#preGeneralErr").html() != "" && isValidWholeNumber($("#matchNum").val()) != false) {
        $("#preGeneralErr").html("");
    } 
});

window.onload = function(){
    setDefaultValues()
}

function setDefaultValues() {
    postData({action: "getScout"}).then(function(res){
        for(let i=0; i<res.breaks.length; i++) {
            breakTimes[res.breaks[i]] = "on break"
        }
        $("#matchNum").val(res.matchNumbs.reduce((a, b) => Math.min(a, b)))
        $("#TeamNum").val(res.matches.find(({number}) => number == res.matchNumbs.reduce((a, b) => Math.min(a, b))).team)
        console.log(breakTimes)
    })
}

dontScout = [1648];

function isValidWholeNumber(input){
    for (let i = 0; i < input.length; i++){
        if (input[i] != "1" && input[i] != "2" && input[i] != "3" && input[i] != "4" && input[i] != "5" && input[i] != "6" && input[i] != "7"&& input[i] != "8" && input[i] != "9" && input[i] != "0") {
            return false;
        }
    }
    return true

    /* You could also just do this:

    if(Math.round(input) !== input) {
        return false;
    }

    return true;

    */
}

$(".plus").click(function() {
    $(this).prev().children().first().val(parseInt($(this).prev().children().first().val())+1);
});

$(".minus").click(function() {
    $(this).next().children().first().val(parseInt($(this).next().children().first().val())-1);
});

$('#form').on("submit", submitForm)

function submitForm() {
    let formData = $('#form').serializeArray()
    formData.push({name: "timestamp", value: formatDate(new Date(Date.now()))})
    postData({action: "addRow", sheet: "Example_Form", data: formData, matchNumb: formData.find(({name}) => name == "matchNum").value}).then(function(res){
        if (res == "OK") {
            $('#form').trigger("reset");
            window.scrollTo(0, 0);
            setDefaultValues()
        } else {
            alert("FORM NOT SAVED!")
        }
    })
}

function formatDate(date) {
    return [date.getMonth(), "/", date.getDate(), "/", date.getFullYear().toString().substring(2), " ", date.getHours(), ":", date.getMinutes(), ":", date.getSeconds()].join("");
}