import { Mission } from "./mission.model";
import { User } from "./user.model";

export interface IMissionUserProps {
    id?: string;
    mission: Mission;
    user: User;
    target: User;
}

export class MissionUser implements IMissionUserProps {
    id?: string;
    mission: Mission;
    user: User;
    target: User;

    constructor(props: IMissionUserProps) {
        this.id = props.id;
        this.mission = props.mission;
        this.user = props.user;
        this.target = props.target;
    }
}