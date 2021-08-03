import express from 'express';
import {DatabaseUtils} from "../database";
import {SecretController} from "../controllers";
import { partyHasModuleMiddleware , authMiddleware, partyParticipantMiddleware } from "../middlewares";
import { apiReturnCodes } from '../api_return_codes';
const router = express.Router();

router.get("/", authMiddleware, partyParticipantMiddleware, partyHasModuleMiddleware, async function(req, res) {
    const connection = await DatabaseUtils.getConnection();
    const secretController = new SecretController(connection);

    const secrets = await secretController.getPartySecrets(res.locals.party);
    res.json(secrets);
});

router.post("/", authMiddleware, partyParticipantMiddleware, partyHasModuleMiddleware, async function(req, res) {
    const secret = req.body.secret;
    const fakeSecret = req.body.fakeSecret;

    if(secret === undefined){
        res.status(400).json({
            "error": "Missing field : secret"
        }).end();
    }

    const connection = await DatabaseUtils.getConnection();
    const secretController = new SecretController(connection);

    const secrets = await secretController.addSecret(res.locals.party, res.locals.user, secret, fakeSecret);

    switch(secrets){
        case apiReturnCodes.ALREADY_PRESENT:
            res.status(400).json({
                "error": "You already submitted your secret"
            }).end();
            break;
        case apiReturnCodes.DB_ERROR:
            res.status(500).json({
                "error": "Server error"
            }).end();
        case apiReturnCodes.SUCCESS:
            res.status(201).json({
                "success": "Secret added"
            })
    }
});

export default router;