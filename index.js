const express = require('express');
const app = express();

const PORT = 8080;

app.get('/', (req, res) => {
    authenticate(req, res)
    res.sendFile(__dirname + '/static/index.html');
})

function authenticate () {
    const reject = () => {
        res.setHeader("www-authenticate", "Basic");
        res.sendStatus(401);
    };
    
    const authorization = req.headers.authorization;
    
    if (!authorization) {
        return reject();
    }
    
    const [username, password] = Buffer.from(authorization.replace("Basic ", ""), "base64").toString().split(":");
    
    if (!(username === "g3" && password === "cowabunga")) {
        return reject();
    }
}

console.log(`listening on port ${PORT}!`)
app.listen(PORT);