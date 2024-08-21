let lastSavedMaster;
let currentlyDownloadedForms;

// Checks to see if current form has been modified since last save / load.
const beforeUnload = (e) => {
    if (JSON.stringify(master) !== lastSavedMaster) {
        e.preventDefault();
    }
}

window.addEventListener('beforeunload', beforeUnload);

function save(name, overwrite = false) {
    let formHTML = $("#preview").html().toString() // Gets the HTML of the sample form
  
    let save = {
        masterJSON: master,
        html: formHTML,
        status: "none"
    }

    postData({action: (overwrite ? "overwriteForm" : "saveForm"), name: name, data: save}, true).then(function(res){
        if (res == "OK") {
            lastSavedMaster = JSON.stringify(master);
        }
    })

    reloadFormList()

}

function load(form) {

    let masterToLoad = form.masterJSON
    lastSavedMaster = masterToLoad
    
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
                    break;
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
            $("#formManager").html(`<br><h5>Your forms will appear here...</h5>`)
        }
        
        for (let i=0;i < forms.length;i++) {

            let formData = data[forms[i]]
            $("#formManager").append(`
                <p style="text-align:left;" class="formManagerItem form-status-${formData.status}" id="formLI${i}">
                    <span ${formData.status == "deployed" ? 'style="font-weight: bold;"' : ""}>${forms[i]}</span>
                    <span style="float:right;">
                        <button class="load-button invisible-button">
                            <i title="Load" class="bi bi-cloud-download"></i>&nbsp;
                        </button>
                        <button class="overwrite-button invisible-button">
                            <i title="Overwrite" class="bi bi-cloud-upload"></i>&nbsp;
                        </button>
                        ${
                            formData.status != "deployed" ? 
                                '<button class="deploy-button invisible-button"> <i title="Deploy" class="bi bi-send"></i> </button>'
                            :
                                '<button class="undeploy-button invisible-button"> <i title="Undeploy" class="bi bi-cloud-slash"></i> </button>'
                        }
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
                if (confirm(`You are about to overwrite ${forms[formID]}. This will undeploy it.`)) {
                    save(forms[formID], true)
                }
            }
        })

        $('.deploy-button').off()
        $('.deploy-button').on('click', function() {
            let formID = $(this).parent().parent().attr("id").substring(6);
            if (currentlyDownloadedForms) {
                let forms = Object.keys(currentlyDownloadedForms);
                if (confirm(`You are about to deploy ${forms[formID]}.`)) {
                    postData({action: "deployForm", name: forms[formID], data: false}, true).then(function(res) {
                        reloadFormList();
                    })
                }
            }
        })

        $('.undeploy-button').off()
        $('.undeploy-button').on('click', function() {
            let formID = $(this).parent().parent().attr("id").substring(6);
            if (currentlyDownloadedForms) {
                let forms = Object.keys(currentlyDownloadedForms);
                if (confirm(`You are about to undeploy ${forms[formID]}.`)) {
                    postData({action: "deployForm", name: forms[formID], data: true}, true).then(function(res) {
                        reloadFormList();
                    })
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