export interface Role {
    Tier: string;
    Rank: number;
    highlighted: boolean;
}

export interface UserRoles {
    [key: string]: Role;
    DPS: Role;
    Support: Role;
    Tank: Role;
}

export interface User {
    [key: string]: UserRoles;
}
export interface RankTierMapping {
    [key: string]: number;
    Bronze: number;
    Silver: number;
    Gold: number;
    Platinum: number;
    Diamond: number;
    Master: number;
    Grandmaster: number;
  }