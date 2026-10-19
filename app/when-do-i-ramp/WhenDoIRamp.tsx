"use client";
import { useState, useEffect, useRef } from "react";
import { Card, Box, Typography } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

import PageHeader from '@components/PageHeader/PageHeader';
import { SpecChip } from '@components/FilterChips/FilterChips';
import SpellButtons from '@components/SpellButtons/SpellButtons';
import SpellTable from '@components/SpellTable/SpellTable';
import SwirlChip from '@components/SwirlChip/SwirlChip';
import StatsCard from '@components/StatsCard/StatsCard';
import ConfigPanel from '@components/ConfigPanel/ConfigPanel';
import { CONTENT_WIDTH, FONT, HAIRLINE, RADIUS } from '@components/Theme/tokens';

import { CLASSES, type specialization, getSpecializationByKey } from '@data/class';
import type spell from '@data/spells/spell';
import { getSpellById } from '@data/spells';

import { useSpec } from '@context/SpecContext';
import { encodeShare, decodeShare } from '@util/rotationShare';

const RampAnswer: React.FC<{ seconds: number; accent: string }> = ({ seconds, accent }) => {
    const hasAnswer = seconds > 0;

    return (
        <Box sx={{
            mt: 1.5,
            px: 2,
            py: 1.5,
            textAlign: 'center',
            borderRadius: `${RADIUS.card}px`,
            border: hasAnswer ? `1px solid ${accent}55` : `1px dashed ${HAIRLINE}`,
            backgroundColor: hasAnswer ? `${accent}0d` : 'transparent',
            transition: 'border-color 0.2s ease, background-color 0.2s ease',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.25, my: 0.25 }}>
                <Typography sx={{
                    fontSize: FONT.display,
                    fontWeight: 700,
                    lineHeight: 1.1,
                    fontFamily: 'monospace',
                    color: hasAnswer ? accent : 'text.disabled',
                }}>
                    {hasAnswer ? Math.ceil(seconds) : '—'}
                </Typography>
                {hasAnswer && (
                    <Typography sx={{ fontSize: FONT.subhead, fontWeight: 700, color: accent }}>s</Typography>
                )}
            </Box>
            <Typography sx={{ fontSize: FONT.micro, color: 'text.secondary' }}>
                {hasAnswer ? 'before a mechanic' : 'click a spell above to see your ramp time'}
            </Typography>
        </Box>
    );
};

const WhenDoIRamp: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
    const { spec, setSpec } = useSpec();
    const [lockedSpecName, setLockedSpecName] = useState<string | null>(null);
    const [spellList, setSpellList] = useState<spell[]>([]);
    const [haste, setHaste] = useState<number | "">(30);
    const [totalCastTime, setTotalCastTime] = useState(0);
    const skipUrlSync = useRef(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get('r');
        if (!encoded) return;
        const payload = decodeShare(encoded, true);
        if (!payload) return;
        const linkedSpec = getSpecializationByKey(payload.spec!);
        if (!linkedSpec) return;
        const hydratedSpells = (payload.rotations[0] ?? []).flatMap(id => {
            const s = getSpellById(id);
            return s ? [{ ...s, uuid: uuidv4() }] : [];
        });
        skipUrlSync.current = true;
        localStorage.setItem('selectedSpec', linkedSpec.key);
        setSpec(linkedSpec);
        setLockedSpecName(linkedSpec.name);
        setSpellList(hydratedSpells);
    }, [setSpec]);

    useEffect(() => {
        if (skipUrlSync.current) {
            skipUrlSync.current = false;
            return;
        }
        const params = new URLSearchParams(window.location.search);
        if (spellList.length === 0) {
            params.delete('r');
        } else {
            params.set('r', encodeShare([{ steps: spellList }], spec.key));
        }
        const next = params.toString() ? `?${params.toString()}` : window.location.pathname;
        window.history.replaceState(null, '', next);
    }, [spellList, spec.key]);

    const handleSpecChange = (newSpec: specialization) => {
        if (spellList.length === 0) {
            setSpec(newSpec);
            setLockedSpecName(null);
        } else {
            clearTable();
            setSpec(newSpec);
        }
    };

    const addSpellToTable = (spell: spell, empowerLevel: number) => {
        if (!spec) return;
        if (!lockedSpecName) setLockedSpecName(spec.name);
        if (lockedSpecName && lockedSpecName !== spec.name) return;
        setSpellList(prev => [
            ...prev,
            {
                ...spell,
                uuid: uuidv4(),
                ...(Object.hasOwn(spell, "empowerLevel") ? { empowerLevel } : {}),
            },
        ]);
    };

    const removeSpellFromTable = (index: number) => {
        const updated = spellList.filter((_, i) => i !== index);
        setSpellList(updated);
        if (updated.length === 0) setLockedSpecName(null);
    };

    const clearTable = () => {
        setSpellList([]);
        setLockedSpecName(null);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <PageHeader title={title} subtitle={description} />

            <Box sx={{ maxWidth: CONTENT_WIDTH.narrow, width: { xs: "90%", sm: "90%", md: "100%" }, mx: "auto" }}>
                <ConfigPanel
                    accent={spec.color}
                    leading={<SpecChip accent={spec.color} spec={spec} onChange={handleSpecChange} />}
                    sections={[
                        {
                            key: "stats",
                            title: "stats",
                            summary: `${haste === "" ? 0 : haste}% haste`,
                            content: (
                                <StatsCard
                                    fields={["haste"]}
                                    options={{ intellect: 0, mastery: 0, crit: 0, versatility: 0, haste: haste === "" ? 0 : haste }}
                                    onOptionsChange={(updater: any) => {
                                        const prev = { intellect: 0, mastery: 0, crit: 0, versatility: 0, haste: haste === "" ? 0 : haste };
                                        const next = typeof updater === "function" ? updater(prev) : updater;
                                        setHaste(next.haste);
                                    }}
                                />
                            ),
                        },
                    ]}
                />

                {spec !== CLASSES.MONK.SPECS.MISTWEAVER && (
                    <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center' }}>
                        <SwirlChip message="This spec has limited support for cast time reductions and haste buff gains" showIcon borderColor='#ffa726' />
                    </Box>
                )}

                <Card variant="outlined" sx={{ mt: 1.5, p: 2, boxSizing: "border-box" }}>
                    <SpellButtons selectedSpec={spec} addSpellToTable={addSpellToTable} />
                </Card>

                <RampAnswer seconds={totalCastTime} accent={spec.color} />
            </Box>

            <SpellTable
                spellList={spellList}
                setSpellList={setSpellList}
                removeSpellFromTable={removeSpellFromTable}
                selectedSpec={spec!}
                haste={haste === "" ? 0 : haste}
                onTotalCastTimeChange={setTotalCastTime}
                clearTable={clearTable}
            />
        </div>
    );
};

export default WhenDoIRamp;
