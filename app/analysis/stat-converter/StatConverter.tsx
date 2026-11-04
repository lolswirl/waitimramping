"use client";
import { SelectChip, SpecChip } from "@components/FilterChips/FilterChips";
import { GlassTooltip } from "@components/Glass";
import PageHeader from "@components/PageHeader/PageHeader";
import SwirlTable, { type SwirlColumn } from "@components/SwirlTable/SwirlTable";
import { motion } from "@components/Theme/motion";
import { CHIP_HEIGHT, CONTENT_WIDTH, FONT, MONO_FONT } from "@components/Theme/tokens";
import { useSpec } from "@context/SpecContext";
import { STAT_COLORS, STATS } from "@data/shared/stats";
import { Box, Container, InputBase, Typography, useMediaQuery, useTheme } from "@mui/material";
import { formatNumber, formatPercent } from "@util/stringManipulation";
import type React from "react";
import { useState } from "react";

import { currentPenalty, MAX_PERCENT, MAX_RAW_PERCENT, percentToRating, RATING_PER_PERCENT, ratingToPercent, type StatKey } from "./convert";

type MasteryUnit = "spec" | "points";

interface StatRow {
    key: StatKey;
    label: string;
    short: string;
    color: string;
}

const STAT_ROWS: StatRow[] = [
    { key: "haste", short: "haste", label: STATS.HASTE, color: STAT_COLORS.HASTE },
    { key: "crit", short: "crit", label: STATS.CRIT, color: STAT_COLORS.CRIT },
    { key: "mastery", short: "mastery", label: STATS.MASTERY, color: STAT_COLORS.MASTERY },
    { key: "vers", short: "vers", label: STATS.VERS, color: STAT_COLORS.VERS },
    { key: "leech", short: "leech", label: STATS.LEECH, color: STAT_COLORS.LEECH },
];

const EMPTY_RATINGS: Record<StatKey, number> = { haste: 0, crit: 0, mastery: 0, vers: 0, leech: 0 };

const numeric = { fontFamily: MONO_FONT, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

const trim = (n: number) => String(Number.parseFloat(n.toFixed(2)));

const NumberInput: React.FC<{ value: number; max: number; suffix?: string; compact?: boolean; onChange: (value: number) => void }> = ({
    value,
    max,
    suffix,
    compact,
    onChange,
}) => {
    const [text, setText] = useState<string | null>(null);
    const [over, setOver] = useState(false);

    return (
        <GlassTooltip title={over ? `max ${formatNumber(max, 2)}${suffix ?? ""}` : ""} open={over} placement="top">
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    width: "100%",
                    height: CHIP_HEIGHT,
                    boxSizing: "border-box",
                    px: compact ? 0.75 : 1,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: over ? "error.main" : "divider",
                    transition: motion("border-color"),
                    "&:hover": { borderColor: over ? "error.main" : "text.secondary" },
                    "&:focus-within": { borderColor: over ? "error.main" : "text.secondary" },
                }}
            >
                <InputBase
                    value={text ?? formatNumber(value, Number.isInteger(value) ? 0 : 2)}
                    onFocus={(e) => {
                        setText(trim(value));
                        requestAnimationFrame(() => e.target.select());
                    }}
                    onChange={(e) => {
                        setText(e.target.value);
                        const parsed = Number(e.target.value.replace(/,/g, ""));
                        if (e.target.value.trim() === "" || Number.isNaN(parsed)) return;
                        setOver(parsed > max);
                        onChange(Math.min(Math.max(parsed, 0), max));
                    }}
                    onBlur={() => {
                        setText(null);
                        setOver(false);
                    }}
                    inputProps={{ inputMode: "decimal" }}
                    sx={{ flex: 1, minWidth: 0, fontSize: compact ? FONT.small : FONT.body, "& input": { ...numeric, textAlign: "right", p: 0 } }}
                />
                {suffix && <Typography sx={{ fontSize: FONT.small, color: "text.disabled" }}>{suffix}</Typography>}
            </Box>
        </GlassTooltip>
    );
};

const Caption: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Typography sx={{ ...numeric, fontSize: FONT.micro, color: "text.disabled", lineHeight: 1.2 }}>{children}</Typography>
);

