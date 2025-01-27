import express, { Request, Response } from "express";
import path from 'path';

const app = express();
const PORT = 8004;

app.use(express.json());

app.use(express.static(path.join(__dirname + "/../client/static/")))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
});