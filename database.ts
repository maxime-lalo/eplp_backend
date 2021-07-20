import {config} from "dotenv";
config();
import {Connection, createConnection} from 'mysql2/promise';

export class DatabaseUtils {

    private static connection?: Connection;

    static async getConnection(): Promise<Connection> {
        if(!DatabaseUtils.connection) {
            DatabaseUtils.connection = await createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: Number.parseInt("" + process.env.DB_PORT)
            });
        }
        return DatabaseUtils.connection;
    }
}