import { DefaultPartyModule } from "./default_party_module.model";

export interface IDefaultModuleParameterProps {
    id?: number;
    parameterName: string;
    value: string;
}

export class DefaultModuleParameter implements IDefaultModuleParameterProps {
    id?: number;
    parameterName: string;
    value: string;

    constructor(props: IDefaultModuleParameterProps) {
        this.id = props.id;
        this.parameterName = props.parameterName;
        this.value = props.value;
    }
}