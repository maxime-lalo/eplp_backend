import {Express} from "express";
import userRouter from './user.route';
import partyRouter from './party.route';
import defaultsRouter from './defaults.route';
import secretRouter from './secret.route';

export function buildRoutes(app: Express) {
    app.use("/user", userRouter);
    app.use("/party", partyRouter);
    app.use("/defaults", defaultsRouter);
    app.use("/secret", secretRouter);
}