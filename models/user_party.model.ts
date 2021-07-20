import { Party } from './party.model';
import { User } from './user.model';

export interface IUserPartyProps {
    id?: number;
    user: User;
    party: Party;
    isAdmin: boolean;
    invitedBy: User;
    invitationDate: Date;
    nickname: string;
}

export class UserParty implements IUserPartyProps {
    id?: number;
    user: User;
    party: Party;
    isAdmin: boolean;
    invitedBy: User;
    invitationDate: Date;
    nickname: string;

    constructor(props: IUserPartyProps) {
        this.id = props.id;
        this.user = props.user;
        this.party = props.party;
        this.isAdmin = props.isAdmin;
        this.invitedBy = props.invitedBy;
        this.invitationDate = props.invitationDate;
        this.nickname = props.nickname;
    }
}