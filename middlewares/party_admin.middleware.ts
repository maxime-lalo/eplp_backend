import express from "express";
import {UserController} from "../controllers/user.controller";
import {PartyController} from "../controllers/party.controller";
import {DatabaseUtils} from "../database";

export async function partyAdminMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    const idParty = req.body.party;

    if(idParty !== undefined){
        const connection = await DatabaseUtils.getConnection();
        const partyController = new PartyController(connection);

        const party = await partyController.getById(idParty);
        if (party !== null) {
            res.locals.party = party;
            if(party.participants !== undefined){
                for(let i = 0; i < party.participants?.length; i++){
                    if( (party.participants[i].id == res.locals.user.id) && (party.participants[i].isPartyAdmin) ){
                        next();
                        return;
                    }
                }
            }
            
            res.status(403).json({
                "error": "You're not a party admin"
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