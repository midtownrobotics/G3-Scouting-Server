let elementsPageIdsandIndices = {};
function viewElementsPage() {
  $("#elementsPage").css("display", "inline-block");
  $("#elementsPage").append(`<div id="titleBlock">${$("#title_container").children().html()} <button onclick="newTitle()" id="titleEditButton"><img src="./images/pencil-square.svg" alt="edit"></button></div>`);
  elementsPageIdsandIndices = {};
  var numSections = Object.keys(sections).length;
  for (let i = 0; i < numSections; i++) {
    var title = sections["s" + i].name;
    $("#elementsPage").append(`<div id="seectionfor${i}" class="elementHead"><button class="moveSection"><img src="images/grip_vertical_icon_151315.svg" alt="moveSection"></button>${title}<button class="editSectionTitleClass"><img src="./images/pencil-square.svg" alt="edit"></button><button class="deleteSection"><img src="images/trash-fill.svg" alt="delete"></button><button class="expand">+</button></div>`);
    $("#elementsPage").append(`<div class="existingQuestionsContainer"><button id="addSec${i}" class="addElement">+ Add Element</button></div>`);
    var numQuestions = Object.keys(sections["s"+i].childQuestions).length;
    for (let j = 0; j < numQuestions; j++) {
      var type = sections["s"+i].childQuestions["q"+j].type;
      var name = sections["s"+i].childQuestions["q"+j].label;
      var adding = `<table id="${"elemPageFor" + (sections["s"+i].childQuestions["q"+j]).index}" class="elementTable inDraggable" style="">
          <tbody>
            <tr>
              <td class="elemTableMove"><img draggable="false" src="images/grip_vertical_icon_151315.svg"></td>
              <td class="elemTableName">${type} - ${name}</td>
              <td class="elemTableEdit"><img draggable="false" src="images/pencil-square.svg"></td>
              <td class="elemTableTrash"><img draggable="false" src="images/trash-fill.svg"></td>
          </tr>
        </tbody>
      </table>`;
      
      $(`#addSec${i}`).before(adding);
    }
    elementsPageIdsandIndices[sections["s"+i].id+"k2k"+i] = i;
  }
  
  $(".elementHead").on("click", function(event) {
    if (event.target.className != "editSectionTitleClass" && event.target.className != "deleteSection" && event.target.className != "moveSection") {
      if ($(this).children().last().html() == "+") {
        $(this).children().last().html("-");
        $(this).next().slideDown(10);
        $(this).next().children().show();
      } else {
        $(this).children().last().html("+");
        $(this).next().slideUp(10);
        $(this).next().children().first().hide();
      }
    }
  });
  $('.editSectionTitleClass').on('click', function(e) {
    editSectionTitle($(this).parent());
    e.stopPropagation();
  });
  $('.deleteSection').on('click', function(e) {
    deleteSection($(this).parent());
    e.stopPropagation();
  });
  $('.moveSection').on('click', function(e) {
    moveSection();
    e.stopPropagation();
  });
  $("#elementsPage").append(`<button class="addSection" id="addSectionButton" onclick="addSection()">+ Add Section</button>`);
  $("#elementsPage").append(`<button class="backButton" onclick="backToMain()">Back</button>`);

  //Add Element:
  $(".addElement").on("click", function (event){
    let elemPageParent = $(event.target).attr('id');
    console.log(event.target)
    let destination = $(event.target).parent().prev().attr('id').substring(11);
    getElementType(destination, elemPageParent);
  });

  $(".elemTableMove").on("mousedown", function(e){
    let id = ($(this).parent().parent().parent().attr("id")).substring(11);
    e.stopPropagation();
    $(".addElement").addClass("inDraggable");
    let items = $(".elementTable");
    $(`#elemPageFor${id}`).attr("draggable", true);
    let movIng = $(`#elemPageFor${id}`);
    $(`#elemPageFor${id}`).on("dragstart", () => (setTimeout(() => ($(`#elemPageFor${id}`).addClass("dragging")), 0)));
    $(`#elemPageFor${id}`).on("dragend", () => {$(`#elemPageFor${id}`).removeClass("dragging")});
    $(".inDraggable").on("dragover", function(e){
      let itemsWithout = $(".elementTable:not(.dragging)");
      itemsWithout = Object.keys(itemsWithout).map((key) => itemsWithout[key]);
      itemsWithout.pop();
      itemsWithout.pop();
      let addElem = Object.keys($(".addElement")).map((key) => $(".addElement")[key]);
      addElem.pop()
      addElem.pop()
      let over = itemsWithout.find((element) => {
        let yPos = element.getBoundingClientRect().top;
        if (e.clientY >= yPos && e.clientY <= yPos + element.offsetHeight) {
        }
        return e.clientY >= yPos && e.clientY <= yPos + element.offsetHeight;
      });
      let overTwo = addElem.find((element) => {
        let yPos = element.getBoundingClientRect().top;
        return e.clientY >= yPos && e.clientY <= yPos + element.offsetHeight;
      });
      if (over != undefined) {
        console.log(over);
        $(`#elemPageFor${id}`).insertBefore(`#${over.id}`);
      }
      if (overTwo != undefined) {
        console.log(overTwo);
        $(`#elemPageFor${id}`).insertBefore(`#${overTwo.id}`)
      }
    });
    $(".addElement").removeClass("inDraggable");
  });

  $(".elemTableMove").on("mouseup", function(){
    $(this).parent().parent().parent().removeClass("dragging");
    $(`#elemPageFor${id}`).off();
    $(".inDraggable").off();
  });

  $(".elemTableEdit").on("click", function(e){
    editElement(($(this).parent().parent().parent().attr("id")).substring(11));
    e.stopPropagation();
  });

  $(".elemTableTrash").on("click", function(e){
    deleteElement(($(this).parent().parent().parent().attr("id")).substring(11));
    e.stopPropagation();
  });
}
//Back to main from adding element
function backToMain() {
  $("#elementsPage").hide();
  $("#saveLoadPage").hide()
  $("#elementsPage").empty();
}


