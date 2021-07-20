import {Connection, createConnection} from 'mysql2/promise';

export class DatabaseUtils {

    private static connection?: Connection;

    static async getConnection(): Promise<Connection> {
        if(!DatabaseUtils.connection) {
            DatabaseUtils.connection = await createConnection({
                host: 'localhost',
                user: 'root',
                password: 'root', // ""
                database: "eplp_back",
                port: 3306
            });
        }
        return DatabaseUtils.connection;
    }
}