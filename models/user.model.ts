export interface IUserProps {
    id?: number;
    pseudo: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    creationDate?: Date;
    updateDate?: Date;
    active?: boolean;
    token?: string;
}

export class User implements IUserProps {
    id?: number;
    pseudo: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    creationDate?: Date;
    updateDate?: Date;
    active?: boolean;
    token?: string;

    constructor(props: IUserProps) {
        this.id = props.id;
        this.pseudo = props.pseudo;
        this.firstName = props.firstName;
        this.lastName = props.lastName;
        this.email = props.email;
        this.password = props.password;
        this.creationDate = props.creationDate;
        this.updateDate = props.updateDate;
        this.active = props.active;
        this.token = props.token;
    }
}