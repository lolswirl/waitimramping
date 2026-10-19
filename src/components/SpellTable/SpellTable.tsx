"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Stack, Typography, Divider, Card } from "@mui/material";
import { ArrowUpward, ArrowDownward, DeleteTwoTone, DeleteForever } from "@mui/icons-material";

import SwirlButton from "@components/Buttons/SwirlButton";
import { SwirlIconButton } from "@components/Buttons/SwirlIconButton";
import SpellButton from "@components/SpellButtons/SpellButton";

import type spell from "@data/spells/spell";
import { calculateEffectiveCastTime } from "@data/spells/spell";
import { applyBuffEffects } from "@data/buffs";
import type { specialization } from "@data/class";

import { toRomanNumeral } from "@util/toRomanNumeral";
import SwirlChip from "@components/SwirlChip/SwirlChip";
import { ICON } from "@components/Theme/tokens";


interface SpellTableProps {
    spellList: spell[];
    setSpellList: React.Dispatch<React.SetStateAction<spell[]>>;
    removeSpellFromTable: (index: number) => void;
    selectedSpec: specialization;
    haste: number;
    onTotalCastTimeChange: (totalTime: number) => void;
    clearTable: () => void;
}

const SpellTable: React.FC<SpellTableProps> = ({
    spellList,
    setSpellList,
    removeSpellFromTable,
    selectedSpec,
    haste,
    onTotalCastTimeChange,
    clearTable,
}) => {
    const [adjustedSpells, setAdjustedSpells] = useState<spell[]>([]);
    const [totalTime, setTotalTime] = useState(0);

    useEffect(() => {
        let cancelled = false;
        applyBuffEffects(selectedSpec, spellList).then(result => {
            if (!cancelled) setAdjustedSpells(result);
        });
        return () => { cancelled = true; };
    }, [selectedSpec, spellList]);

    useEffect(() => {
        let currentTime = 0;
        adjustedSpells.forEach((spell) => {
            const { effectiveTime } = calculateEffectiveCastTime(spell, haste);
            currentTime += effectiveTime;
        });
        setTotalTime(currentTime);
        onTotalCastTimeChange(currentTime);
    }, [adjustedSpells, haste, onTotalCastTimeChange]);

    const moveSpell = (index: number, direction: "up" | "down") => {
        setSpellList((prev) => {
            const next = [...prev];
            if (direction === "up" && index > 0)
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
            if (direction === "down" && index < next.length - 1)
                [next[index], next[index + 1]] = [next[index + 1], next[index]];
            return next;
        });
    };

    if (spellList.length === 0) return null;

    return (
        <Card
            variant="outlined"
            sx={{
                maxWidth: 600,
                width: { xs: "90%", sm: "90%", md: "100%" },
                mx: "auto",
                boxSizing: "border-box",
            }}
        >
            <Stack divider={<Divider />} sx={{ pt: 1, pb: 1 }}>
                <AnimatePresence>
                    {adjustedSpells.map((spell, index) => {
                        const { effectiveTime, isGCDConstrained } = calculateEffectiveCastTime(spell, haste);

                        return (
                            <motion.div
                                key={spell.uuid}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    px: 2,
                                    py: 0.75,
                                    gap: 1.5,
                                }}>
                                    <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, minWidth: 16, textAlign: 'right' }}>
                                        {index + 1}
                                    </Typography>
                                    <SpellButton selectedSpell={spell} size={ICON.md} />
                                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                                        <Typography variant="body2" noWrap>
                                            {spell.name} {spell.empowerLevel ? `(${toRomanNumeral(spell.empowerLevel)})` : ''}
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                                            
                                                {isGCDConstrained ? `GCD: ${effectiveTime.toFixed(2)}s` : `${effectiveTime.toFixed(2)}s`}
                                            
                                        </Typography>
                                        <Box sx={{ flex: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', alignSelf: 'center' }} />
                                    </Box>
                                    <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                                        <SwirlIconButton onClick={() => moveSpell(index, "up")} disabled={index === 0} sx={{ p: '4px' }}>
                                            <ArrowUpward sx={{ fontSize: 14 }} />
                                        </SwirlIconButton>
                                        <SwirlIconButton onClick={() => moveSpell(index, "down")} disabled={index === adjustedSpells.length - 1} sx={{ p: '4px' }}>
                                            <ArrowDownward sx={{ fontSize: 14 }} />
                                        </SwirlIconButton>
                                        <SwirlIconButton tint="danger" onClick={() => removeSpellFromTable(index)} sx={{ p: '4px' }}>
                                            <DeleteTwoTone sx={{ fontSize: 14 }} />
                                        </SwirlIconButton>
                                    </Box>
                                </Box>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </Stack>

            <Divider sx={{ mx: 0 }} />

            <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1,
                backgroundColor: "rgba(255,255,255,0.03)",
            }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Total
                    </Typography>
                    <SwirlChip message={`${totalTime.toFixed(2)}s`} />
                </Box>
                <SwirlButton
                    color="error"
                    onClick={clearTable}
                    startIcon={<DeleteForever />}
                >
                    Clear All
                </SwirlButton>
            </Box>
        </Card>
    );
};

export default SpellTable;
