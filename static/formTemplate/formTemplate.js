$(".section_head").click(function(){
    $(this).next().slideToggle(100);
});

$("#matchNum").on('input propertychange paste',function(){
    if(Object.keys(breakTimes).some(function(matchNumber){return matchNumber == $("#matchNum").val();}) == true){
        $("#matchNumErr").html("You do not need to scout for this match, you are " + breakTimes[$("#matchNum").val()]);
    } else if ($("#matchNumErr").html() != "") {
        $("#matchNumErr").html("");
    }

    if (isValidWholeNumber($("#matchNum").val()) == false){
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

breakTimes = {"16":"in pits", "20":"on break"};
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
    $(this).prev().html(parseInt($(this).prev().html())+1);
});

$(".minus").click(function() {
    $(this).next().html(parseInt($(this).next().html())-1);
});

$('#form').on("submit", submitForm)

function submitForm() {
    const formData = $('#form').serializeArray()
    postData({action: "addRow", sheet: "testing-sheet", data: formData}).then(function(res){
        if (res == "OK") {
            $('#form').trigger("reset");
            window.scrollTo(0, 0);
        } else {
            alert("FORM NOT SAVED!")
        }
    })
}