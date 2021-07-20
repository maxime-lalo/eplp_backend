export interface IDefaultPartyModuleProps {
    id?: string;
    module_name: string;
}

export class DefaultPartyModule implements IDefaultPartyModuleProps {
    id?: string;
    module_name: string;

    constructor(props: IDefaultPartyModuleProps) {
        this.id = props.id;
        this.module_name = props.module_name;
    }
}