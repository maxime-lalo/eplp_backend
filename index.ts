import {config} from "dotenv";
config();
import express, {Express} from "express";

import {buildRoutes} from "./api/routes";

const app: Express = express();

app.use(express.json());

buildRoutes(app);

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`Listening on ${port}...`);
});