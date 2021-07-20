import { User } from './user.model';

export interface IPartyProps {
    id?: number;
    name: string;
    creator: User;
    creationDate?: Date;
    endDate: Date;
}

export class Party implements IPartyProps {
    id?: number;
    name: string;
    creator: User;
    creationDate?: Date;
    endDate: Date;

    constructor(props: IPartyProps) {
        this.id = props.id;
        this.name = props.name;
        this.creator = props.creator;
        this.creationDate = props.creationDate;
        this.endDate = props.endDate;
    }
}