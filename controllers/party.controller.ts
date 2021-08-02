import {Party, IPartyProps, User, UserParty, PartyModule, DefaultPartyModule, ModuleParameters} from "../models";
import {Connection, escape, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import { DefaultsController } from ".";
import { apiReturnCodes } from "../api_return_codes";

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
            const rows = data as RowDataPacket[];
            let parties: Party[] = [];
            for(let i = 0; i < rows.length; i++){
                parties.push(new Party({
                    id: parseInt(rows[i]["id"]),
                    name: rows[i]["name"],
                    creator: rows[i]["creator"],
                    creationDate: new Date(rows[i]["creation_date"]),
                    endDate: new Date(rows[i]["end_date"]),
                    modules: await this.getPartyModules(Number(rows[i]['id']))
                }));
            }
            return parties;
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
                    participants: await this.getParticipants(row['id']),
                    modules: await this.getPartyModules(row['id'])
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

    async inviteUser(idInviter: number, idInvited: number, idParty: number): Promise<Object | number>{
        const party = await this.getById("" + idParty);
        if (party?.participants !== undefined){
            for(let i = 0; i < party.participants.length; i++){
                if(party.participants[i].id == idInvited){
                    return apiReturnCodes.USER_ALREADY_PRESENT;
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
            return apiReturnCodes.DB_ERROR;
        }
    }

    async removeUser(idInvited: number, party: Party): Promise<number>{
        let userInParty = false;
        if (party.participants !== undefined){
            for(let i = 0; i < party.participants.length; i++){
                if(party.participants[i].id == idInvited){
                    userInParty = true;
                    break;
                }
            }
        }
        
        if(!userInParty){
            return apiReturnCodes.USER_NOT_FOUND;
        }

        try {
            const res = await this.connection.execute("DELETE FROM user_party WHERE user = ? AND party = ?", [
                idInvited,
                party.id
            ]);
            
            return apiReturnCodes.SUCCESS;
        } catch(err) {
            console.error(err); // log dans un fichier c'est mieux
            return apiReturnCodes.DB_ERROR;
        }
    }


    async addModule(party: Party, module: DefaultPartyModule): Promise<PartyModule | number>{
        try {
            for(let i = 0; i < party.modules.length; i++){
                if(party.modules[i].moduleName == module.moduleName){
                    return apiReturnCodes.ALREADY_PRESENT;
                }
            }

            const res = await this.connection.query(`SELECT a.id,b.module_name,a.adding_date,a.last_update_date FROM party_module a INNER JOIN default_party_module b ON a.module = b.id WHERE a.party = ${party.id}`);
            const data = res[0];

            let desactivedInDb:boolean = false;
            if(Array.isArray(data)) {
                const rows = data as RowDataPacket[];
                for(let i = 0; i < rows.length; i++){
                    if(module.moduleName === rows[i]['module_name']){
                        desactivedInDb = true;
                    }
                }
            }
            
            if(desactivedInDb){
                let sqlStr = `UPDATE party_module SET active = 1,last_update_date = NOW() WHERE party = ${party.id} AND module = ${module.id}`;
                await this.connection.execute(sqlStr);
                return apiReturnCodes.SUCCESS;
            }else{
                const defaultsController = new DefaultsController(this.connection);
                const parameters = await defaultsController.getModuleParameters(Number(module.id));
            
                if (parameters !== null){
                    const res = await this.connection.execute("INSERT INTO party_module (party, module) VALUES (?, ?)", [
                        party.id,
                        module.id
                    ]);
                    const headers = res[0] as ResultSetHeader;

                    let castedParameters: ModuleParameters[] = [];
                    for(let i = 0; i < parameters.length; i++){
                        castedParameters.push(new ModuleParameters({
                            parameterName: parameters[i].parameterName,
                            value: parameters[i].value
                        }));

                        await this.connection.execute("INSERT INTO module_parameter (parameter_name, value, id_module) VALUES (?, ?, ?)", [
                            parameters[i].parameterName,
                            parameters[i].value,
                            headers.insertId
                        ]);
                    }

                    return new PartyModule({
                        id: Number(headers.insertId),
                        moduleName: module.moduleName,
                        addingDate: new Date(),
                        active: true,
                        lastUpdateDate: new Date(),
                        parameters: parameters
                    })
                }
            }
            return apiReturnCodes.NOT_FOUND;
        } catch(err) {
            console.error(err); // log dans un fichier c'est mieux
            return apiReturnCodes.DB_ERROR;
        }
    }

    async removeModule(partyModule: PartyModule): Promise<boolean>{
        try {
            const deleteModuleFromParty = await this.connection.execute("UPDATE party_module SET active = 0,last_update_date = NOW() WHERE id = ?",[
                partyModule.id
            ]);
            return true;
        } catch(err) {
            console.error(err);
            return false;
        }
    }
    
    async getPartyModules(idParty: number):Promise<PartyModule[]>{
        const res = await this.connection.query(`SELECT a.id,b.module_name,a.adding_date,a.last_update_date FROM party_module a INNER JOIN default_party_module b ON a.module = b.id WHERE a.active = 1 AND a.party = ${idParty}`);
        const data = res[0];
        if(Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            let modules: PartyModule[] = [];

            for(let i = 0; i < rows.length; i++){
                modules.push(new PartyModule({
                    id: parseInt(rows[i]["id"]),
                    moduleName: rows[i]["module_name"],
                    addingDate: new Date(rows[i]['adding_date']),
                    lastUpdateDate: new Date(rows[i]['adding_date']),
                    active: true,
                    parameters: await this.getModuleParameters(Number(rows[i]["id"]))
                }))
            }

            return modules;
        }
        return [];
    }

    async getModuleParameters(idModule: number):Promise<ModuleParameters[]>{
        const res = await this.connection.query(`SELECT id,parameter_name,value FROM module_parameter WHERE id_module = ${idModule}`);
        const data = res[0];
        if(Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            let params: ModuleParameters[] = [];

            for(let i = 0; i < rows.length; i++){
                params.push(new ModuleParameters({
                    id: parseInt(rows[i]["id"]),
                    parameterName: rows[i]["parameter_name"],
                    value: rows[i]['value']
                }));
            }
            return params;
        }
        return [];
    }

    async modifyParameter(idParam: number, value : any, party: Party):Promise<number>{
        if(party.modules !== undefined){
            let isParameterFound: boolean = false;
            for(let i = 0; i < party.modules.length; i++){
                for(let j = 0; j < party.modules[i].parameters.length; j++){
                    if(party.modules[i].parameters[j].id == idParam){
                        isParameterFound = true;
                    }
                }
            }

            if(isParameterFound){
                const res = await this.connection.query(`UPDATE module_parameter SET value = "${escape(value)}" WHERE id = ${idParam}`);
                const data = res[0] as ResultSetHeader;
                if(data.affectedRows == 1) {
                    return apiReturnCodes.SUCCESS;
                }else{
                    return apiReturnCodes.ALREADY_PRESENT;
                }
            }else{
                return apiReturnCodes.NOT_FOUND;
            }
        }else{
            return apiReturnCodes.NOT_FOUND;
        }
    }
}