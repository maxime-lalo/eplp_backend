import {Express} from "express";
import userRouter from './user';
import partyRouter from './party';
export function buildRoutes(app: Express) {
    app.use("/user", userRouter);
    app.use("/party", partyRouter);
}