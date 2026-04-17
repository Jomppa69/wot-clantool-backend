export interface ClanEmblem {
    portal?: string;
    wot?: string;
    wowp?: string;
}

export interface ClanEmblems {
    x24?: ClanEmblem;
    x32?: ClanEmblem;
    x64?: ClanEmblem;
    x195?: ClanEmblem;
    x256?: ClanEmblem;
}

export interface ClanSearchResult {
    clan_id: number;
    members_count: number;
    name: string;
    color: string;
    created_at: number;
    tag: string;
    emblems: ClanEmblems;
}

export interface ClanMember {
    role: string;
    role_i18n: string;
    joined_at: number;
    account_id: number;
    account_name: string;
}

export interface MemberDetails {
    account_id: number;
    global_rating: number;
    last_battle_time: number;
    vehicle_stats: Record<string, PlayerVehicleStatistics>;
}

export interface Tank {
    name: string;
    nation: string;
    tier: number;
    type: string;
    tank_id: number;
}

export interface PlayerVehicleStatistics {
    tank_id: number;
    spotted: number;
    hits_percents: number;
    track_assisted_damage: number;
    draws: number;
    wins: number;
    losses: number;
    hits: number;
    battles: number;
    dropped_capture_points: number;
    stun_assisted_damage: number;
    damage_dealt: number;
    battle_avg_xp: number;
    damage_received: number;
    shots: number;
    radio_assisted_damage: number;
    xp: number;
    frags: number;
    survived_battles: number;
}

export interface Clan {
    members?: ClanMember[];
    creator_name?: string;
    members_count?: number;
    description?: string | null;
    description_html?: string | null;
    color?: string | null;
    clan_id?: number;
    created_at?: number;
    updated_at?: number;
    private?: boolean | null;
    emblems?: ClanEmblems;
    leader_name?: string;
    creator_id?: number;
    tag?: string;
    accepts_join_requests?: boolean;
    is_clan_disbanded?: boolean;
    old_name?: string;
    leader_id?: number;
    motto?: string;
    renamed_at?: number;
    old_tag?: string;
    name?: string;
}

export type ClanDetailsMap = Record<string, Clan>;

export type TankMap = Record<string, Tank>;

export type TankStatisticsMap = Record<string, { random: PlayerVehicleStatistics; tank_id: number }[]>;

export interface WgApiResponse<T> {
    status: string;
    meta: {
        count?: number;
        total?: number;
    };
    data: T;
}