const StatConverter: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { spec, setSpec } = useSpec();

    const [ratings, setRatings] = useState<Record<StatKey, number>>(EMPTY_RATINGS);
    const [masteryUnit, setMasteryUnit] = useState<MasteryUnit>("spec");
    const [baseline, setBaseline] = useState<StatKey>("haste");

    const coefficient = spec.masteryCoefficient;
    const specLabel = spec.name.toLowerCase();
    const baselineRow = STAT_ROWS.find((s) => s.key === baseline) ?? STAT_ROWS[0];

    const setRating = (key: StatKey, rating: number) => setRatings((prev) => ({ ...prev, [key]: rating }));

    const percentScale = (key: StatKey) => (key === "mastery" && masteryUnit === "spec" ? coefficient : 1);

    const columns: SwirlColumn<StatRow>[] = [
        {
            key: "stat",
            label: "stat",
            width: isMobile ? "0.7fr" : "1.1fr",
            render: (row) => (
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: FONT.body, fontWeight: 600, color: row.color }}>{isMobile ? row.short : row.label}</Typography>
                    {!isMobile && <Caption>{RATING_PER_PERCENT[row.key]} per 1%</Caption>}
                </Box>
            ),
        },
        {
            key: "rating",
            label: "rating",
            width: isMobile ? "1.3fr" : "1fr",
            render: (row) => (
                <NumberInput
                    compact={isMobile}
                    value={ratings[row.key]}
                    max={MAX_RAW_PERCENT * RATING_PER_PERCENT[row.key]}
                    onChange={(rating) => setRating(row.key, rating)}
                />
            ),
        },
        {
            key: "percent",
            label: "percent",
            width: isMobile ? "1.3fr" : "1fr",
            render: (row) => {
                const per = RATING_PER_PERCENT[row.key];
                const scale = percentScale(row.key);
                const points = ratingToPercent(ratings[row.key], per);
                return (
                    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.25 }}>
                        <NumberInput
                            compact={isMobile}
                            value={points * scale}
                            max={MAX_PERCENT * scale}
                            suffix="%"
                            onChange={(percent) => setRating(row.key, percentToRating(percent / scale, per) ?? MAX_RAW_PERCENT * per)}
                        />
                        {row.key === "mastery" && (
                            <Caption>
                                {masteryUnit === "spec" ? `${formatNumber(points, 2)} points` : `${formatPercent(points * coefficient)} ${specLabel}`}
                            </Caption>
                        )}
                    </Box>
                );
            },
        },
        {
            key: "dr",
            label: (
                <GlassTooltip title="Rating past 30% is penalized: 10% up to 39%, 20% to 47%, 30% to 54%, 40% to 66%, 50% to 126%">
                    <span>dr</span>
                </GlassTooltip>
            ),
            width: "0.8fr",
            align: "right",
            render: (row) => {
                const per = RATING_PER_PERCENT[row.key];
                const lost = Math.min(ratings[row.key] / per, MAX_RAW_PERCENT) - ratingToPercent(ratings[row.key], per);
                const penalty = currentPenalty(ratings[row.key], per);
                return (
                    <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ ...numeric, fontSize: FONT.body, color: lost > 0 ? "text.primary" : "text.disabled" }}>
                            {lost > 0 ? `-${formatPercent(lost)}` : "-"}
                        </Typography>
                        {penalty > 0 && <Caption>{penalty >= 1 ? "capped" : `${Math.round(penalty * 100)}% penalty`}</Caption>}
                    </Box>
                );
            },
        },
        {
            key: "vs",
            label: isMobile ? "vs" : `vs ${baselineRow.label.toLowerCase()}`,
            width: "0.7fr",
            align: "right",
            render: (row) => {
                const base = ratings[baseline];
                const own = ratings[row.key];
                const text = row.key === baseline ? "1.00x" : base > 0 && own > 0 ? `${formatNumber(own / base, 2)}x` : "-";
                const tone = row.key === baseline || base <= 0 || own <= 0 ? "text.disabled" : own >= base ? "success.main" : "error.main";
                return <Typography sx={{ ...numeric, fontSize: FONT.body, fontWeight: 600, color: tone }}>{text}</Typography>;
            },
        },
    ];

    return (
        <Container sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center", justifyContent: "center" }}>
            <PageHeader title={title} subtitle={description} />

            <Box sx={{ width: "100%", maxWidth: CONTENT_WIDTH.wide, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <SpecChip accent={spec.color} spec={spec} onChange={setSpec} />
                <SelectChip
                    accent={spec.color}
                    title="mastery"
                    value={masteryUnit}
                    options={[
                        { value: "spec", label: `${specLabel} %` },
                        { value: "points", label: "points" },
                    ]}
                    onChange={(v) => setMasteryUnit(v as MasteryUnit)}
                />
                <SelectChip
                    accent={baselineRow.color}
                    title="compare to"
                    value={baseline}
                    options={STAT_ROWS.map((s) => ({ value: s.key, label: s.label }))}
                    onChange={(v) => setBaseline(v as StatKey)}
                />
                <Box
                    onClick={() => setRatings(EMPTY_RATINGS)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setRatings(EMPTY_RATINGS);
                        }
                    }}
                    sx={{
                        ml: "auto",
                        px: 1,
                        cursor: "pointer",
                        userSelect: "none",
                        fontSize: FONT.micro,
                        fontWeight: 600,
                        color: "text.disabled",
                        "&:hover": { color: "text.primary" },
                    }}
                >
                    reset
                </Box>
            </Box>

            <Box sx={{ width: "100%", maxWidth: CONTENT_WIDTH.wide }}>
                <SwirlTable
                    rows={STAT_ROWS}
                    rowKey={(row) => row.key}
                    columns={isMobile ? columns.filter((c) => c.key !== "dr") : columns}
                    accentColor={(row) => row.color}
                />
            </Box>
        </Container>
    );
};

export default StatConverter;
