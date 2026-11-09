interface Bracket {
    from: number;
    penalty: number;
}

const SECONDARY_DR: Bracket[] = [
    { from: 30, penalty: 0.1 },
    { from: 40, penalty: 0.2 },
    { from: 50, penalty: 0.3 },
    { from: 60, penalty: 0.4 },
    { from: 80, penalty: 0.5 },
    { from: 200, penalty: 1 },
];

const TERTIARY_DR: Bracket[] = [
    { from: 10, penalty: 0.2 },
    { from: 15, penalty: 0.4 },
    { from: 20, penalty: 0.6 },
    { from: 49, penalty: 1 },
];

export const STAT_CONVERSIONS = {
    HASTE: { per: 44, dr: SECONDARY_DR },
    CRIT: { per: 46, dr: SECONDARY_DR },
    MASTERY: { per: 46, dr: SECONDARY_DR },
    VERS: { per: 54, dr: SECONDARY_DR },
    LEECH: { per: 69, dr: TERTIARY_DR },
    AVOIDANCE: { per: 37, dr: TERTIARY_DR },
    SPEED: { per: 12, dr: TERTIARY_DR },
};

export type StatKey = keyof typeof STAT_CONVERSIONS;

const segments = (stat: StatKey) => {
    const edges = [{ from: 0, penalty: 0 }, ...STAT_CONVERSIONS[stat].dr];
    return edges.slice(0, -1).map((edge, i) => ({ from: edge.from, to: edges[i + 1].from, penalty: edge.penalty }));
};

export const maxRating = (stat: StatKey) => STAT_CONVERSIONS[stat].dr[STAT_CONVERSIONS[stat].dr.length - 1].from * STAT_CONVERSIONS[stat].per;

export const drBreakdown = (rating: number, stat: StatKey) => {
    const { per } = STAT_CONVERSIONS[stat];
    const raw = Math.max(rating, 0) / per;
    const rows = segments(stat)
        .filter(({ from }) => raw > from)
        .map(({ from, to, penalty }) => {
            const width = Math.min(raw, to) - from;
            return { penalty, rating: width * per, percent: width * (1 - penalty) };
        });
    if (rating > maxRating(stat)) rows.push({ penalty: 1, rating: rating - maxRating(stat), percent: 0 });
    return rows;
};

export const ratingToPercent = (rating: number, stat: StatKey) => drBreakdown(rating, stat).reduce((sum, row) => sum + row.percent, 0);

export const maxPercent = (stat: StatKey) => ratingToPercent(maxRating(stat), stat);

export const percentToRating = (percent: number, stat: StatKey) => {
    let remaining = Math.max(percent, 0);
    for (const { from, to, penalty } of segments(stat)) {
        const kept = (to - from) * (1 - penalty);
        if (remaining <= kept) return (from + remaining / (1 - penalty)) * STAT_CONVERSIONS[stat].per;
        remaining -= kept;
    }
    return maxRating(stat);
};
