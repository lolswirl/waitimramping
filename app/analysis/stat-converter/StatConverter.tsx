"use client";
import { SpecChip } from "@components/FilterChips/FilterChips";
import { GlassTooltip, GlassTooltipRule } from "@components/Glass";
import PageHeader from "@components/PageHeader/PageHeader";
import SwirlTable, { type SwirlColumn } from "@components/SwirlTable/SwirlTable";
import { motion } from "@components/Theme/motion";
import { CHIP_HEIGHT, CONTENT_WIDTH, FONT, MONO_FONT } from "@components/Theme/tokens";
import { useSpec } from "@context/SpecContext";
import { BASE_MASTERY, type RatedStat, STAT_COLORS, STAT_RATINGS, STATS } from "@data/shared/stats";
import { Box, Container, InputBase, Typography } from "@mui/material";
import { formatNumber, formatPercent } from "@util/stringManipulation";
import React, { useState } from "react";

import { drBreakdown, lostRating, maxPercent, maxRating, percentToRating, ratingToPercent } from "./convert";

const STAT_KEYS = Object.keys(STAT_RATINGS) as RatedStat[];

const MAX_RATING = Math.max(...STAT_KEYS.map(maxRating));

const numeric = { fontFamily: MONO_FONT, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

const trim = (n: number) => String(Number.parseFloat(n.toFixed(2)));

const NumberInput: React.FC<{ label?: string; value: number; max: number; suffix?: string; onChange: (value: number) => void }> = ({
    label,
    value,
    max,
    suffix,
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
                    px: 1,
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
                        if (Number.isNaN(parsed)) return;
                        setOver(parsed > max);
                        onChange(Math.min(Math.max(parsed, 0), max));
                    }}
                    onBlur={() => {
                        setText(null);
                        setOver(false);
                    }}
                    inputProps={{ inputMode: "decimal" }}
                    sx={{ flex: 1, minWidth: 0, fontSize: FONT.body, "& input": { ...numeric, textAlign: "right", p: 0 } }}
                />
                {suffix && <Typography sx={{ fontSize: FONT.small, color: "text.disabled" }}>{suffix}</Typography>}
            </Box>
        </GlassTooltip>
    );
};

const TooltipCell: React.FC<{ children: React.ReactNode; label?: boolean; bold?: boolean }> = ({ children, label, bold }) => (
    <Typography
        variant="caption"
        align={label ? "left" : "right"}
        color={label && !bold ? "text.secondary" : undefined}
        fontWeight={bold ? "bold" : undefined}
        sx={numeric}
    >
        {children}
    </Typography>
);

const penaltyLabel = (penalty: number) => (penalty === 0 ? "no dr" : penalty === 1 ? "over cap" : `${Math.round(penalty * 100)}% dr`);

const DrCell: React.FC<{ rating: number; stat: RatedStat }> = ({ rating, stat }) => {
    const { per } = STAT_RATINGS[stat];
    const lost = lostRating(rating, stat);
    if (lost <= 0) return <Typography sx={{ ...numeric, fontSize: FONT.body, color: "text.disabled" }}>–</Typography>;

    const breakdown = (
        <Box sx={{ display: "grid", gridTemplateColumns: "auto auto auto", columnGap: 1.5, rowGap: 0.25 }}>
            {drBreakdown(rating, stat).map((row) => (
                <React.Fragment key={row.penalty}>
                    <TooltipCell label>{penaltyLabel(row.penalty)}</TooltipCell>
                    <TooltipCell>{formatNumber(row.rating, 0)}</TooltipCell>
                    <TooltipCell>{formatPercent(row.percent)}</TooltipCell>
                </React.Fragment>
            ))}
            <GlassTooltipRule />
            <TooltipCell label>lost</TooltipCell>
            <TooltipCell>-{formatNumber(lost, 0)}</TooltipCell>
            <TooltipCell>-{formatPercent(lost / per)}</TooltipCell>
            <TooltipCell label bold>
                kept
            </TooltipCell>
            <TooltipCell bold>{formatNumber(rating - lost, 0)}</TooltipCell>
            <TooltipCell bold>{formatPercent(ratingToPercent(rating, stat))}</TooltipCell>
        </Box>
    );

    return (
        <GlassTooltip placement="left" title={breakdown}>
            <Box component="span" sx={{ display: "inline-block", cursor: "help", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>
                <Typography sx={{ ...numeric, fontSize: FONT.body }}>-{formatPercent(lost / per)}</Typography>
            </Box>
        </GlassTooltip>
    );
};

const StatConverter: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
    const { spec, setSpec } = useSpec();
    const [rating, setRating] = useState(0);

    const coefficient = spec.masteryCoefficient;

    const columns: SwirlColumn<RatedStat>[] = [
        {
            key: "stat",
            label: "stat",
            width: "1fr",
            render: (stat) => <Typography sx={{ fontSize: FONT.body, fontWeight: 600, color: STAT_COLORS[stat] }}>{STATS[stat]}</Typography>,
        },
        {
            key: "per",
            label: "per 1%",
            width: "0.6fr",
            align: "right",
            render: (stat) => <Typography sx={{ ...numeric, fontSize: FONT.body, color: "text.secondary" }}>{STAT_RATINGS[stat].per}</Typography>,
        },
        {
            key: "dr",
            label: "dr",
            width: "0.8fr",
            align: "right",
            render: (stat) => <DrCell rating={rating} stat={stat} />,
        },
        {
            key: "percent",
            label: "percent",
            width: "15ch",
            align: "right",
            render: (stat) => {
                const percent = ratingToPercent(rating, stat);
                const isMastery = stat === "MASTERY";
                const scale = isMastery ? coefficient : 1;
                const base = isMastery ? BASE_MASTERY : 0;
                return (
                    <GlassTooltip title={isMastery ? `${BASE_MASTERY} base + ${formatNumber(percent, 2)} points` : ""} placement="right">
                        <Box sx={{ width: "100%", py: 0.5 }}>
                            <NumberInput
                                value={(base + percent) * scale}
                                max={(base + maxPercent(stat)) * scale}
                                suffix="%"
                                onChange={(value) => setRating(percentToRating(value / scale - base, stat))}
                            />
                        </Box>
                    </GlassTooltip>
                );
            },
        },
    ];

    return (
        <Container sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center", justifyContent: "center" }}>
            <PageHeader title={title} subtitle={description} />

            <Box sx={{ width: "100%", maxWidth: CONTENT_WIDTH.narrow, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <SpecChip accent={spec.color} spec={spec} onChange={setSpec} />
                <Box sx={{ width: "18ch" }}>
                    <NumberInput label="rating" value={rating} max={MAX_RATING} onChange={setRating} />
                </Box>
            </Box>

            <Box sx={{ width: "100%", maxWidth: CONTENT_WIDTH.narrow }}>
                <SwirlTable rows={STAT_KEYS} rowKey={(stat) => stat} columns={columns} accentColor={(stat) => STAT_COLORS[stat]} />
            </Box>
        </Container>
    );
};

export default StatConverter;