//Add Section:
function addSection() {
  if ($("#textPrompt").children().length == 2) {
    uiTextPrompt("Section Name?", function (data) {
      makeSectionHTML(data)
    });
  }
}

function makeSectionHTML(data) {
  let sectionHead = new SectionHead(data);
    sectionHead.add();
    $("#addSectionButton").before(`<div id="seectionFor${(Object.keys(sections).length-1)}" class="elementHead"><button class="moveSection"><img src="images/grip_vertical_icon_151315.svg" alt="moveSection"></button>${data}<button class="editSectionTitleClass"><img src="./images/pencil-square.svg" alt="edit"></button><button class="deleteSection"><img src="images/trash-fill.svg" alt="delete"></button><button class="expand">+</button></div>`);
    $("#addSectionButton").before(`<div class="existingQuestionsContainer"><button id="addSec${Object.keys(sections).length-1}" class="addElement">+ Add Element</button></div>`);
    $(".addElement").off();
    $(".addElement").on("click", function (event){
      let elemPageParent = $(event.target).attr('id');
      let destination = $(event.target).parent().prev().attr('id').substring(11);
      getElementType(destination, elemPageParent);
    });
    let element = $(".elementHead").last();
    elementsPageIdsandIndices[sections["s"+(Object.keys(sections).length-1)].id+"k2k"+(Object.keys(sections).length-1)] = (Object.keys(sections).length-1);

    $(element).on("click", function() {
      if (element.children().last().html() == "+") {
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
      editSectionTitle($(this).parent());
      e.stopPropagation();
    });
    $('.deleteSection').on('click', function(e) {
      deleteSection($(this).parent());
      e.stopPropagation();
    });
    $('.moveSection').on('click', function(e) {
      moveSection();
      e.stopPropagation();
    });
  pendingChanges = true;
}
  
//New title:
function newTitle(title) {
  if ($("#textPrompt").children().length == 2) {
    uiTextPrompt("New Title?", function(value) {
      changeTitleHTML(value);
    });
    pendingChanges = true;
  }
}

function changeTitleHTML(value) {
  $("#titleBlock").html(`${value} <button onclick="newTitle()" id="titleEditButton"><img src="./images/pencil-square.svg" alt="edit"></button>`);
  $("#title_container").children().html(value);
  master["title"]=value;
}


//Edit Section Title:
function editSectionTitle(section) {
  if ($("#textPrompt").children().length == 2) {
    uiTextPrompt("New Section Title Name?", function(value){
      let expanded;
      if ($(section).children().last().html() == "+") {
        expanded = "+";
      } else {
        expanded = "-";
      }
      $(section).html(`<button class="moveSection"><img src="./images/grip_vertical_icon_151315.svg" alt="moveSection"></button>${value}<button class="editSectionTitleClass"><img src="./images/pencil-square.svg" alt="edit"></button><button class="deleteSection"><img src="images/trash-fill.svg" alt="delete"></button><button class="expand">${expanded}</button>`)
      //$(section).html(`${value}<button class="editSectionTitleClass"><img src="./images/pencil-square.svg" alt="edit"></button><button class="expand">${expanded}</button>`);
      let index = $(section).attr("id");
      index = index.substring(11);
      sections[`s${index}`].object.editName(value);
      $('.editSectionTitleClass').on('click', function(e) {
        editSectionTitle($(this).parent());
        e.stopPropagation();
      });
    });
    pendingChanges = true;
  }
}

function processType() {
  let typeOf = $("#formSection").serializeArray();
  typeOf = typeOf[0].value;
  if (typeOf == "Number Input") {
    $("#makeNumberInContainer").show();
    $("#makeNumberIn").show();
  }
}

function cancelSelection() {
  $("#formSectionContainer").hide();
  $("#formSection").hide();
  $("#cancelTypeChoosing").off();
  $("#proccessTypeChoice").off();
  $("#cancelNumberInputbu").off();
  $("#proccessNumberInputbu").off();
}

function cancelNumberInput() {
  $("#makeNumberInContainer").hide();
  $("#makeNumberIn").hide();
}

function proccessNumberInput(destination, elemPageParent, info) {
  if (!info) {
    info = $("#makeNumberIn").serializeArray();
  }
  console.log(info);
  console.log(destination);
  $("#cancelTypeChoosing").off();
  $("#proccessTypeChoice").off();
  $("#cancelNumberInputbu").off();
  $("#proccessNumberInputbu").off();
  let readonlyQ = findIndexInArrayOfObjects(info, "name", "readonlyNumIn") == -1 ? false : true;
  let requiredQ = findIndexInArrayOfObjects(info, "name", "requiredNumIn") == -1 ? false : true;
  let nameIsCustom = findIndexInArrayOfObjects(info, "name", "customNameNumIn") != -1 ? true : false;
  let nameOf;
  if (findIndexInArrayOfObjects(info, "name", "customNameNumIn") == -1) {
    nameOf = info[(findIndexInArrayOfObjects(info, "name", "labelNumIn"))[0]].value;
    nameOf = nameOf.replace(/\s/g, "");
  } else {
    nameOf = info[(findIndexInArrayOfObjects(info, "name", "nameNumIn"))[0]].value;
    nameOf = nameOf.replace(/\s/g, "");
  }
  let numInput = new NumberInput(info[(findIndexInArrayOfObjects(info, "name", "labelNumIn"))[0]].value, nameIsCustom,nameOf, info[(findIndexInArrayOfObjects(info, "name", "valueNumIn"))[0]].value, info[(findIndexInArrayOfObjects(info, "name", "placeholderNumIn"))[0]].value, readonlyQ, requiredQ);
  numInput.addToSection(destination);
  if (findIndexInArrayOfObjects(info, "name", "minNumIn") != -1) {
    numInput.addMin(info[findIndexInArrayOfObjects(info, "name", "minNumIn")[0]].value)
  }
  if (findIndexInArrayOfObjects(info, "name", "maxNumIn") != -1) {
    numInput.addMax(info[findIndexInArrayOfObjects(info, "name", "maxNumIn")[0]].value)
  }
  if (findIndexInArrayOfObjects(info, "name", "stepNumIn") != -1) {
    numInput.setCustomStep(info[findIndexInArrayOfObjects(info, "name", "stepNumIn")[0]].value)
  }
  $("#makeNumberInContainer").hide();
  $("#makeNumberIn").hide();
  $("#formSectionContainer").hide();
  $("#formSection").hide(); 
  var type = numInput.type;
  var name = numInput.label;
  var id = "elemPageFor" + numInput.id;
  var adding = `<table id="${id}" class="elementTable inDraggable" style="
  ">
      <tbody>
        <tr>
          <td class="elemTableMove"><img draggable="false" src="images/grip_vertical_icon_151315.svg"></td>
          <td class="elemTableName">${type} - ${name}</td>
          <td class="elemTableEdit"><img draggable="false" src="images/pencil-square.svg"></td>
          <td class="elemTableTrash"><img draggable="false" src="images/trash-fill.svg"></td>
      </tr>
    </tbody>
  </table>`;
  console.log(elemPageParent);
  $(`#${elemPageParent}`).before(adding);

  $(".elemTableMove").on("mousedown", function(e){
    let id = ($(this).parent().parent().parent().attr("id")).substring(11);
    e.stopPropagation();
    $(".addElement").addClass("inDraggable");
    let items = $(".elementTable");
    $(`#elemPageFor${id}`).attr("draggable", true);
    let movIng = $(`#elemPageFor${id}`);
    $(`#elemPageFor${id}`).on("dragstart", () => (setTimeout(() => ($(`#elemPageFor${id}`).addClass("dragging")), 0)));
    $(`#elemPageFor${id}`).on("dragend", () => {$(`#elemPageFor${id}`).removeClass("dragging")});
    $(".inDraggable").on("dragover", function(e){
      let itemsWithout = $(".elementTable:not(.dragging)");
      itemsWithout = Object.keys(itemsWithout).map((key) => itemsWithout[key]);
      itemsWithout.pop();
      itemsWithout.pop();
      let addElem = Object.keys($(".addElement")).map((key) => $(".addElement")[key]);
      addElem.pop()
      addElem.pop()
      let over = itemsWithout.find((element) => {
        let yPos = element.getBoundingClientRect().top;
        if (e.clientY >= yPos && e.clientY <= yPos + element.offsetHeight) {
        }
        return e.clientY >= yPos && e.clientY <= yPos + element.offsetHeight;
      });
      let overTwo = addElem.find((element) => {
        let yPos = element.getBoundingClientRect().top;
        return e.clientY >= yPos && e.clientY <= yPos + element.offsetHeight;
      });
      if (over != undefined) {
        console.log(over);
        $(`#elemPageFor${id}`).insertBefore(`#${over.id}`);
      }
      if (overTwo != undefined) {
        console.log(overTwo);
        $(`#elemPageFor${id}`).insertBefore(`#${overTwo.id}`)
      }
    });
    $(".addElement").removeClass("inDraggable");
    let after = $(`#elemPageFor${id}`).next().attr('id').substring(11);
    console.log($(`#elemPageFor${id}`).next().attr('id').substring(11));
    console.log(id);
    console.log(after)
    let section = $(`#elemPageFor${id}`).parent().prev().attr('id').substring(11);
    let obj = QidSearcher[id].object;
    obj.move(after);
  });

  $(".elemTableMove").on("mouseup", function(){
    $(this).parent().parent().parent().removeClass("dragging");
    $(`#elemPageFor${id}`).off();
    $(".inDraggable").off();
  });

  $(".elemTableEdit").on("click", function(e){
    editElement(($(this).parent().parent().parent().attr("id")).substring(11));
    e.stopPropagation();
  });

  $(".elemTableTrash").on("click", function(e){
    deleteElement(($(this).parent().parent().parent().attr("id")).substring(11));
    e.stopPropagation();
  });
 
  pendingChanges = true;
}

function getElementType(destination, elemPageParent) {
  $("#formSectionContainer").show();
  $("#formSection").show(); 
  $("#cancelTypeChoosing").on("click", function(){
    cancelSelection();
  });
  $("#proccessTypeChoice").on("click", function(){
    processType();
  });
  $("#cancelNumberInputbu").on("click", function(){
    cancelNumberInput();
  });
  $("#proccessNumberInputbu").on("click", function(){
    proccessNumberInput(destination, elemPageParent);
  });
}

function deleteSection(section) {
  
}

function moveSection() {
  
} 

function deleteElement(id) {
  QidSearcher[id].object.delete();
  console.log("Deleteing: " + id)
}

function editElement(id) {
  let element = QidSearcher[id].object;
  console.log(element);
  $("#makeNumberIn").children().last().remove();
  $("#makeNumberIn").children().last().remove();
  let advOp = $("#makeNumberIn").children().last();
  $(advOp).children().last().html("Edit Lists");
  $(advOp).children().last().prev().html("Edit Patterns");
  $(advOp).children().last().prev().prev().html("Edit Errors");
  $("#makeNumberIn").append(`<button style="margin-top: 10px;" id="cancelNumberInputbuEdit" class="button">Cancel</button>`);
  $("#makeNumberIn").append(`<button style="margin-top: 10px;" id="proccessNumberInputbuEdit" class="button">Next</button>`);
  $("#labelNumIn").val(element.label);
  $("#placholderNumIn").val(element.placeholder);
  $("#requiredNumIn").prop("checked", element.required);
  $("#minNumIn").val(element.min);
  $("#maxNumIn").val(element.max);
  $("#stepNumIn").val(element.step);
  $("#readonlyNumIn").prop("checked", element.readonly);
  $("#customNameNumIn").prop("checked", element.nameIsCustom);
  $("#nameNumIn").val(element.nameIsCustom == true ? element.name : "");
  $("#valueNumIn").val(element.value);
  $("#cancelNumberInputbuEdit").on("click", function(){
    cancelNumberInputEdit();
  });
  $("#proccessNumberInputbuEdit").on("click", function(){
    processNumberInputEdit(element);
  });
  $("#makeNumberInContainer").show();
  $("#makeNumberIn").show();
}

function cancelNumberInputEdit() {
  $("#makeNumberIn").children().last().remove();
  $("#makeNumberIn").children().last().remove();
  let advOp = $("#makeNumberIn").children().last();
  $(advOp).children().last().html("+ Add List");
  $(advOp).children().last().prev().html("+ Add Pattern");
  $(advOp).children().last().prev().prev().html("Add Error");
  $("#makeNumberIn").append(`<button style="margin-top: 10px;" id="cancelNumberInputbu" class="button">Cancel</button>`);
  $("#makeNumberIn").append(`<button style="margin-top: 10px;" id="proccessNumberInputbu" class="button">Next</button>`);
  $("#labelNumIn").val("");
  $("#placholderNumIn").val("");
  $("#requiredNumIn").prop("checked", false);
  $("#minNumIn").val("");
  $("#maxNumIn").val("");
  $("#stepNumIn").val("");
  $("#readonlyNumIn").prop("checked", false);
  $("#customNameNumIn").prop("checked", false);
  $("#nameNumIn").val("");
  $("#valueNumIn").val("");
  $("#cancelNumberInputbu").off();
  $("#proccessNumberInputbu").off();
  $("#makeNumberInContainer").hide();
  $("#makeNumberIn").hide();
}

function processNumberInputEdit(element) {
  let info = $("#makeNumberIn").serializeArray();
  console.log(info);
  element.changeLabel(info[(findIndexInArrayOfObjects(info, "name", "labelNumIn")[0])].value);
  element.changeAttr("value", info[(findIndexInArrayOfObjects(info, "name", "valueNumIn")[0])].value);
  element.changeAttr("placeholder", info[(findIndexInArrayOfObjects(info, "name", "placeholderNumIn")[0])].value);
  element.changeAttr("max", info[(findIndexInArrayOfObjects(info, "name", "maxNumIn")[0])].value);
  element.changeAttr("min", info[(findIndexInArrayOfObjects(info, "name", "minNumIn")[0])].value);
  element.changeAttr("step", info[(findIndexInArrayOfObjects(info, "name", "stepNumIn")[0])].value);
  let readonlyQ = findIndexInArrayOfObjects(info, "name", "readonlyNumIn") == -1 ? false : true;
  let requiredQ = findIndexInArrayOfObjects(info, "name", "requiredNumIn") == -1 ? false : true;
  let nameIsCustom = findIndexInArrayOfObjects(info, "name", "customNameNumIn") != -1 ? true : false;
  let nameOf;
  if (findIndexInArrayOfObjects(info, "name", "customNameNumIn") == -1) {
    nameOf = info[(findIndexInArrayOfObjects(info, "name", "labelNumIn"))[0]].value;
    nameOf = nameOf.replace(/\s/g, "");
  } else {
    nameOf = info[(findIndexInArrayOfObjects(info, "name", "nameNumIn"))[0]].value;
    nameOf = nameOf.replace(/\s/g, "");
  }
  element.changeInfo("nameIsCustom", nameIsCustom);
  element.changeAttr("required", requiredQ);
  element.changeAttr("readonly", readonlyQ);
  element.changeAttr("name", nameOf);
  $(`#elemPageFor${element.id}`).children().first().children().children().first().next().html(`${element.type} - ${element.label}`);
  $("#makeNumberIn").children().last().remove();
  $("#makeNumberIn").children().last().remove();
  let advOp = $("#makeNumberIn").children().last();
  $(advOp).children().last().html("+ Add List");
  $(advOp).children().last().prev().html("+ Add Pattern");
  $(advOp).children().last().prev().prev().html("Add Error");
  $("#makeNumberIn").append(`<button style="margin-top: 10px;" id="cancelNumberInputbu" class="button">Cancel</button>`);
  $("#makeNumberIn").append(`<button style="margin-top: 10px;" id="proccessNumberInputbu" class="button">Next</button>`);
  $("#labelNumIn").val("");
  $("#placholderNumIn").val("");
  $("#requiredNumIn").prop("checked", false);
  $("#minNumIn").val("");
  $("#maxNumIn").val("");
  $("#stepNumIn").val("");
  $("#readonlyNumIn").prop("checked", false);
  $("#customNameNumIn").prop("checked", false);
  $("#nameNumIn").val("");
  $("#valueNumIn").val("");
  $("#cancelNumberInputbu").off();
  $("#proccessNumberInputbu").off();
  $("#makeNumberInContainer").hide();
  $("#makeNumberIn").hide();
}