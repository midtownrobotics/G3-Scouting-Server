let currentlyDownloadedForms;

viewSaveLoadPage()

function save(name, overwrite = false) {
  let formHTML = $("#preview").html().toString() // Gets the HTML of the sample form
  
  let save = {
    masterJSON: master,
    html: formHTML,
    status: "none"
  }

  if (overwrite) {
    postData({action: "overwriteForm", name: name, data: save}, true)
  } else {
    postData({action: "saveForm", name: name, data: save}, true)
  }

  reloadFormList()

}

function load(form) {

  let masterToLoad = form.masterJSON

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

function viewSaveLoadPage() {
  $("#saveLoadPage").css("display", "inline-block");
}

$('#save-new-button').on('click', function() {
    save($('#save-new-name').val());
})

function reloadFormList() {
    fetch('/forms-get')
    .then(function(res) {
      return res.text()
    }).then(function(data) {
        data = JSON.parse(data)
        currentlyDownloadedForms = data;
        let forms = Object.keys(data);

        $("#formManager").empty()

        if (forms.length == 0) {
            $("#formManager").html(`<h5>Your forms will appear here...</h5>`)
        }
        
        for (let i=0;i < forms.length;i++) {

            let formData = data[forms[i]]
            $("#formManager").append(`
                <p style="text-align:left;" class="formManagerItem form-status-${formData.status}" id="formLI${i}">
                    <span ${formData.status == "deployed" ? 'style="font-weight: bold;"' : ""}>${forms[i]}</span>
                    <span style="float:right;">
                        <button class="load-button invisible-button">
                            <i title="Load" class="bi bi-upload"></i>&nbsp;
                        </button>
                        <button class="overwrite-button invisible-button">
                            <i title="Overwrite" class="bi bi-download"></i>&nbsp;
                        </button>
                        <button class="invisible-button">
                            <i title="Deploy" class="bi bi-cloud-upload"></i>
                        </button>
                        <button class="delete-button invisible-button">
                            <i title="Delete" class="bi bi-trash"></i>
                        </button>
                    </span>
                </p>
            `)
        }

        $('.load-button').off()
        $('.load-button').on('click', function() {
            let formID = $(this).parent().parent().attr("id").substring(6);
            if (currentlyDownloadedForms) {
                let forms = Object.keys(currentlyDownloadedForms);
                load(currentlyDownloadedForms[forms[formID]]);
            }
        })

        $('.delete-button').off()
        $('.delete-button').on('click', function() {
            let formID = $(this).parent().parent().attr("id").substring(6);
            if (currentlyDownloadedForms) {
                let forms = Object.keys(currentlyDownloadedForms);
                if (confirm(`You are about to delete ${forms[formID]}.`)) {
                    postData({action: "deleteForm", name: forms[formID]}, true).then(function(res) {
                        reloadFormList();
                    })
                }
            }
        })

        $('.overwrite-button').off()
        $('.overwrite-button').on('click', function() {
            let formID = $(this).parent().parent().attr("id").substring(6);
            if (currentlyDownloadedForms) {
                let forms = Object.keys(currentlyDownloadedForms);
                if (confirm(`You are about to overwrite ${forms[formID]}.`)) {
                    save(forms[formID], true)
                }
            }
        })
    })
}

reloadFormList()

// <p style="text-align:left;" class="formManagerItem">
//     FORM NAME HERE
//     <span style="float:right;">
//         <button class="invisible-button">
//             <i title="Load" class="bi bi-floppy"></i>&nbsp;
//         </button>
//         <button class="invisible-button">
//             <i title="Overright" class="bi bi-save"></i>&nbsp;
//         </button>
//         <button class="invisible-button">
//             <i title="Deploy" class="bi bi-upload"></i>
//         </button>
//         <button class="invisible-button">
//             <i title="Delete" class="bi bi-trash"></i>
//         </button>
//     </span>
// </p>