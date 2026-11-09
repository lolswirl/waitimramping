import { type RatedStat, STAT_RATINGS } from "@data/shared/stats";

const segments = (stat: RatedStat) => {
    const edges = [{ from: 0, penalty: 0 }, ...STAT_RATINGS[stat].dr];
    return edges.slice(0, -1).map((edge, i) => ({ from: edge.from, to: edges[i + 1].from, penalty: edge.penalty }));
};

export const maxRating = (stat: RatedStat) => {
    const { per, dr } = STAT_RATINGS[stat];
    return dr[dr.length - 1].from * per;
};

export const drBreakdown = (rating: number, stat: RatedStat) => {
    const { per } = STAT_RATINGS[stat];
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

export const lostRating = (rating: number, stat: RatedStat) => drBreakdown(rating, stat).reduce((sum, row) => sum + row.rating * row.penalty, 0);

export const ratingToPercent = (rating: number, stat: RatedStat) => drBreakdown(rating, stat).reduce((sum, row) => sum + row.percent, 0);

export const maxPercent = (stat: RatedStat) => ratingToPercent(maxRating(stat), stat);

export const percentToRating = (percent: number, stat: RatedStat) => {
    let remaining = Math.max(percent, 0);
    for (const { from, to, penalty } of segments(stat)) {
        const kept = (to - from) * (1 - penalty);
        if (remaining <= kept) return (from + remaining / (1 - penalty)) * STAT_RATINGS[stat].per;
        remaining -= kept;
    }
    return maxRating(stat);
};
