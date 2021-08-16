import {Party, PartyModule, Secret, SecretGuess, User} from "../models";
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

    async getOneSecret(idSecret: Number, party: Party):Promise<Secret | Boolean>{
        const res = await this.connection.query(`SELECT id, user, secret, fake_secret, found_by, party FROM secret WHERE id = ${escape(idSecret)}`);
        const data = res[0];
        if(Array.isArray(data) && data.length >= 1) {
            const row = data as RowDataPacket[];
            if(Number(row[0]['party']) !== party.id){
                return false;
            }
            return new Secret({
                id: parseInt(row[0]['id']),
                user: row[0]['user'],
                party,
                secret: row[0]['secret'],
                fakeSecret: row[0]['fake_secret'],
                foundBy: row[0]['found_by']
            })
        }else{
            return false;
        }
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

    async testSecret(party:Party,user: User, secret: Number,target:Number, module: PartyModule ):Promise<Number>{
        let secretObj = await this.getOneSecret(secret,party);

        if(secretObj === false){
            return apiReturnCodes.NOT_FOUND;
        }

        const lastTest = await this.connection.query(`SELECT timestamp FROM secret_guess a INNER JOIN secret b ON a.id_secret = b.id WHERE a.id_accusator = ${escape(user.id)} AND b.party = ${escape(party.id)} ORDER BY timestamp DESC LIMIT 0,1`);
        const data = lastTest[0] as RowDataPacket;
        if(Array.isArray(data) && data.length > 0) {
            let lastTestDate = new Date(data[0]['timestamp']);
            let actualDate = new Date();

            let diffInSeconds = (actualDate.getTime() - lastTestDate.getTime()) / 1000;

            let parameter = "";
            for(let i = 0; i < module.parameters.length; i++){
                if(module.parameters[i].defaultParameter === 3){
                    parameter = module.parameters[i].value;
                    break;
                }
            }

            let parameters = parameter.split(":");
            let maxDiff = 
                (Number(parameters[0]) * 24 * 3600) + 
                (Number(parameters[1]) * 3600) + 
                (Number(parameters[2]) * 60) +
                Number(parameters[3])
            ;

            if(maxDiff - diffInSeconds > 0){
                return apiReturnCodes.ALREADY_PRESENT;
            }
        }
        
        let res = await this.connection.execute("INSERT INTO secret_guess (id_secret, id_accusator, id_accused) VALUES (?,?,?)", [
            secret,
            user.id,
            target
        ]);

        if(secretObj instanceof Secret && Number(secretObj.user) === target){
            return apiReturnCodes.SUCCESS;
        }else{
            return apiReturnCodes.USER_ERROR;
        }
        
    }
}