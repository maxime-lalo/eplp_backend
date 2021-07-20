import {Party, IPartyProps} from "../models";
import {Connection, escape, ResultSetHeader, RowDataPacket} from "mysql2/promise";
export interface PartyGetAllOptions {
    limit?: number,
    offset?: number
}

export class PartyController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    async getAll(options?: PartyGetAllOptions): Promise<Party[]> {
        options = options || {};
        const limit = options.limit || 20;
        const offset = options.offset || 0;
        const res = await this.connection.query(`SELECT id, name, creator, creation_date, end_date FROM party LIMIT ${offset}, ${limit}`);
        const data = res[0];
        if(Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function(row) {
                return new Party({
                    id: parseInt(row["id"]),
                    name: row["name"],
                    creator: row["creator"],
                    creationDate: new Date(row["creation_date"]),
                    endDate: new Date(row["end_date"])
                })
            });
        }
        return [];
    }

    async getById(id: string): Promise<Party | null> {
        const res = await this.connection.query(`SELECT id, name, creator, creation_date, end_date FROM party WHERE id = ${escape(id)}`);
        const data = res[0];
        if(Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if(rows.length > 0) {
                const row = rows[0];
                return new Party({
                    id: parseInt(row["id"]),
                    name: row["name"],
                    creator: row["creator"],
                    creationDate: new Date(row["creation_date"]),
                    endDate: new Date(row["end_date"])
                })
            }
        }
        return null;
    }

    async create(party: IPartyProps): Promise<Party | null> {
        try {
            const res = await this.connection.execute("INSERT INTO party (name, creator, end_date) VALUES (?, ?, ?)", [
                party.name,
                party.creator,
                party.endDate
            ]);
            const headers = res[0] as ResultSetHeader;
            return new Party({
                ...party,
                id: headers.insertId
            });
        } catch(err) {
            console.error(err); // log dans un fichier c'est mieux
            return null;
        }
    }
}