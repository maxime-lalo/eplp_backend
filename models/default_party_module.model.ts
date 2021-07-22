import { DefaultModuleParameter } from "./default_module_parameter.model";

export interface IDefaultPartyModuleProps {
    id?: number;
    moduleName: string;
    parameters?: Array<DefaultModuleParameter>;
}

export class DefaultPartyModule implements IDefaultPartyModuleProps {
    id?: number;
    moduleName: string;
    parameters?: Array<DefaultModuleParameter>

    constructor(props: IDefaultPartyModuleProps) {
        this.id = props.id;
        this.moduleName = props.moduleName;
        this.parameters = props.parameters;
    }
}