import express from 'express';
import {DatabaseUtils} from "../database";
import {SecretController} from "../controllers";

const router = express.Router();

router.get("/", async function(req, res) {
    const connection = await DatabaseUtils.getConnection();
    const userController = new SecretController(connection);
});

router.get("/:id", async function(req, res) {
    const connection = await DatabaseUtils.getConnection();
    const userController = new SecretController(connection);
});

export default router;