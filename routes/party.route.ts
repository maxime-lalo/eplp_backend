import express from 'express';
import {DatabaseUtils} from "../database";
import {DefaultsController, PartyController} from "../controllers";
import { authMiddleware, partyAdminMiddleware,partyParticipantMiddleware } from '../middlewares';
import { apiReturnCodes } from '../api_return_codes';
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

router.post("/module", authMiddleware, partyAdminMiddleware, async function(req, res) {
    const partyId = req.body.party;
    const moduleId = req.body.module;

    const connection = await DatabaseUtils.getConnection();

    const partyController = new PartyController(connection);
    const defaultsController = new DefaultsController(connection);

    let module = await defaultsController.getModule(moduleId);
    let party = await partyController.getById(partyId);
    
    if(module !== null && party !== null){
        const moduleAdded = await partyController.addModule(party,module);
        if(Number(moduleAdded)) {
            switch(Number(moduleAdded)){
                case apiReturnCodes.SUCCESS:
                    res.status(201).json({
                        "success": "The module has been reactivated"
                    }).end();
                    break;
                case apiReturnCodes.DB_ERROR:
                    res.status(500).json({
                        "error": "Server error"
                    }).end();
                    break;
                case apiReturnCodes.NOT_FOUND:
                    res.status(500).json({
                        "error": "Module or party not found"
                    }).end();
                    break;
                    case apiReturnCodes.ALREADY_PRESENT:
                        res.status(400).json({
                            "error": "The module is already in this party"
                        }).end();
                        break;
                default:
                    res.status(500).json({
                        "error": "server error"
                    })
                    break;
            }
        } else {
            res.status(201).json(moduleAdded);
        }
    }else{
        res.status(404).json({
            "error" : "The module or the party you're looking for wasn't found"
        }).end();
    }
});

router.delete("/module", authMiddleware, partyAdminMiddleware, async function(req, res) {
    const partyId = req.body.party;
    const moduleId = req.body.module;

    const connection = await DatabaseUtils.getConnection();

    const partyController = new PartyController(connection);

    let party = await partyController.getById(partyId);
    
    if(party !== null){
        let module = null;
        for(let i = 0; i < party.modules.length; i++){
            if(party.modules[i].id === Number(moduleId)){
                module = party.modules[i];
            }
        }

        if(module !== null){
            const moduleAdded = await partyController.removeModule(module);
            if(moduleAdded === null) {
                res.status(500).end();
            } else {
                res.status(201).json({
                    "success": "The module has been removed from the party"
                });
            }
        }else{
            res.status(400).json({
                "error": "The module you want to remove is not in this party"
            })
        }
    }else{
        res.status(404).json({
            "error" : "The party you're looking for wasn't found"
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

router.post("/user", authMiddleware, partyAdminMiddleware, async function(req, res) {
    const party = res.locals.party;
    const inviter = res.locals.user;
    const invited = req.body.user;

    if (invited !== undefined){
        const connection = await DatabaseUtils.getConnection();
        const partyController = new PartyController(connection);
        const invitation = await partyController.inviteUser(inviter.id, invited, party.id);
        if(Number(invitation)) {
            if(invitation === apiReturnCodes.DB_ERROR){
                res.status(500).json({
                    "error": "Database error"
                }).end();
            }else{
                res.status(400).json({
                    "error": "User already invited to this party"
                }).end();
            }
        } else {
            res.status(201).json(invitation);
        }
    }
});

router.delete("/user", authMiddleware, partyAdminMiddleware, async function(req, res) {
    const party = res.locals.party;
    const inviter = res.locals.user;
    const invited = req.body.user;

    if (invited !== undefined){
        const connection = await DatabaseUtils.getConnection();
        const partyController = new PartyController(connection);
        const removeUser = await partyController.removeUser(invited, party);
        if(removeUser === apiReturnCodes.SUCCESS) {
            res.status(201).json({"success":"The user has been removed from the party"});
        } else {
            switch(removeUser){
                case apiReturnCodes.PARTY_NOT_FOUND:
                    res.status(400).json({
                        "error": "The party you're referring wasn't found"
                    })
                    break;
                case apiReturnCodes.USER_NOT_FOUND:
                    res.status(400).json({
                        "error": "The user you're referring is not in this party"
                    })
                    break;
                case apiReturnCodes.DB_ERROR:
                    res.status(500).json({
                        "error": "Database error"
                    })
                    break;
            }
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
        if(parameterModified === apiReturnCodes.SUCCESS){
            res.status(200).json({
                "success": "The parameter has been updated"
            }).end();
        }else{
            switch(parameterModified){
                case apiReturnCodes.NOT_FOUND:
                    res.status(404).json({
                        "error": "The module or the parameter has not been found"
                    }).end();
                    break;
                case apiReturnCodes.ALREADY_PRESENT:
                    res.status(400).json({
                        "error": "The parameter already had that value"
                    }).end();
                    break;
                default:
                    res.status(500).json({
                        "error": "Server error"
                    }).end();
                    break;
            }
        }
    }
})

export default router;