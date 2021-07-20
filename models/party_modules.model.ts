import { Party } from './party.model';

export interface IPartyModuleProps {
    id?: number;
    party: Party;
    moduleName: string;
    addingDate: Date;
    active: boolean;
    lastUpdateDate: Date;
}

export class PartyModule implements IPartyModuleProps {
    id?: number;
    party: Party;
    moduleName: string;
    addingDate: Date;
    active: boolean;
    lastUpdateDate: Date;

    constructor(props: IPartyModuleProps) {
        this.id = props.id;
        this.party = props.party;
        this.moduleName = props.moduleName;
        this.addingDate = props.addingDate;
        this.active = props.active;
        this.lastUpdateDate = props.lastUpdateDate;
    }
}