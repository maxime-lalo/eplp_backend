import express from "express";
import {UserController} from "../controllers/user.controller";
import {DatabaseUtils} from "../database";

export async function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    const auth = req.headers["authorization"];
    if (auth !== undefined){
        const token = auth.slice(7);
        const connection = await DatabaseUtils.getConnection();
        const userController = new UserController(connection);

        const user = await userController.getByToken(token);
        if (user !== null) {
            res.locals.user = user;
            next();
            return;
        } else {
            res.status(403);
            res.json({
                "error": "You must be logged in to use this API"
            });
        }
    } else {
        res.status(401);
        res.json({
            "error": "You must have an account to use this API"
        });
    }
}