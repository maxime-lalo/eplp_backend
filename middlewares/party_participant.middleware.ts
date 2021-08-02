import express from "express";
import {PartyController} from "../controllers/party.controller";
import {DatabaseUtils} from "../database";

export async function partyParticipantMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    let idParty = req.body.party;

    if(idParty === undefined){
        idParty = req.params.id;
    }

    if(idParty !== undefined){
        const connection = await DatabaseUtils.getConnection();
        const partyController = new PartyController(connection);

        const party = await partyController.getById(idParty);
        if (party !== null) {
            res.locals.party = party;
            if(party.participants !== undefined){
                for(let i = 0; i < party.participants?.length; i++){
                    if(party.participants[i].id == res.locals.user.id){
                        next();
                        return;
                    }
                }
            }
            
            res.status(403).json({
                "error": "You're not a participant of this party"
            });
            return;
        } else {
            res.status(403);
            res.json({
                "error": "The party you're referring to doesn't exists"
            });
        }
    }else{
        res.status(401).json({
            "error": "Precise which party you want to work on"
        });
    }
}