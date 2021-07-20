import { Secret } from "./secret.model";
import { User } from "./user.model";

export interface ISecretGuessProps {
    id?: string;
    secret: Secret;
    accusator: User;
    accused: User;
    datetime: Date;
}

export class SecretGuess implements ISecretGuessProps {
    id?: string;
    secret: Secret;
    accusator: User;
    accused: User;
    datetime: Date;

    constructor(props: ISecretGuessProps) {
        this.id = props.id;
        this.secret = props.secret;
        this.accusator = props.accusator;
        this.accused = props.accused;
        this.datetime = props.datetime;
    }
}