const express = require('express');
const app = express();
const fs = require("fs");
const XLSX = require('xlsx') 

const PORT = 8080;

app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(function(req, res, next) {
    var auth;

    if (req.headers.authorization) {
        auth = Buffer.from(req.headers.authorization.substring(6), 'base64').toString().split(':');
    }

    if (!auth || auth[0] !== 'g3' || auth[1] !== 'testing') {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="G3"');
        res.end('Unauthorized');
    } else {
        next();
    }
});

app.use(express.static(__dirname + '/static/'));

app.get('/pit', (req, res) => {
    formContent = fs.readFileSync("./src/pitForm.html").toString();

    res.render('scouting', {title: 'Pit Scouting Form', form: formContent});
}) 

app.get('/qualitative', (req, res) => {
    formContent = fs.readFileSync("./src/qualitativeForm.html").toString();

    res.render('scouting', {title: 'Qualitative Scouting Form', form: formContent});
}) 

app.get('/quantitative', (req, res) => {
    formContent = fs.readFileSync("./src/quantitativeForm.html").toString();

    res.render('scouting', {title: 'Quantitative Scouting Form', form: formContent});
}) 

app.get('/data', (req, res) => {
    res.render('data', {data: getSheet('scouting')});
})

app.get('/sheets', async (req, res) => {
    if (req.query.id) {
        const sheetToGet = req.query.id
        const file = XLSX.readFile("./src/sheets/" + sheetToGet + ".xlsx")
        let sheet = XLSX.utils.sheet_to_json(file.Sheets[file.SheetNames[0]])
        sheet.splice(0, 1)
        let newSheet = XLSX.utils.json_to_sheet(sheet)
        let newWorkBook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(newWorkBook, newSheet)
        await XLSX.writeFile(newWorkBook, "./src/sheets/displaySheets/" + sheetToGet + ".xlsx")
        res.sendFile(__dirname + '/src/sheets/displaySheets/' + sheetToGet + ".xlsx")
    } else {
        res.send("sheet not found")
    }
})

app.post('/post', (req, res) => {
    const action = req.body.action
    const body = req.body

    if (action == "getSheet" && body.sheet) {
        res.send({res: getSheet(body.sheet)});
    } else if (action == "addRow" && body.sheet && body.data) {
        addRowToSheet(body.sheet, body.data);
        res.send({res: "OK"});
    } else if (action == "addColumn" && body.sheet && body.data) {
        addColumnToSheet(body.sheet, body.data);
        res.send({res: "OK"});
    } else if (action == "deleteRow" && body.sheet && body.data) {
        deleteRowFromSheet(body.sheet, body.data);
        res.send({res: "OK"})
    } else {
        res.send({res: "Invalid Request"});
    }
})

// Read sheet

function getSheet(sheetToGet) {
    const file = XLSX.readFile(`./src/sheets/${sheetToGet}.xlsx`);
    const SheetName = file.SheetNames[0]
    const data = XLSX.utils.sheet_to_json(file.Sheets[SheetName]);
    return data;
}

// Add row

function addRowToSheet(sheet, data) {
    const file = XLSX.readFile(`./src/sheets/${sheet}.xlsx`)
    const SheetName = file.SheetNames[0]

    const fileJSON = XLSX.utils.sheet_to_json(file.Sheets[SheetName])
    const numberOfColumns = Object.keys(fileJSON[0]).length

    data.slice(0, numberOfColumns)

    let newWorkBook = file
    
    XLSX.utils.sheet_add_aoa(newWorkBook.Sheets[SheetName], [
        data
    ], {origin: -1});

    //console.log(newWorkBook.Sheets[SheetName])

    XLSX.writeFile(newWorkBook, `./src/sheets/${sheet}.xlsx`)
}

// Add column

function addColumnToSheet(sheet, name) {
    const file = XLSX.readFile(`./src/sheets/${sheet}.xlsx`)
    const SheetName = file.SheetNames[0]

    let newWorkBook = file
    let nextColumn;

    const lastColumn = newWorkBook.Sheets[SheetName]['!ref'].split(":")[1].replace(/\d/g, "") //|| newWorkBook.Sheets[SheetName]['!ref']

    if (newWorkBook.Sheets[SheetName][`${lastColumn}1`] !== undefined) {
        nextColumn = getNextKey(lastColumn)
    } else {
        nextColumn = lastColumn
    }
    
    XLSX.utils.sheet_add_aoa(newWorkBook.Sheets[SheetName], [[name],[name]], {origin: `${nextColumn}1`});

    console.log(file.Sheets[SheetName])

    XLSX.writeFile(newWorkBook, `./src/sheets/${sheet}.xlsx`)
}

// Delete Row

function deleteRowFromSheet(sheet, rowNumb) {
    const file = XLSX.readFile(`./src/sheets/${sheet}.xlsx`)
    let newSheet = XLSX.utils.sheet_to_json(file.Sheets[file.SheetNames[0]])
    newSheet.splice(rowNumb, 1)
    let newNewSheet = XLSX.utils.json_to_sheet(newSheet)
    let newWorkBook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(newWorkBook, newNewSheet)
    XLSX.writeFile(newWorkBook, "./src/sheets/" + sheet + ".xlsx")
}

// Gets the next column EX: AZ -> BA

function getNextKey(key) {
    if (key === 'Z') {
        return String.fromCharCode(key.charCodeAt() - 25) + String.fromCharCode(key.charCodeAt() - 25); // AA or aa
    } else {
        var lastChar = key.slice(-1);
        var sub = key.slice(0, -1);
        if (lastChar === 'Z') {
            return getNextKey(sub) + String.fromCharCode(lastChar.charCodeAt() - 25);
        } else {
            return sub + String.fromCharCode(lastChar.charCodeAt() + 1);
        }
    }
};

console.log(`listening on port ${PORT}!`);
app.listen(PORT);