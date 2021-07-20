import { Party } from "./party.model";
import { User } from "./user.model";

export interface ISecretProps {
    id?: string;
    user: User;
    secret: string;
    party: Party;
    foundBy?: User;
}

export class Secret implements ISecretProps {
    id?: string;
    user: User;
    secret: string;
    party: Party;
    foundBy?: User;

    constructor(props: ISecretProps) {
        this.id = props.id;
        this.user = props.user;
        this.secret = props.secret;
        this.party = props.party;
        this.foundBy = props.foundBy;
    }
}