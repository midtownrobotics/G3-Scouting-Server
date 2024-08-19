function createId(input, random){
    const validFirstCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijlmnopqrstuvwxyz" 
    const validCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijlmnopqrstuvwxyz013456789-_"
    //charcters that will not be generated: k and 2
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
    let matches;
    for (let i = 0; i<idsList.length; i++){
      if (id==idsList[i]){
        matches==true;
      }
    }
    if (matches == true) {
      createId(input, random);
    } else {
      idsList.push(id);
      return id;
    }
}
/** Better version of createId() - but I ain't using it anyway - for now
function createIdNoVoodoo() {
    idsList.push(idsList[-1] + 1)
}
*/

//Random String:
function randomString(length) {
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

//Ui text prompt
function uiTextPrompt(text, callback) {
    $("#textPrompt").prepend(`
    <label for="${text}">${text}</label>
    <input type="text" class="form-control" id="${text}" placeholder="${text}">
    `);
    $("#textPrompt").show();
    $("#textPrompt").children().first().next().focus();
    $("#textPrompt #textPromptSubmit").off();
    $("#textPrompt #textPromptSubmit").on('click', function(){
        let value = $("#textPrompt").children().first().next().val();
        callback(value);
        $("#textPrompt").children().first().remove();
        $("#textPrompt").children().first().remove();
        $("#textPrompt").hide();
    });
}
 
$("#textPrompt #cancelPrompt").on('click', function(){
    $("#textPrompt").hide();
    $("#textPrompt").children()[0].remove();
    $("#textPrompt").children()[0].remove();
})

function findIndexInArrayOfObjects(array, searchKey, searchValue){
    let found = false;
    let indicies = [];
    for (let i = 0; i < array.length; i++){
        if (array[i][searchKey] == searchValue){
            indicies.push(i);
            found = true;
        }
    }
    if (found == true){
        return indicies;
    } else {
        return -1;
    }
}



    





/**
function uiTextPrompt(text, action){
    $("#textPrompt").prepend(`
    <label for="${text}">${text}</label>
    <input type="text" class="form-control" id="${text}" placeholder="${text}">
    `);
    $("#textPrompt").show();
    $("#textPrompt").children().first().next().focus();
}

function cancelPrompt(){
  $("#textPrompt").hide();
  $("#textPrompt").children()[0].remove();
  $("#textPrompt").children()[0].remove();
}

async function submitPrompt(){
  let value = $("#textPrompt").children().first().next().val();
  let purpose = $("#textPrompt").children().first().html();
  if (purpose == "Enter Section Name") {
    let sectionHead = new SectionHead(value);
    sectionHead.add();
    $("#addSectionButton").before(`<div class="elementHead">${value}<button class="editSectionTitleClass"><i class="bi bi-pencil-square"></i></button><button class="expand">+</button></div>`);
    $("#addSectionButton").before(`<div class="existingQuestionsContainer"><button onclick="addNewElement()" class="addElement">+ Add Element</button></div>`);
    let element = $(".elementHead").last();

    $(element).on("click", function() {
      if (element.children().last().html() == "+"){
        element.children().last().html("-");
        $(element).next().slideDown(10);
        $(element).next().children().first().show();
      } else {
        element.children().last().html("+");
        $(element).next().slideUp(10);
        $(element).next().children().first().hide();
      }
    });
    $('.editSectionTitleClass').on('click', function(e) {
        editSectionTitle(this);
        e.stopPropagation();
    });
  } else if (purpose == "New Title?"){
    $("#titleBlock").html(`${value} <button onclick="newTitle()" id="titleEditButton"><i class="bi bi-pencil-square"></i></button>`);
    $("#title_container").children().html(value);
    master["title"]=value;
  }
  $("#textPrompt").children().first().remove();
  $("#textPrompt").children().first().remove();
  $("#textPrompt").hide();
}
*/