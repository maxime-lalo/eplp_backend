import { DefaultPartyModule } from "./default_party_module.model";

export interface IDefaultModuleParameterProps {
    id?: number;
    module: DefaultPartyModule;
    parameterName: string;
    value: string;
}

export class DefaultModuleParameter implements IDefaultModuleParameterProps {
    id?: number;
    module: DefaultPartyModule;
    parameterName: string;
    value: string;

    constructor(props: IDefaultModuleParameterProps) {
        this.id = props.id;
        this.module = props.module;
        this.parameterName = props.parameterName;
        this.value = props.value;
    }
}