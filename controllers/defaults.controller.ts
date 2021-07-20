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
            return (data as RowDataPacket[]).map(function(row) {
                return new DefaultPartyModule({
                    id: parseInt(row["id"]),
                    moduleName: row["module_name"]
                })
            });
        }
        return [];
    }

    async getModule(idModule: number):Promise<DefaultPartyModule | null>{
        const res = await this.connection.query(`SELECT id, module_name FROM default_mission`);
        const data = res[0];
        if(Array.isArray(data)) {
            const rows = data as RowDataPacket[];
            if(rows.length > 0) {
                const row = rows[0];
                return new DefaultPartyModule({
                    id: parseInt(row["id"]),
                    moduleName: row["module_name"]
                })
            }
        }
        return null;
    }

    async getModuleParameters(idModule: number): Promise<DefaultModuleParameter | null>{
        const module = await this.getModule(idModule);
        if (module !== null){
            const res = await this.connection.query(`SELECT id, parameter_name,value, FROM default_module_parameter WHERE id_module = ${idModule}`);
            const data = res[0];
            if(Array.isArray(data)) {
                const rows = data as RowDataPacket[];
                if(rows.length > 0) {
                    const row = rows[0];
                    return new DefaultModuleParameter({
                        id: parseInt(row["id"]),
                        module,
                        parameterName: row["parameter_name"],
                        value: row["value"]
                    })
                }
            }
        }
        return null;
    }
    
}