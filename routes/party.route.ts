import express from 'express';
import {DatabaseUtils} from "../database";
import {DefaultsController, PartyController} from "../controllers";
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

router.post("/addModule", authMiddleware, partyAdminMiddleware, async function(req, res) {
    const partyId = req.body.party;
    const moduleId = req.body.module;

    const connection = await DatabaseUtils.getConnection();

    const partyController = new PartyController(connection);
    const defaultsController = new DefaultsController(connection);

    let module = await defaultsController.getModule(moduleId);
    let party = await partyController.getById(partyId);
    
    if(module !== null && party !== null){
        const moduleAdded = await partyController.addModule(party,module);
        if(moduleAdded === null) {
            res.status(500).end();
        } else {
            res.status(201);
            res.json(moduleAdded);
        }
    }else{
        res.status(404).json({
            "error" : "The module or the party you're looking for wasn't found"
        }).end();
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
        creator: res.locals.user.id,
        modules : []
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

router.post("/modifyParameter", authMiddleware, partyAdminMiddleware, async function(req,res){
    const party = res.locals.party;
    const parameter = req.body.parameter;
    const newValue = req.body.value;

    if(parameter === undefined || newValue === undefined){
        res.status(400).json({
            "error": "Missing parameters"
        }).end();
    }else{
        const connection = await DatabaseUtils.getConnection();
        const partyController = new PartyController(connection);
        const parameterModified = await partyController.modifyParameter(parameter,newValue, party);

        if(parameterModified){
            res.status(200).json({
                "success": "Parameter modified"
            }).end();
        }else{
            res.status(500).json({
                "error": "Server error"
            }).end();
        }
    }
})

export default router;