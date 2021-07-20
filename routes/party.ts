import express from 'express';
import {DatabaseUtils} from "../database";
import {PartyController} from "../controllers";
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

router.get("/", async function(req, res) {
    const connection = await DatabaseUtils.getConnection();
    const partyController = new PartyController(connection);
    const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
    const partyList = await partyController.getAll({
        limit,
        offset
    });
    res.json(partyList);
});

router.get("/:id", async function(req, res) {
    const connection = await DatabaseUtils.getConnection();
    const partyController = new PartyController(connection);
    const party = await partyController.getById(req.params.id);
    if(party === null) {
        res.status(404).end();
    } else {
        res.json(party);
    }
});

router.post("/", authMiddleware, async function(req, res) {
    const name = req.body.name;
    const endDate = req.body.endDate;
    
    if(
        name === undefined || 
        endDate === undefined 
    ) {
        res.status(400).end();
        return;
    }


    const connection = await DatabaseUtils.getConnection();
    const partyController = new PartyController(connection);
    const party = await partyController.create({
        name,
        endDate,
        creator: res.locals.user.id
    });
    if(party === null) {
        res.status(500).end();
    } else {
        res.status(201);
        res.json(party);
    }
});

export default router;