import express from 'express';
import {DatabaseUtils} from "../database";
import {hash} from "bcrypt";
import {UserController} from "../controllers";

const router = express.Router();

router.get("/", async function(req, res) {
    const connection = await DatabaseUtils.getConnection();
    const userController = new UserController(connection);
    const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : undefined;
    const userList = await userController.getAll({
        limit,
        offset
    });
    res.json(userList);
});

router.get("/:id", async function(req, res) {
    const connection = await DatabaseUtils.getConnection();
    const userController = new UserController(connection);
    const user = await userController.getById(req.params.id);
    if(user === null) {
        res.status(404).end();
    } else {
        res.json(user);
    }
});

router.post("/", async function(req, res) {
    const pseudo = req.body.pseudo;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;

    if(
        pseudo === undefined || 
        firstName === undefined || 
        lastName === undefined ||
        email === undefined ||
        password === undefined
    ) {
        res.status(400).end();
        return;
    }

    const passwordHashed = await hash(password, 5);

    const connection = await DatabaseUtils.getConnection();
    const userController = new UserController(connection);
    const user = await userController.create({
        pseudo,
        firstName,
        lastName,
        email,
        password: passwordHashed
    });
    if(user === null) {
        res.status(500).end();
    } else {
        res.status(201);
        res.json(user);
    }
});

router.post("/auth", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    if(email === undefined || password === undefined) {
        res.status(400).end();
        return;
    }

    const passwordHashed = await hash(password, 5);

    const connection = await DatabaseUtils.getConnection();
    const userController = new UserController(connection);
    const token = await userController.login(email,password);
    if(token === null) {
        res.status(500).json({
            "error": "Wrong password or account not found"
        }).end();
    } else {
        res.status(201);
        res.json({
            token
        });
    }
});

export default router;