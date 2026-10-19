"use client";
import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Typography, Box, Card, Divider, useMediaQuery, useTheme, } from '@mui/material';

import TimelineVisualizer from '@components/TimelineVisualizer/TimelineVisualizer';
import { SpecChip } from '@components/FilterChips/FilterChips';
import SpellButtons from '@components/SpellButtons/SpellButtons';
import CurrentRotationControl from '@components/CurrentRotationControl/CurrentRotationControl';
import PageHeader from '@components/PageHeader/PageHeader';
import SwirlChip from '@components/SwirlChip/SwirlChip';
import StatsCard from '@components/StatsCard/StatsCard';
import ConfigPanel from '@components/ConfigPanel/ConfigPanel';
import { CONTENT_WIDTH } from '@components/Theme/tokens';

import { useSpec } from '@context/SpecContext';

import type spell from '@data/spells/spell';
import { CLASSES, type specialization, getSpecializationByKey } from '@data/class';
import { getSpellById } from '@data/spells';

import { useRotationManager } from '@hooks/useRotationManager';
import { encodeShare, decodeShare } from '@util/rotationShare';

const Timeline: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
    const { spec, setSpec } = useSpec();
    const [spellList, setSpellList] = useState<spell[]>([]);
    const [haste, setHaste] = useState<number | "">(0);
    const skipUrlSync = useRef(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const {
        currentRotation,
        rotations,
        addSpellToRotation,
        removeSpellFromRotation,
        finalizeRotation,
        clearCurrentRotation,
        clearAllRotations,
        removeRotation,
        moveRotationUp,
        moveRotationDown,
        setCurrentRotation,
        setRotations,
        hasRotations,
        onReorderRotation,
    } = useRotationManager();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get('r');
        if (!encoded) return;
        const payload = decodeShare(encoded, true);
        if (!payload) return;
        const linkedSpec = getSpecializationByKey(payload.spec!);
        if (!linkedSpec) return;
        const hydratedRotations = payload.rotations.map((ids, i) => ({
            id: crypto.randomUUID(),
            name: `Rotation ${i + 1}`,
            steps: ids.flatMap(id => {
                const s = getSpellById(id);
                return s ? [{ ...s, uuid: crypto.randomUUID() }] : [];
            }),
        }));
        skipUrlSync.current = true;
        setSpec(linkedSpec);
        setRotations(hydratedRotations);
    }, [setSpec, setRotations]);

    useEffect(() => {
        if (skipUrlSync.current) {
            skipUrlSync.current = false;
            return;
        }
        const params = new URLSearchParams(window.location.search);
        if (rotations.length === 0) {
            params.delete('r');
        } else {
            params.set('r', encodeShare(rotations, spec.key));
        }
        const next = params.toString() ? `?${params.toString()}` : window.location.pathname;
        window.history.replaceState(null, '', next);
    }, [rotations, spec.key]);

    const handleSpecChange = (newSpec: specialization) => {
        if (spellList.length > 0) {
            setSpellList([]);
            console.warn("You cannot change specialization while spells are in the table. Table cleared.");
        }
        setSpec(newSpec);
        clearCurrentRotation();
        clearAllRotations();
    };

    const handleSelectPreset = (spells: spell[]) => {
        setCurrentRotation(spells);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <PageHeader title={title} subtitle={description} />

            {isMobile && (
                <Box sx={{ mb: 2, px: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                        
                            For the best experience, rotate your device to <b>horizontal (landscape)</b> mode.
                        
                    </Typography>
                </Box>
            )}

            <Box sx={{ maxWidth: { xs: '90%', sm: '90%', md: CONTENT_WIDTH.narrow }, width: { xs: '90%', sm: '90%', md: '100%' }, mx: 'auto' }}>
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
                        <SwirlChip
                            message="This spec has limited support for cast time reductions and haste buff gains"
                            showIcon
                            borderColor="#ffa726"
                        />
                    </Box>
                )}
            </Box>

            <Card
                variant="outlined"
                sx={{
                    overflowX: { xs: 'auto', md: 'visible' },
                    maxWidth: { xs: '90%', sm: '90%', md: CONTENT_WIDTH.narrow },
                    width: { xs: '90%', sm: '90%', md: '100%' },
                    mx: 'auto',
                    mb: { xs: 2, sm: 3 },
                    boxSizing: 'border-box',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
                    <SpellButtons
                        selectedSpec={spec}
                        addSpellToTable={addSpellToRotation}
                        onSelectPreset={handleSelectPreset}
                    />

                    <Divider sx={{ mx: -2, mt: 2, mb: 2, width: 'auto' }} />

                    {spec && (
                        <CurrentRotationControl
                            currentRotation={currentRotation}
                            onRemoveSpell={removeSpellFromRotation}
                            onFinalizeRotation={finalizeRotation}
                            onClearCurrentRotation={clearCurrentRotation}
                            onClearAllRotations={clearAllRotations}
                            hasRotations={hasRotations}
                            onReorderRotation={onReorderRotation}
                        />
                    )}
                </Box>
            </Card>

            <TimelineVisualizer
                selectedSpec={spec}
                haste={haste === "" ? 0 : haste}
                rotations={rotations}
                onRemoveRotation={removeRotation}
                onMoveRotationUp={moveRotationUp}
                onMoveRotationDown={moveRotationDown}
            />
        </div>
    );
};

export default Timeline;
