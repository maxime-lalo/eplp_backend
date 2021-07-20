import {Party, IPartyProps, User, UserParty} from "../models";
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
                    endDate: new Date(row["end_date"]),
                    participants: await this.getParticipants(row['id'])
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

            const res2 = await this.connection.execute("INSERT INTO user_party (user, party, invited_by, is_admin) VALUES (?, ?, ?, ?)", [
                party.creator,
                headers.insertId,
                party.creator,
                1
            ]);
            
            return new Party({
                ...party,
                id: headers.insertId
            });
        } catch(err) {
            console.error(err); // log dans un fichier c'est mieux
            return null;
        }
    }

    async getParticipants(idParty: number):Promise<User[]>{
        const res = await this.connection.query(`SELECT b.id, b.pseudo, b.first_name, b.last_name, b.email, b.creation_date, b.update_date, a.is_admin FROM user_party a INNER JOIN user b ON a.user = b.id WHERE a.party = ${idParty}`);
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
                    isPartyAdmin: row["is_admin"]
                })
            });
        }
        return [];
    }

    async inviteUser(idInviter: number, idInvited: number, idParty: number): Promise<Object | null>{
        const party = await this.getById("" + idParty);
        if (party?.participants !== undefined){
            for(let i = 0; i < party.participants.length; i++){
                if(party.participants[i].id == idInvited){
                    return null;
                }
            }
        }
        
        try {
            const res = await this.connection.execute("INSERT INTO user_party (user, party, invited_by) VALUES (?, ?, ?)", [
                idInvited,
                idParty,
                idInviter
            ]);
    
            return new Object({
                user: Number.parseInt("" + idInvited),
                party: idParty,
                invitedBy: idInviter
            });
        } catch(err) {
            console.error(err); // log dans un fichier c'est mieux
            return null;
        }
    }
}