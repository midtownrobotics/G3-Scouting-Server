const express = require('express');
const app = express();
const fs = require("fs");
const reader = require('xlsx') 

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

// Read sheet

function getSheet(sheetToGet) {
    const file = reader.readFile(`./static/sheets/${sheetToGet}.xlsx`);
    const data = reader.utils.sheet_to_json(file.Sheets.Sheet1);
    return data;
}

getSheet('scouting')
  
console.log(`listening on port ${PORT}!`);
app.listen(PORT);