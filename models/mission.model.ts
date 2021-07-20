import { Party } from './party.model';

export interface IMissionProps {
    id?: number;
    title: string;
    description: string;
    logo: string;
    used: boolean;
    party: Party;
}

export class Mission implements IMissionProps {
    id?: number;
    title: string;
    description: string;
    logo: string;
    used: boolean;
    party: Party;

    constructor(props: IMissionProps) {
        this.id = props.id;
        this.title = props.title;
        this.description = props.description;
        this.logo = props.logo;
        this.used = props.used;
        this.party = props.party;
    }
}