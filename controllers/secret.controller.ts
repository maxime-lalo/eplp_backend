import {Secret, SecretGuess} from "../models";
import {Connection, escape, ResultSetHeader, RowDataPacket} from "mysql2/promise";

export class SecretController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }
}