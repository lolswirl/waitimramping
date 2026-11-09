export interface Stats {
    intellect: number;
    mastery: number;
    crit: number;
    versatility: number;
    haste: number;
    stamina?: number;
    totalHp?: number;
}

export const STATS = {
    INTELLECT: "Intellect",
    STRENGTH: "Strength",
    AGILITY: "Agility",
    STAMINA: "Stamina",
    HASTE: "Haste",
    CRIT: "Critical Strike",
    MASTERY: "Mastery",
    VERS: "Versatility",
    SPEED: "Speed",
    LEECH: "Leech",
    AVOIDANCE: "Avoidance",
};

export const STAT_COLORS = {
    INTELLECT: "#7920ff",
    STRENGTH: "#7920ff",
    AGILITY: "#7920ff",
    STAMINA: "#7920ff",
    HASTE: "#FF6C31",
    CRIT: "#0E8DFB",
    MASTERY: "#60FFC2",
    VERS: "#FFE679",
    SPEED: "#ff81c0ff",
    LEECH: "#24EB3B",
    AVOIDANCE: "#959595",
};

export const BASE_MASTERY = 8;

export interface DrBracket {
    from: number;
    penalty: number;
}

const SECONDARY_DR: DrBracket[] = [
    { from: 30, penalty: 0.1 },
    { from: 40, penalty: 0.2 },
    { from: 50, penalty: 0.3 },
    { from: 60, penalty: 0.4 },
    { from: 80, penalty: 0.5 },
    { from: 200, penalty: 1 },
];

const TERTIARY_DR: DrBracket[] = [
    { from: 10, penalty: 0.2 },
    { from: 15, penalty: 0.4 },
    { from: 20, penalty: 0.6 },
    { from: 100, penalty: 1 },
];

export const STAT_RATINGS = {
    HASTE: { per: 44, dr: SECONDARY_DR },
    CRIT: { per: 46, dr: SECONDARY_DR },
    MASTERY: { per: 46, dr: SECONDARY_DR },
    VERS: { per: 54, dr: SECONDARY_DR },
    LEECH: { per: 69, dr: TERTIARY_DR },
    AVOIDANCE: { per: 37, dr: TERTIARY_DR },
    SPEED: { per: 12, dr: TERTIARY_DR },
};

export type RatedStat = keyof typeof STAT_RATINGS;
