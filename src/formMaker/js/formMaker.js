//Main objects
let idsList = [];
let sections = {};
let questions = {};
let QidSearcher = {};
let master = {"title": "Untitled Form", "sections": sections, "ids": idsList, "questions": questions, "QidSearcher": QidSearcher};
let pendingChanges = false;


$(document).ready(function() {
    if (Object.keys(sections) == 0) {
        let section = new SectionHead("Untitled Section");
        section.add();
    }
});


//Form Functioning:
$('#submitButton').click(function(e){
    e.preventDefault();
});