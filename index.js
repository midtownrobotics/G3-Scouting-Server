const express = require('express');
const app = express();

const PORT = 8080;

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


app.use(express.static(__dirname + "/static"))

console.log(`listening on port ${PORT}!`)
app.listen(PORT);