import { ModuleParameters } from './modules_parameters.model';
import { Party } from './party.model';

export interface IPartyModuleProps {
    id?: number;
    moduleName: string;
    addingDate: Date;
    active: boolean;
    lastUpdateDate: Date;
    parameters: ModuleParameters[];
}

export class PartyModule implements IPartyModuleProps {
    id?: number;
    moduleName: string;
    addingDate: Date;
    active: boolean;
    lastUpdateDate: Date;
    parameters: ModuleParameters[];

    constructor(props: IPartyModuleProps) {
        this.id = props.id;
        this.moduleName = props.moduleName;
        this.addingDate = props.addingDate;
        this.active = props.active;
        this.lastUpdateDate = props.lastUpdateDate;
        this.parameters = props.parameters;
    }
}