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

type Mode = "rating" | "percent";

const numeric = { fontFamily: MONO_FONT, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

const trim = (n: number) => String(Number.parseFloat(n.toFixed(2)));

const NumberInput: React.FC<{ label?: string; value: number; max: number; suffix?: string; compact?: boolean; onChange: (value: number) => void }> = ({
    label,
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
                {label && <Typography sx={{ fontSize: FONT.small, fontWeight: 600, color: "text.secondary", whiteSpace: "nowrap" }}>{label}</Typography>}
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

const Caption: React.FC<{ children: React.ReactNode; wrap?: boolean }> = ({ children, wrap }) => (
    <Typography sx={{ ...numeric, fontSize: FONT.micro, color: "text.disabled", lineHeight: 1.2, ...(wrap && { whiteSpace: "normal" }) }}>
        {children}
    </Typography>
);

const StatConverter: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { spec, setSpec } = useSpec();

    const [rating, setRating] = useState(0);
    const [stat, setStat] = useState<StatKey>("mastery");
    const [mode, setMode] = useState<Mode>("percent");
    const [masteryUnit, setMasteryUnit] = useState<MasteryUnit>("spec");

    const coefficient = spec.masteryCoefficient;
    const specLabel = spec.name.toLowerCase();
    const current = STAT_ROWS.find((s) => s.key === stat) ?? STAT_ROWS[0];
    const per = RATING_PER_PERCENT[stat];
    const scale = stat === "mastery" && masteryUnit === "spec" ? coefficient : 1;

    const inputValue = mode === "rating" ? rating : ratingToPercent(rating, per) * scale;
    const inputMax = mode === "rating" ? MAX_RAW_PERCENT * per : MAX_PERCENT * scale;
    const onInput = (value: number) => setRating(mode === "rating" ? value : (percentToRating(value / scale, per) ?? MAX_RAW_PERCENT * per));

    const inputUnit =
        mode === "rating" ? "rating" : stat === "mastery" ? (masteryUnit === "spec" ? `${specLabel} mastery` : "mastery points") : current.label.toLowerCase();

    const columns: SwirlColumn<StatRow>[] = [
        {
            key: "stat",
            label: "stat",
            width: isMobile ? "0.8fr" : "1fr",
            render: (row) => (
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: FONT.body, fontWeight: 600, color: row.color }}>{isMobile ? row.short : row.label}</Typography>
                    {isMobile ? (
                        row.key === stat && <Caption>input</Caption>
                    ) : (
                        <Caption>
                            {RATING_PER_PERCENT[row.key]} per 1%{row.key === stat ? " · input" : ""}
                        </Caption>
                    )}
                </Box>
            ),
        },
        {
            key: "percent",
            label: "percent",
            width: isMobile ? "1.3fr" : "1fr",
            align: "right",
            render: (row) => {
                const points = ratingToPercent(rating, RATING_PER_PERCENT[row.key]);
                return (
                    <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ ...numeric, fontSize: FONT.body, fontWeight: 600, color: rating > 0 ? "text.primary" : "text.disabled" }}>
                            {formatPercent(points)}
                        </Typography>
                        {row.key === "mastery" && (
                            <Caption wrap>
                                {formatPercent(points * coefficient)} {specLabel}
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
            width: "1fr",
            align: "right",
            render: (row) => {
                const rowPer = RATING_PER_PERCENT[row.key];
                const lost = Math.min(rating / rowPer, MAX_RAW_PERCENT) - ratingToPercent(rating, rowPer);
                const penalty = currentPenalty(rating, rowPer);
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
    ];

    return (
        <Container sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center", justifyContent: "center" }}>
            <PageHeader title={title} subtitle={description} />

            <Box sx={{ width: "100%", maxWidth: CONTENT_WIDTH.wide, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <SpecChip accent={spec.color} spec={spec} onChange={setSpec} />
                <SelectChip
                    accent={current.color}
                    title="stat"
                    value={stat}
                    options={STAT_ROWS.map((s) => ({ value: s.key, label: s.label }))}
                    onChange={(v) => setStat(v as StatKey)}
                    active
                />
                <SelectChip
                    accent={current.color}
                    title="from"
                    value={mode}
                    options={[
                        { value: "percent", label: "percent" },
                        { value: "rating", label: "rating" },
                    ]}
                    onChange={(v) => setMode(v as Mode)}
                />
                {stat === "mastery" && mode === "percent" && (
                    <SelectChip
                        accent={current.color}
                        title="mastery"
                        value={masteryUnit}
                        options={[
                            { value: "spec", label: `${specLabel} %` },
                            { value: "points", label: "points" },
                        ]}
                        onChange={(v) => setMasteryUnit(v as MasteryUnit)}
                    />
                )}
                <Box sx={{ width: isMobile ? "100%" : "18ch" }}>
                    <NumberInput label={mode} value={inputValue} max={inputMax} suffix={mode === "percent" ? "%" : undefined} onChange={onInput} />
                </Box>
                <Box
                    onClick={() => setRating(0)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setRating(0);
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

            <Box sx={{ width: "100%", maxWidth: CONTENT_WIDTH.wide, display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap", px: 0.5 }}>
                <Typography sx={{ ...numeric, fontSize: FONT.body }}>
                    {mode === "rating" ? `${formatNumber(rating, Number.isInteger(rating) ? 0 : 2)} rating` : `${formatPercent(inputValue)} ${inputUnit}`}
                </Typography>
                <Typography sx={{ fontSize: FONT.body, color: "text.disabled" }}>=</Typography>
                <Typography sx={{ ...numeric, fontSize: FONT.body, fontWeight: 600, color: current.color }}>
                    {mode === "rating"
                        ? `${formatPercent(ratingToPercent(rating, per) * scale)} ${stat === "mastery" ? `${specLabel} mastery` : current.label.toLowerCase()}`
                        : `${formatNumber(rating, Number.isInteger(rating) ? 0 : 2)} rating`}
                </Typography>
            </Box>

            <Box sx={{ width: "100%", maxWidth: CONTENT_WIDTH.wide }}>
                <SwirlTable
                    rows={STAT_ROWS}
                    rowKey={(row) => row.key}
                    columns={columns}
                    accentColor={(row) => row.color}
                    onRowClick={(row) => setStat(row.key)}
                />
            </Box>
        </Container>
    );
};

export default StatConverter;
