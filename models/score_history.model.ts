import { Party } from './party.model';
import { PartyModule } from './party_modules.model';
import { User } from './user.model';

export interface IScoreHistoryProps {
    id?: number;
    user: User;
    party: Party;
    module: PartyModule;
    score: number;
    reason: string;
    datetime: Date;
}

export class ScoreHistory implements IScoreHistoryProps {
    id?: number;
    user: User;
    party: Party;
    module: PartyModule;
    score: number;
    reason: string;
    datetime: Date;

    constructor(props: IScoreHistoryProps) {
        this.id = props.id;
        this.user = props.user;
        this.party = props.party;
        this.module = props.module;
        this.score = props.score;
        this.reason = props.reason;
        this.datetime = props.datetime;
    }
}