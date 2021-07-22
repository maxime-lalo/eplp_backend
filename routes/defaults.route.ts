import express from 'express';
import {DatabaseUtils} from "../database";
import {DefaultsController} from "../controllers";

const router = express.Router();

router.get("/mission", async function(req, res) {
    const connection = await DatabaseUtils.getConnection();
    const defaultsController = new DefaultsController(connection);
    const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
    const parameterList = await defaultsController.getAllMissions();
    res.json(parameterList);
});

router.get("/mission/:id", async function(req, res) {
    const connection = await DatabaseUtils.getConnection();
    const defaultsController = new DefaultsController(connection);
    const parameter = await defaultsController.getMission(Number(req.params.id));
    if(parameter === null) {
        res.status(404).end();
    } else {
        res.json(parameter);
    }
});

router.get("/module", async function(req, res) {
    const connection = await DatabaseUtils.getConnection();
    const defaultsController = new DefaultsController(connection);
    const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
    const parameterList = await defaultsController.getAllModules();
    res.json(parameterList);
});

router.get("/module/:id", async function(req, res) {
    const connection = await DatabaseUtils.getConnection();
    const defaultsController = new DefaultsController(connection);
    const parameter = await defaultsController.getModule(Number(req.params.id));
    if(parameter === null) {
        res.status(404).end();
    } else {
        res.json(parameter);
    }
});

router.get("/parameters/:id", async function(req, res) {
    const connection = await DatabaseUtils.getConnection();
    const defaultsController = new DefaultsController(connection);
    const parameters = await defaultsController.getModuleParameters(Number(req.params.id));
    if(parameters === null) {
        res.status(404).end();
    } else {
        res.json(parameters);
    }
});

export default router;