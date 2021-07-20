import {User, IUserProps} from "../models";
import {Connection, escape, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import { hash, compare } from "bcrypt";
export interface UserGetAllOptions {
    limit?: number,
    offset?: number
}

export class UserController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    async getAll(options?: UserGetAllOptions): Promise<User[]> {
        options = options || {};
        const limit = options.limit || 20;
        const offset = options.offset || 0;
        const res = await this.connection.query(`SELECT id, pseudo, first_name, last_name, email, creation_date, update_date, active FROM user LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if(Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function(row) {
                return new User({
                    id: parseInt(row["id"]),
                    pseudo: row["pseudo"],
                    firstName: row["first_name"],
                    lastName: row["last_name"],
                    email: row["email"],
                    creationDate: new Date(row["creation_date"]),
                    updateDate: new Date(row["update_date"]),
                    active: row["active"]
                })
            });
        }
        return [];
    }

    async getById(id: string): Promise<User | null> {
        const res = await this.connection.query(`SELECT id, pseudo, first_name, last_name, email, creation_date, update_date, active FROM user WHERE id = ${escape(id)}`);
        const data = res[0];
        if(Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if(rows.length > 0) {
                const row = rows[0];
                return new User({
                    id: parseInt(row["id"]),
                    pseudo: row["pseudo"],
                    firstName: row["first_name"],
                    lastName: row["last_name"],
                    email: row["email"],
                    creationDate: new Date(row["creation_date"]),
                    updateDate: new Date(row["update_date"]),
                    active: row["active"]
                })
            }
        }
        return null;
    }

    async getByToken(token: string): Promise<User | null> {
        const res = await this.connection.query(`SELECT id, pseudo, first_name, last_name, email, creation_date, update_date, active FROM user WHERE token = ${escape(token)}`);
        const data = res[0];
        if(Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if(rows.length > 0) {
                const row = rows[0];
                return new User({
                    id: parseInt(row["id"]),
                    pseudo: row["pseudo"],
                    firstName: row["first_name"],
                    lastName: row["last_name"],
                    email: row["email"],
                    creationDate: new Date(row["creation_date"]),
                    updateDate: new Date(row["update_date"]),
                    active: row["active"]
                })
            }
        }
        return null;
    }

    async create(user: IUserProps): Promise<User | null> {
        try {
            const res = await this.connection.execute("INSERT INTO user (pseudo, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)", [
                user.pseudo,
                user.firstName,
                user.lastName,
                user.email,
                user.password
            ]);
            const headers = res[0] as ResultSetHeader;
            return new User({
                ...user,
                id: headers.insertId
            });
        } catch(err) {
            console.error(err); // log dans un fichier c'est mieux
            return null;
        }
    }

    async login(email: string, password: string): Promise<string | null>{
        try{
            const res = await this.connection.query(`SELECT id,password FROM user WHERE email = ${escape(email)}`);
            const data = res[0];
            if(Array.isArray(data)) {
                const rows = data as RowDataPacket[];
                if(rows.length > 0) {
                    const row = rows[0];
                    const isSamePassword = await compare(password, row['password']);
                    if (!isSamePassword){
                        return null;
                    }else{
                        const token = await hash(Date.now() + email, 5);
                        const res2 = await this.connection.execute(`UPDATE user SET token = ${escape(token)},last_connection= NOW() WHERE id = ${row['id']}`);
                        return token;
                    }
                }
            }
            return null;
        } catch(err) {
            console.error(err); // log dans un fichier c'est mieux
            return null;
        }
    }
}