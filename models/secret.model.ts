import { Party } from "./party.model";
import { User } from "./user.model";

export interface ISecretProps {
    id?: number;
    user?: User;
    secret: string;
    fakeSecret?: string;
    party: Party;
    foundBy?: User;
}

export class Secret implements ISecretProps {
    id?: number;
    user?: User;
    secret: string;
    fakeSecret?: string;
    party: Party;
    foundBy?: User;

    constructor(props: ISecretProps) {
        this.id = props.id;
        this.user = props.user;
        this.secret = props.secret;
        this.fakeSecret = props.fakeSecret;
        this.party = props.party;
        this.foundBy = props.foundBy;
    }
}