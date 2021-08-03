import {Party, Secret, SecretGuess, User} from "../models";
import {Connection, escape, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import { apiReturnCodes } from "../api_return_codes";
export class SecretController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    async getPartySecrets(party: Party):Promise<Secret[]>{
        const res = await this.connection.query(`SELECT id, user, secret, fake_secret, found_by FROM secret WHERE party = ${escape(party.id)}`);
        const data = res[0];
        if(Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            let secrets: Secret[] = [];
            for(let i = 0; i < rows.length; i++){
                secrets.push(new Secret({
                    id: parseInt(rows[i]['id']),
                    party,
                    secret: rows[i]['secret'],
                    fakeSecret: rows[i]['fake_secret'],
                    foundBy: rows[i]['found_by']
                }));
            }
            return secrets;
        }
        return [];
    }

    async addSecret(party:Party,user: User,secret: string,fakeSecret?:string): Promise<number> {
        try {
            const userSecret = await this.connection.query(`SELECT id, user, secret, fake_secret, found_by FROM secret WHERE user = ${escape(user.id)}`);
            const data = userSecret[0];
            if(Array.isArray(data) && data.length > 0) {
                return apiReturnCodes.ALREADY_PRESENT;
            }

            let res:any;
            if(fakeSecret != null){
                res = await this.connection.execute("INSERT INTO secret (user, secret, fake_secret, party) VALUES (?,?,?,?)", [
                    user.id,
                    secret,
                    fakeSecret,
                    party.id
                ]);
            }else{
                res = await this.connection.execute("INSERT INTO secret (user, secret, party) VALUES (?,?,?)", [
                    user.id,
                    secret,
                    party.id
                ]);
            }

            const headers = res[0] as ResultSetHeader;
            if(headers.affectedRows === 1){
                return apiReturnCodes.SUCCESS;
            }else{
                return apiReturnCodes.DB_ERROR;
            }
        }catch(e){
            return apiReturnCodes.DB_ERROR;
        }
    }
}