function addElement() {
    var location = prompt("Element Location?\n1.Pre-game\n2.Autonomous\n3.Match\n4.Endgame\n5.Post-game");
    if (location == "1"){
        location = $("#pblock");
    } else if(location == "2"){
        location = $("#ablock");
    } else if(location == "3"){
        location = $("#mblock");
    } else if(location == "4"){
        location = $("#eblock");
    } else if(location == "5"){
        location = $("#poblock");
    } else {
        alert("error")
        return
    }

    var element = prompt("Element type?\n1.Number Input\n2.Points Input\n3.Multiple Choice\n4.Paragraph")

    if (element == "1"){
        var label = prompt("Label Name?")
        var id = createId(label, 5);
        var contents = `<label class="textInput" for="`+id+`">`+label+":"+`</label>
                        <input class="textInput" id="`+id+`" type="number" name="`+id+`" placeholder="`+label+`" required><br>`
        $(location).append(contents);
    } else if(element == "2"){
        var pointName = prompt("Name?")
        var contentss = `<div class="pointsBlock-head">
                            <p>`+pointName+`</p>
                        </div>
                        <table class="pointsBlock">
                            <tr>
                                <td class="minus">-</td>
                                <td class="value">0</td>
                                <td class="plus">+</td>
                            </tr>
                        </table>`
        $(location).append(contentss);
    } else if(element == "3"){
        var question = prompt("What would you like the question to be?");
        var choices = prompt("How many options would you like?")
        var questionId = createId(question.slice(0,8),5);
        var choicesName = createId(question.slice(0,6),7);
        var content = "<div "+"id=\""+questionId+"\""+" class=\"multiple-choice-question\">"+
                        "<p class=\"question\">"+question+"</p>"+
                    "</div>"
        $(location).append(content);
        
        var choiceName = createId(question.slice(0,9),3);
        for (let i=0; i<choices; i++){
            choiceLabel = prompt("What would you like choice "+(i+1)+" to be?");
            var choiceId = choiceLabel.replace(/\s/g, '').slice(0,5)+randomString(5);
            var choiceContent = `<input type = "radio" id="`+choiceId+`" name="`+choicesName+`" value="`+choiceLabel+`">
                                <label for="`+choicesName+`">`+choiceLabel+`</label><br>`
            $("#"+questionId).append(choiceContent);
        }
    } else if(element == "4"){
        var label = prompt("Label?");
        var ID = createId(label.slice(0,6),3);
        var contentsssss = `<label class="textInput" for="`+ID+`">`+label+":"+`</label><br>
        <textarea class="textInput" id="`+ID+`" type="text" name="`+ID+`" placeholder="`+label+`" rows="7" cols="35" required></textarea>`
        $(location).append(contentsssss);
    } else {
        alert("error")
        return
    }
}

function customizeStyle() {
    var stylesheet = document.styleSheets[1];
    var rules = stylesheet.cssRules;
    var rulesList = "";
    for (let i=0; i<rules.length; i++){
        rulesList += i+": "+rules[i].selectorText+"\n";
    }
    alert(rulesList);
    var ruleEdit = rules[prompt("Which rule would you like to edit?")];
    rulesList = "";
    for (let i=0; i<ruleEdit.style.length; i++){
        rulesList += i+": "+ruleEdit.style[i]+"\n";
    }
    alert(rulesList);
    propertySet = prompt("Set property of?");
    setTo = prompt("Set To?");
    ruleEdit.style.setProperty(ruleEdit.style[propertySet], setTo);
}

function save() {
    var save = {};
    var cssRuless = document.styleSheets[1].cssRules;
    save.CSS = {};
    var count = 0;
    for (let i = 0; i<22; i++){
        if (i==0){
            i++;
        } else if (i==1) {
            i++;
        } else {
            save.CSS[count]=cssRuless[i];
            count++;
        }
    }
    save.HTML = document;
    console.log(save)
}

function randomString(length) {
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  
function createId(input, random){
    const validFirstCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" 
    const validCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    var id = input;
    id = id.replace(/\s/g, '');
    var contains = "";
    for (let i=0; i<input.length; i++){
        if (i==0){
            for (let j=0; j<validFirstCharacters.length; j++){
                if (id[i]!= validFirstCharacters[j]){
                    contains = contains+"0";
                } else {
                    contains = contains+"1";
                }
            }
            if (contains.includes("1") == false){
                id = id.replace(id[i],validFirstCharacters.charAt(Math.floor(Math.random() * validFirstCharacters.length)));
            }
            contains = "";   
        } else {
            for (let x=0; x<validCharacters.length; x++){
                if (id[i]!= validCharacters[x]){
                    contains = contains+"0";
                } else {
                    contains = contains+"1";
                }
            }
            if (contains.includes("1") == false){
                id = id.replace(id[i],validCharacters.charAt(Math.floor(Math.random() * validCharacters.length)));
            }
            contains = "";
        }
    }
    id += randomString(random); 
    return id;
}

 //Form JS for functioning:
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

breakTimes = {};
dontScout = [];

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