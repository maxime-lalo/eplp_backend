import express from "express";
import {PartyController} from "../controllers/party.controller";
import {DatabaseUtils} from "../database";

export async function partyHasModuleMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    let party = res.locals.party;
    let module = req.body.module;

    if (party !== null) {
        const connection = await DatabaseUtils.getConnection();
        const partyController = new PartyController(connection);
        if(party.modules !== undefined){
            for(let i = 0; i < party.modules.length; i++){
                if(party.modules[i].id == module){
                    res.locals.module = party.modules[i];
                    next();
                    return;
                }
            }
        }
        
        res.status(403).json({
            "error": "The module you're trying to access is not included in this party"
        });
        return;
    } else {
        res.status(403);
        res.json({
            "error": "The party you're referring to doesn't exists"
        });
    }
}