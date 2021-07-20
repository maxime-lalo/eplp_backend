export interface IDefaultMissionProps {
    id?: string;
    title: string;
    description: string;
    logo: string;
}

export class DefaultMission implements IDefaultMissionProps {
    id?: string;
    title: string;
    description: string;
    logo: string;

    constructor(props: IDefaultMissionProps) {
        this.id = props.id;
        this.title = props.title;
        this.description = props.description;
        this.logo = props.logo;
    }
}