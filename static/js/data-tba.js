let key
let qualMatches = []

async function async() {
    key = await postData({action: "getKey"});

    const allMatches = TBHAPI(`/event/${key}/matches`);

    for (let i = 0; i < allMatches.length; i++) {
        if (allMatches[i].comp_level == "qm") {
            qualMatches.push(allMatches[i])
        }
    }
    
    qualMatches.sort(JSONCompareByMatchNumber)

    $("#match-number").on("input propertychange paste", async function(){
        if ($(this).val() !== "") {
            search($("#search").val())
        } else {
            $("#blue").empty()
            $("#red").empty()
        }
    });

    $("#search").on("input propertychange paste", function(){
        search($(this).val())
    });
}

async()

async function displayData(matchNumb) {

    const match = qualMatches[matchNumb-1]

    $("#blue").empty()
    $("#red").empty()

    if (match.winning_alliance == "blue") {
        $("#blue-h3").css("font-weight", "bold");
        $("#red-h3").css("font-weight", "normal");
    } else {
        $("#red-h3").css("font-weight", "bold");
        $("#blue-h3").css("font-weight", "normal");
    }

    $("#blue").append(`<span>Won: ${match.winning_alliance == "blue" ? true : false}</span><br>`)
    $("#red").append(`<span>Won: ${match.winning_alliance == "red" ? true : false}</span><br>`)

    $("#blue").append(`<span>Teams: ${match.alliances.blue.team_keys[0].substring(3)}, ${match.alliances.blue.team_keys[1].substring(3)}, ${match.alliances.blue.team_keys[2].substring(3)}</span><br>`)
    $("#red").append(`<span>Teams: ${match.alliances.red.team_keys[0].substring(3)}, ${match.alliances.red.team_keys[1].substring(3)}, ${match.alliances.red.team_keys[2].substring(3)}</span><br>`)

    for (let i = 0; i < Object.keys(match.score_breakdown.blue).length; i++) {
        $("#blue").append(`<span>${camelCaseToWords(Object.keys(match.score_breakdown.blue)[i])}: ${match.score_breakdown.blue[Object.keys(match.score_breakdown.blue)[i]]}</span><br>`)
        $("#red").append(`<span>${camelCaseToWords(Object.keys(match.score_breakdown.blue)[i])}: ${match.score_breakdown.red[Object.keys(match.score_breakdown.blue)[i]]}</span><br>`)
    }
}

async function search(query) {
    await displayData($("#match-number").val())

    query = query.toLowerCase()

    const numberOfFieldsBlue = $("#blue").children("span").length
    const numberOfFieldsRed = $("#red").children("span").length

    let newBlue = "";
    let newRed = "";

    console.log(newRed)
        
    for(let i=0; i < numberOfFieldsBlue; i++) {
        if ($("#blue").children("span")[i].innerHTML.toLowerCase().split(':')[0].includes(query)) {
            newBlue += `<span>${$("#blue").children("span")[i].innerHTML}</span><br>`
        }
    }

    for(let i=0; i < numberOfFieldsRed; i++) {
        if ($("#red").children("span")[i].innerHTML.toLowerCase().split(':')[0].includes(query)) {
            newRed += `<span>${$("#red").children("span")[i].innerHTML}</span><br>`
        }
    }

    $("#blue").html(newBlue)
    $("#red").html(newRed)    
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