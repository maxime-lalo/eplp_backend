import { PartyModule } from "./party_modules.model";

export interface IDefaultModuleParameterProps {
    id?: string;
    module: PartyModule;
    parameterName: string;
    value: string;
}

export class DefaultModuleParameter implements IDefaultModuleParameterProps {
    id?: string;
    module: PartyModule;
    parameterName: string;
    value: string;

    constructor(props: IDefaultModuleParameterProps) {
        this.id = props.id;
        this.module = props.module;
        this.parameterName = props.parameterName;
        this.value = props.value;
    }
}