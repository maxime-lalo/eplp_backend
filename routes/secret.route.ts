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

router.post("/test", authMiddleware, partyParticipantMiddleware, partyHasModuleMiddleware, async function(req, res) {
    const secret = req.body.secret;
    const target = req.body.target;

    const module = res.locals.module;

    if(secret === undefined || target === undefined){
        res.status(400).json({
            "error": "Missing field, secret or target"
        }).end();
    }

    const connection = await DatabaseUtils.getConnection();
    const secretController = new SecretController(connection);

    const secrets = await secretController.testSecret(res.locals.party, res.locals.user, secret, target, module);

    switch(secrets){
        case apiReturnCodes.ALREADY_PRESENT:
            res.status(400).json({
                "error": "You already submitted a guess, you have to wait for the next one"
            }).end();
            break;
        case apiReturnCodes.SUCCESS:
            res.status(201).json({
                "success": "Request success and right secret"
            }).end();
            break;
        case apiReturnCodes.USER_ERROR:
            res.status(201).json({
                "success": "Request success but wrong secret"
            }).end();
            break;
        case apiReturnCodes.NOT_FOUND:
            res.status(400).json({
                "success": "The secret you provided doesn't exists"
            }).end();
            break;
        default:
            res.status(500).json({
                "error": "Server error"
            }).end();
            break;
    }
});

export default router;