export type StatKey = "haste" | "crit" | "mastery" | "vers" | "leech";

export const RATING_PER_PERCENT: Record<StatKey, number> = {
    haste: 44,
    crit: 46,
    mastery: 46,
    vers: 54,
    leech: 69,
};

const DR_BRACKETS = [
    { to: 30, keep: 1 },
    { to: 39, keep: 0.9 },
    { to: 47, keep: 0.8 },
    { to: 54, keep: 0.7 },
    { to: 66, keep: 0.6 },
    { to: 126, keep: 0.5 },
];

export const MAX_RAW_PERCENT = 126;

export const ratingToPercent = (rating: number, perPercent: number): number => {
    const raw = Math.min(Math.max(rating, 0) / perPercent, MAX_RAW_PERCENT);
    let from = 0;
    let total = 0;
    for (const { to, keep } of DR_BRACKETS) {
        if (raw <= from) break;
        total += (Math.min(raw, to) - from) * keep;
        from = to;
    }
    return total;
};

export const MAX_PERCENT = ratingToPercent(Number.POSITIVE_INFINITY, 1);

export const percentToRating = (percent: number, perPercent: number): number | null => {
    let remaining = Math.max(percent, 0);
    let from = 0;
    let raw = 0;
    for (const { to, keep } of DR_BRACKETS) {
        const width = to - from;
        const kept = width * keep;
        if (remaining <= kept) {
            raw += remaining / keep;
            return raw * perPercent;
        }
        raw += width;
        remaining -= kept;
        from = to;
    }
    return null;
};
