import express from 'express';
import {DatabaseUtils} from "../database";
import {PartyController} from "../controllers";
import { authMiddleware } from '../middlewares/auth.middleware';
import { partyAdminMiddleware } from '../middlewares/party_admin.middleware';

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

router.post("/invite", authMiddleware, partyAdminMiddleware, async function(req, res) {
    const party = res.locals.party;
    const inviter = res.locals.user;
    const invited = req.body.user;

    if (invited !== undefined){
        const connection = await DatabaseUtils.getConnection();
        const partyController = new PartyController(connection);
        const invitation = await partyController.inviteUser(inviter.id, invited, party.id);
        if(invitation === null) {
            res.status(500).end();
        } else {
            res.status(201);
            res.json(invitation);
        }
    }
});

export default router;