const express = require('express');
const app = express();

const PORT = 8080;

app.use(express.static(__dirname + '/static'));

app.get('/', (req, res) => {
    res.sendFile('index.html');
})

console.log(`listening on port ${PORT}!`)
app.listen(PORT);