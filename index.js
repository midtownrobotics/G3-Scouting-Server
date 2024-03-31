const express = require('express');
const app = express();
const fs = require("fs");

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

    if (!auth || auth[0] !== 'g3' || auth[1] !== 'cowabunga') {
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

app.get('/pit', (req, res) => {
    formContent = fs.readFileSync("./src/qualitativeForm.html").toString();

    res.render('scouting', {title: 'Qualitative Scouting Form', form: formContent});
}) 

app.get('/pit', (req, res) => {
    formContent = fs.readFileSync("./src/quantitativeForm.html").toString();

    res.render('scouting', {title: 'Quantitative Scouting Form', form: formContent});
}) 

console.log(`listening on port ${PORT}!`);
app.listen(PORT);