viewSaveLoadPage()

function save(name) {
  let formHTML = $("#preview").html().toString() // Gets the HTML of the sample form
  
  let save = {
    masterJSON: master,
    html: formHTML
  }

  postData({action: "saveForm", name: name, data: save}, true)
}

let exampleLoadMaster = {
    "title": "Very cool form",
    "sections": {
        "s0": {
            "name": "Titled Section",
            "id": "TitledSectionKdlK",
            "childQuestions": {
                "q0": {
                    "type": "Number Input",
                    "label": "label",
                    "nameIsCustom": false,
                    "name": "label",
                    "value": "",
                    "placeholder": "palce",
                    "readonly": false,
                    "required": false,
                    "id": "labelvRKe",
                    "index": 0,
                    "parent": "s0",
                    "parentIndex": 0
                }
            },
            "object": {
                "name": "Titled Section",
                "id": "TitledSectionKdlK",
                "location": "s0"
            }
        },
        "s1": {
            "name": "Untitled Section2",
            "id": "UntitledSectionPxTNu",
            "childQuestions": {
                "q0": {
                    "type": "Number Input",
                    "label": "test #1",
                    "nameIsCustom": false,
                    "name": "test#1",
                    "value": "",
                    "placeholder": "nice",
                    "readonly": false,
                    "required": false,
                    "id": "testD1Yzcb",
                    "index": 1,
                    "parent": "s1",
                    "parentIndex": 0,
                    "min": "",
                    "max": "",
                    "step": ""
                },
                "q1": {
                    "type": "Number Input",
                    "label": "test #2",
                    "nameIsCustom": false,
                    "name": "test#2",
                    "value": "",
                    "placeholder": "jjj",
                    "readonly": false,
                    "required": true,
                    "id": "testQpbJde",
                    "index": 2,
                    "parent": "s1",
                    "parentIndex": 1,
                    "min": "",
                    "max": "",
                    "step": ""
                },
                "q2": {
                    "type": "Number Input",
                    "label": "test #3",
                    "nameIsCustom": false,
                    "name": "test#3",
                    "value": "",
                    "placeholder": "jjjffff",
                    "readonly": false,
                    "required": true,
                    "id": "tests3SMXD",
                    "index": 3,
                    "parent": "s1",
                    "parentIndex": 2,
                    "min": "",
                    "max": "",
                    "step": ""
                }
            },
            "object": {
                "name": "Untitled Section2",
                "id": "UntitledSectionPxTNu",
                "location": "s1"
            }
        },
        "s2": {
            "name": "new section #3",
            "id": "newsectionx3zxpd",
            "childQuestions": {
                "q0": {
                    "type": "Number Input",
                    "label": "test #4",
                    "nameIsCustom": false,
                    "name": "test#4",
                    "value": "",
                    "placeholder": "",
                    "readonly": false,
                    "required": true,
                    "id": "testn4lTgM",
                    "index": 4,
                    "parent": "s2",
                    "parentIndex": 0,
                    "min": "",
                    "max": "",
                    "step": ""
                },
                "q1": {
                    "type": "Number Input",
                    "label": "test #5",
                    "nameIsCustom": false,
                    "name": "test#5",
                    "value": "",
                    "placeholder": "placeholder 5",
                    "readonly": false,
                    "required": true,
                    "id": "testS5xDOv",
                    "index": 5,
                    "parent": "s2",
                    "parentIndex": 1,
                    "min": "",
                    "max": "",
                    "step": ""
                }
            },
            "object": {
                "name": "new section #3",
                "id": "newsectionx3zxpd",
                "location": "s2"
            }
        }
    },
    "ids": [
        "TitledSectionKdlK",
        "UntitledSectionPxTNu",
        "labelvRKe",
        "testD1Yzcb",
        "testQpbJde",
        "tests3SMXD",
        "newsectionx3zxpd",
        "testn4lTgM",
        "testS5xDOv"
    ],
    "questions": {
        "q0": {
            "type": "Number Input",
            "label": "label",
            "nameIsCustom": false,
            "name": "label",
            "value": "",
            "placeholder": "palce",
            "readonly": false,
            "required": false,
            "id": "labelvRKe",
            "index": 0,
            "parent": "s0",
            "parentIndex": 0
        },
        "q1": {
            "type": "Number Input",
            "label": "test #1",
            "nameIsCustom": false,
            "name": "test#1",
            "value": "",
            "placeholder": "nice",
            "readonly": false,
            "required": false,
            "id": "testD1Yzcb",
            "index": 1,
            "parent": "s1",
            "parentIndex": 0,
            "min": "",
            "max": "",
            "step": ""
        },
        "q2": {
            "type": "Number Input",
            "label": "test #2",
            "nameIsCustom": false,
            "name": "test#2",
            "value": "",
            "placeholder": "jjj",
            "readonly": false,
            "required": true,
            "id": "testQpbJde",
            "index": 2,
            "parent": "s1",
            "parentIndex": 1,
            "min": "",
            "max": "",
            "step": ""
        },
        "q3": {
            "type": "Number Input",
            "label": "test #3",
            "nameIsCustom": false,
            "name": "test#3",
            "value": "",
            "placeholder": "jjjffff",
            "readonly": false,
            "required": true,
            "id": "tests3SMXD",
            "index": 3,
            "parent": "s1",
            "parentIndex": 2,
            "min": "",
            "max": "",
            "step": ""
        },
        "q4": {
            "type": "Number Input",
            "label": "test #4",
            "nameIsCustom": false,
            "name": "test#4",
            "value": "",
            "placeholder": "",
            "readonly": false,
            "required": true,
            "id": "testn4lTgM",
            "index": 4,
            "parent": "s2",
            "parentIndex": 0,
            "min": "",
            "max": "",
            "step": ""
        },
        "q5": {
            "type": "Number Input",
            "label": "test #5",
            "nameIsCustom": false,
            "name": "test#5",
            "value": "",
            "placeholder": "placeholder 5",
            "readonly": false,
            "required": true,
            "id": "testS5xDOv",
            "index": 5,
            "parent": "s2",
            "parentIndex": 1,
            "min": "",
            "max": "",
            "step": ""
        }
    },
    "QidSearcher": {
        "labelvRKe": {
            "type": "Number Input",
            "qIndex": 0,
            "parent": "s0",
            "parentIndex": 0,
            "object": {
                "type": "Number Input",
                "label": "label",
                "nameIsCustom": false,
                "name": "label",
                "value": "",
                "placeholder": "palce",
                "readonly": false,
                "required": false,
                "id": "labelvRKe",
                "index": 0,
                "parent": "s0",
                "parentIndex": 0
            }
        },
        "testD1Yzcb": {
            "type": "Number Input",
            "qIndex": 1,
            "parent": "s1",
            "parentIndex": 0,
            "object": {
                "type": "Number Input",
                "label": "test #1",
                "nameIsCustom": false,
                "name": "test#1",
                "value": "",
                "placeholder": "nice",
                "readonly": false,
                "required": false,
                "id": "testD1Yzcb",
                "index": 1,
                "parent": "s1",
                "parentIndex": 0,
                "min": "",
                "max": "",
                "step": ""
            }
        },
        "testQpbJde": {
            "type": "Number Input",
            "qIndex": 2,
            "parent": "s1",
            "parentIndex": 1,
            "object": {
                "type": "Number Input",
                "label": "test #2",
                "nameIsCustom": false,
                "name": "test#2",
                "value": "",
                "placeholder": "jjj",
                "readonly": false,
                "required": true,
                "id": "testQpbJde",
                "index": 2,
                "parent": "s1",
                "parentIndex": 1,
                "min": "",
                "max": "",
                "step": ""
            }
        },
        "tests3SMXD": {
            "type": "Number Input",
            "qIndex": 3,
            "parent": "s1",
            "parentIndex": 2,
            "object": {
                "type": "Number Input",
                "label": "test #3",
                "nameIsCustom": false,
                "name": "test#3",
                "value": "",
                "placeholder": "jjjffff",
                "readonly": false,
                "required": true,
                "id": "tests3SMXD",
                "index": 3,
                "parent": "s1",
                "parentIndex": 2,
                "min": "",
                "max": "",
                "step": ""
            }
        },
        "testn4lTgM": {
            "type": "Number Input",
            "qIndex": 4,
            "parent": "s2",
            "parentIndex": 0,
            "object": {
                "type": "Number Input",
                "label": "test #4",
                "nameIsCustom": false,
                "name": "test#4",
                "value": "",
                "placeholder": "",
                "readonly": false,
                "required": true,
                "id": "testn4lTgM",
                "index": 4,
                "parent": "s2",
                "parentIndex": 0,
                "min": "",
                "max": "",
                "step": ""
            }
        },
        "testS5xDOv": {
            "type": "Number Input",
            "qIndex": 5,
            "parent": "s2",
            "parentIndex": 1,
            "object": {
                "type": "Number Input",
                "label": "test #5",
                "nameIsCustom": false,
                "name": "test#5",
                "value": "",
                "placeholder": "placeholder 5",
                "readonly": false,
                "required": true,
                "id": "testS5xDOv",
                "index": 5,
                "parent": "s2",
                "parentIndex": 1,
                "min": "",
                "max": "",
                "step": ""
            }
        }
    }
}

function load(masterToLoad) {

  changeTitleHTML(masterToLoad.title);
  
  // sections
  {
    let sectionKeys = Object.keys(masterToLoad.sections);
    for (let i = 0; i < sectionKeys.length; i++) {
      makeSectionHTML(masterToLoad.sections[sectionKeys[i]].name)
    }
  }

  // questions
  {
    let questionKeys = Object.keys(masterToLoad.questions);  
    for (let i = 0; i < questionKeys.length; i++) {
      
      let question = masterToLoad.questions[questionKeys[i]];

      // make new question based on type
      switch(question.type) {
          
        case "Number Input":
          let numInput = new NumberInput(question.label, question.nameIsCustom, question.name, question.value, question.placeholder, question.readonly, question.required);
          numInput.addToSection(question.parentIndex);
          break;
          
        default:
          alert("Error Loading Save: Unknown Question Type");
          
      }
    }
  }
  
}

load(exampleLoadMaster)

function viewSaveLoadPage() {
  $("#saveLoadPage").css("display", "inline-block");
}