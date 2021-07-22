import {DefaultMission, DefaultModuleParameter, DefaultPartyModule} from "../models";
import {Connection, escape, ResultSetHeader, RowDataPacket} from "mysql2/promise";

export class DefaultsController {

    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    async getAllMissions(): Promise<DefaultMission[]> {
        const res = await this.connection.query(`SELECT id, title, description, logo FROM default_mission`);
        const data = res[0];
        if(Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function(row) {
                return new DefaultMission({
                    id: parseInt(row["id"]),
                    title: row["title"],
                    description: row["description"],
                    logo: row["logo"]
                })
            });
        }
        return [];
    }

    async getAllModules(): Promise<DefaultPartyModule[]> {
        const res = await this.connection.query(`SELECT id, module_name FROM default_party_module`);
        const data = res[0];
        if(Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            let modules: DefaultPartyModule[] = [];
            for(let i = 0; i < rows.length; i++){
                let parametersReq = await this.getModuleParameters(Number(rows[i]["id"]));
                modules.push(new DefaultPartyModule({
                    id: parseInt(rows[i]["id"]),
                    moduleName: rows[i]["module_name"],
                    parameters: parametersReq
                }));
            }
            return modules;
        }
        return [];
    }

    async getModule(idModule: number):Promise<DefaultPartyModule | null>{
        const res = await this.connection.query(`SELECT id, module_name FROM default_party_module`);
        const data = res[0];
        if(Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if(rows.length > 0) {
                const row = rows[0];
                let parametersReq = await this.getModuleParameters(row['id']);
                return new DefaultPartyModule({
                    id: parseInt(row["id"]),
                    moduleName: row["module_name"],
                    parameters: parametersReq
                })
            }
        }
        return null;
    }

    async getModuleParameters(idModule: number): Promise<DefaultModuleParameter[]>{
        const res = await this.connection.query(`SELECT id, parameter_name, value FROM default_module_parameter WHERE module = ${idModule}`);
        const data = res[0];
        if(Array.isArray(data)) {
            return (data as RowDataPacket[]).map(function(row) {
                return new DefaultModuleParameter({
                    id: parseInt(row["id"]),
                    parameterName: row["parameter_name"],
                    value: row['value']
                })
            });
        }
        return [];
    }

    async getMission(idMission:number): Promise<DefaultMission | null>{
        const res = await this.connection.query(`SELECT id, title, description, logo FROM default_mission WHERE id = ${idMission}`);
        const data = res[0];
        if(Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if(rows.length > 0) {
                const row = rows[0];
                return new DefaultMission({
                    id: parseInt(row["id"]),
                    title: row["title"],
                    description: row["description"],
                    logo: row["logo"]
                })
            }
        }
        return null;
    }
}