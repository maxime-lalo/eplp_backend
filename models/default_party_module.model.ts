export interface IDefaultPartyModuleProps {
    id?: number;
    moduleName: string;
}

export class DefaultPartyModule implements IDefaultPartyModuleProps {
    id?: number;
    moduleName: string;

    constructor(props: IDefaultPartyModuleProps) {
        this.id = props.id;
        this.moduleName = props.moduleName;
    }
}