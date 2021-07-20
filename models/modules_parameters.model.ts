import { Party } from './party.model';
import { PartyModule } from './party_modules.model';

export interface IModuleParametersProps {
    id?: number;
    module: PartyModule;
    party: Party;
    parameterName: string;
    value: string;
}

export class ModuleParameters implements IModuleParametersProps {
    id?: number;
    module: PartyModule;
    party: Party;
    parameterName: string;
    value: string;

    constructor(props: IModuleParametersProps) {
        this.id = props.id;
        this.module = props.module;
        this.party = props.party;
        this.parameterName = props.parameterName;
        this.value = props.value;
    }
}