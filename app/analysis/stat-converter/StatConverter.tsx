"use client";
import SwirlToggle from "@components/Buttons/SwirlToggle";
import { SelectChip } from "@components/FilterChips/FilterChips";
import PageHeader from "@components/PageHeader/PageHeader";
import SwirlField from "@components/SwirlField/SwirlField";
import { FONT, MONO_FONT } from "@components/Theme/tokens";
import { useSpec } from "@context/SpecContext";
import { STAT_COLORS, STATS } from "@data/shared/stats";
import { Box, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { formatNumber, formatPercent } from "@util/stringManipulation";
import type React from "react";
import { useMemo, useState } from "react";

import { MAX_PERCENT, MAX_RAW_PERCENT, percentToRating, RATING_PER_PERCENT, ratingToPercent, type StatKey } from "./convert";

type Mode = "rating" | "percent";

const STAT_ROWS: { key: StatKey; label: string; color: string }[] = [
    { key: "haste", label: STATS.HASTE, color: STAT_COLORS.HASTE },
    { key: "crit", label: STATS.CRIT, color: STAT_COLORS.CRIT },
    { key: "mastery", label: STATS.MASTERY, color: STAT_COLORS.MASTERY },
    { key: "vers", label: STATS.VERS, color: STAT_COLORS.VERS },
    { key: "leech", label: STATS.LEECH, color: STAT_COLORS.LEECH },
];

const MODE_OPTIONS = [
    { value: "rating", label: "Rating to %" },
    { value: "percent", label: "% to Rating" },
];

const StatConverter: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
    const { spec } = useSpec();
    const [stat, setStat] = useState<StatKey>("mastery");
    const [mode, setMode] = useState<Mode>("percent");
    const [value, setValue] = useState<number | "">(1300);
    const [scaled, setScaled] = useState(true);

    const coefficient = spec.masteryCoefficient;
    const current = STAT_ROWS.find((s) => s.key === stat) ?? STAT_ROWS[0];
    const scaledInput = stat === "mastery" && mode === "percent" && scaled;
    const input = value === "" ? 0 : value;

    const rating = useMemo(() => {
        if (mode === "rating") return input;
        return percentToRating(scaledInput ? input / coefficient : input, RATING_PER_PERCENT[stat]);
    }, [mode, input, scaledInput, coefficient, stat]);

    const unreachable = rating === null;
    const capped = rating !== null && rating / RATING_PER_PERCENT[stat] >= MAX_RAW_PERCENT;
    const unit = mode === "rating" ? "rating" : stat === "mastery" && scaled ? `${spec.name} mastery %` : stat === "mastery" ? "mastery points" : "%";

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <PageHeader title={title} subtitle={description} />

            <Card variant="outlined" sx={{ maxWidth: 700, width: "95%", mx: "auto", mb: 2 }}>
                <CardContent>
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 1.5, mb: 3 }}>
                        <SelectChip
                            accent={current.color}
                            title="stat"
                            value={stat}
                            options={STAT_ROWS.map((s) => ({ value: s.key, label: s.label }))}
                            onChange={(v) => setStat(v as StatKey)}
                            active
                        />
                        <SelectChip accent={current.color} title="mode" value={mode} options={MODE_OPTIONS} onChange={(v) => setMode(v as Mode)} />
                        <SwirlField
                            label={mode === "rating" ? "Rating" : "Percent"}
                            value={value}
                            onChange={setValue}
                            suffix={mode === "rating" ? "" : "%"}
                            width="14ch"
                        />
                        {stat === "mastery" && mode === "percent" && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: 42 }}>
                                <SwirlToggle checked={scaled} onChange={setScaled} />
                                <Typography sx={{ fontSize: FONT.small, color: "text.secondary" }}>{spec.name} mastery %</Typography>
                            </Box>
                        )}
                    </Box>

                    {unreachable ? (
                        <Typography sx={{ color: "error.main", mb: 2 }}>
                            {formatPercent(MAX_PERCENT)} is the most {current.label} a gear rating can give
                        </Typography>
                    ) : (
                        <Typography sx={{ fontFamily: MONO_FONT, mb: 2 }}>
                            {formatNumber(input, 2)} {unit} = {formatNumber(rating, 2)} rating{capped ? " (capped)" : ""}
                        </Typography>
                    )}

                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Stat</TableCell>
                                <TableCell align="right">Rating per 1%</TableCell>
                                <TableCell align="right">Percent</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {STAT_ROWS.map((row) => {
                                const pct = rating === null ? null : ratingToPercent(rating, RATING_PER_PERCENT[row.key]);
                                return (
                                    <TableRow key={row.key} selected={row.key === stat}>
                                        <TableCell sx={{ color: row.color, fontWeight: 600 }}>{row.label}</TableCell>
                                        <TableCell align="right" sx={{ fontFamily: MONO_FONT }}>
                                            {RATING_PER_PERCENT[row.key]}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontFamily: MONO_FONT }}>
                                            {pct === null ? "-" : formatPercent(pct)}
                                            {pct !== null && row.key === "mastery" && ` (${formatPercent(pct * coefficient)} ${spec.name})`}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Box>
    );
};

export default StatConverter;
