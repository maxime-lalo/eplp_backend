import { Party } from './party.model';
import { PartyModule } from './party_modules.model';

export interface IModuleParametersProps {
    id?: number;
    parameterName: string;
    value: string;
    defaultParameter: number;
}

export class ModuleParameters implements IModuleParametersProps {
    id?: number;
    parameterName: string;
    value: string;
    defaultParameter: number;

    constructor(props: IModuleParametersProps) {
        this.id = props.id;
        this.parameterName = props.parameterName;
        this.value = props.value;
        this.defaultParameter = props.defaultParameter;
    }
}