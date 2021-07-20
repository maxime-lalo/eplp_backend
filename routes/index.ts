import {Express} from "express";
import userRouter from './user';

export function buildRoutes(app: Express) {
    app.use("/user", userRouter);
}