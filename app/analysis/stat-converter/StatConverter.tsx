"use client";
import { SpecChip } from "@components/FilterChips/FilterChips";
import { GlassTooltip } from "@components/Glass";
import PageHeader from "@components/PageHeader/PageHeader";
import SwirlTable, { type SwirlColumn } from "@components/SwirlTable/SwirlTable";
import { motion } from "@components/Theme/motion";
import { CHIP_HEIGHT, CONTENT_WIDTH, FONT, HAIRLINE, MONO_FONT } from "@components/Theme/tokens";
import { useSpec } from "@context/SpecContext";
import { STAT_COLORS, STATS } from "@data/shared/stats";
import { Box, Container, InputBase, Typography } from "@mui/material";
import { formatNumber, formatPercent } from "@util/stringManipulation";
import React, { useState } from "react";

import { drBreakdown, maxPercent, maxRating, percentToRating, ratingToPercent, STAT_CONVERSIONS, type StatKey } from "./convert";

const STAT_KEYS = Object.keys(STAT_CONVERSIONS) as StatKey[];

const tooltipRule = <Box sx={{ gridColumn: "1 / -1", height: "1px", backgroundColor: HAIRLINE, my: 0.25 }} />;

const BASE_MASTERY = 8;

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

const StatConverter: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
    const { spec, setSpec } = useSpec();
    const [rating, setRating] = useState(0);

    const coefficient = spec.masteryCoefficient;

    const columns: SwirlColumn<StatKey>[] = [
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
            render: (stat) => <Typography sx={{ ...numeric, fontSize: FONT.body, color: "text.secondary" }}>{STAT_CONVERSIONS[stat].per}</Typography>,
        },
        {
            key: "dr",
            label: (
                <GlassTooltip title="Secondary: 10% penalty from 30%, 20% from 39%, 30% from 47%, 40% from 54%, 50% from 66%, capped at 126%. Tertiary: 20% penalty from 10%, 40% from 14%, 60% from 17%, capped at 28.6%">
                    <span>dr</span>
                </GlassTooltip>
            ),
            width: "0.8fr",
            align: "right",
            render: (stat) => {
                const { per } = STAT_CONVERSIONS[stat];
                const rows = drBreakdown(rating, stat);
                const lostRating = rows.reduce((sum, r) => sum + r.rating * r.penalty, 0);
                if (lostRating <= 0) return <Typography sx={{ ...numeric, fontSize: FONT.body, color: "text.disabled" }}>–</Typography>;
                return (
                    <GlassTooltip
                        placement="left"
                        title={
                            <Box sx={{ display: "grid", gridTemplateColumns: "auto auto auto", columnGap: 1.5, rowGap: 0.25 }}>
                                {rows.map((r) => (
                                    <React.Fragment key={r.penalty}>
                                        <Typography variant="caption" color="text.secondary">
                                            {r.penalty === 0 ? "no dr" : r.penalty === 1 ? "over cap" : `${Math.round(r.penalty * 100)}% dr`}
                                        </Typography>
                                        <Typography variant="caption" align="right" sx={numeric}>
                                            {formatNumber(r.rating, 0)}
                                        </Typography>
                                        <Typography variant="caption" align="right" sx={numeric}>
                                            {formatPercent(r.percent)}
                                        </Typography>
                                    </React.Fragment>
                                ))}
                                {tooltipRule}
                                <Typography variant="caption" color="text.secondary">
                                    lost
                                </Typography>
                                <Typography variant="caption" align="right" sx={numeric}>
                                    -{formatNumber(lostRating, 0)}
                                </Typography>
                                <Typography variant="caption" align="right" sx={numeric}>
                                    -{formatPercent(lostRating / per)}
                                </Typography>
                                <Typography variant="caption" fontWeight="bold">
                                    kept
                                </Typography>
                                <Typography variant="caption" align="right" fontWeight="bold" sx={numeric}>
                                    {formatNumber(rating - lostRating, 0)}
                                </Typography>
                                <Typography variant="caption" align="right" fontWeight="bold" sx={numeric}>
                                    {formatPercent(ratingToPercent(rating, stat))}
                                </Typography>
                            </Box>
                        }
                    >
                        <Box component="span" sx={{ display: "inline-block", cursor: "help", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>
                            <Typography sx={{ ...numeric, fontSize: FONT.body }}>-{formatPercent(lostRating / per)}</Typography>
                        </Box>
                    </GlassTooltip>
                );
            },
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
