"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { Box, useTheme, Card, Divider, Grid } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import PageHeader from "@components/PageHeader/PageHeader";
import SpellButtons from "@components/SpellButtons/SpellButtons";
import CurrentRotationControl from "@components/CurrentRotationControl/CurrentRotationControl";
import { RotationCard } from '@components/RotationCard/RotationCard';
import StatsCard, { Group, statsSummary } from "@components/StatsCard/StatsCard";
import ConfigPanel from "@components/ConfigPanel/ConfigPanel";
import { CONTENT_WIDTH } from "@components/Theme/tokens";
import TargetCountsCard from "@components/TargetCountCard/TargetCountsCard";
import TalentsCard from "@components/TalentsCard/TalentsCard";
import SwirlButton from "@components/Buttons/SwirlButton";
import { CLASSES } from "@data/class";
import type spell from "@data/spells/spell";
import SPELLS from "@data/spells";
import TALENTS from "@data/specs/monk/mistweaver/talents";
import SHARED from "@data/specs/monk/talents";
import { CHIJI_ABILITIES } from "@data/specs/monk/mistweaver/spells";
import { useRotationManager } from "@hooks/useRotationManager";
import { pluralize } from "@util/stringManipulation";
import { calculateRotationHPS } from './simulation';
import type { RotationResult, SimulationOptions } from './types';

const ChiJiPage: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
    const theme = useTheme();
    const [rotationHPS, setRotationHPS] = useState<RotationResult[]>([]);
    const [expandedRotations, setExpandedRotations] = useState<Set<number>>(new Set());
    const [isSimulating, setIsSimulating] = useState(false);
    const maxWidth = CONTENT_WIDTH.wide;

    const mistweaver = CLASSES.MONK.SPECS.MISTWEAVER;
    const { intellect, mastery, crit, versatility, haste, totalHp } = mistweaver.stats;

    const mistweaverTalents = new Map<spell, boolean>([
        [TALENTS.CELESTIAL_HARMONY, true],
        [TALENTS.JADE_BOND, false],
        [TALENTS.MIST_WRAP, true],
        [TALENTS.LOTUS_INFUSION, true],
        [TALENTS.CRANE_STYLE, true],
        [TALENTS.RAPID_DIFFUSION, true],
        [TALENTS.JADEFIRE_TEACHINGS, true],
        [TALENTS.RUSHING_WIND_KICK, false],
        [TALENTS.WAY_OF_THE_CRANE, true],
        [TALENTS.FOCUSED_THUNDER, true],
        [TALENTS.EMPERORS_ELIXIR, true],
    ])

    const sharedTalents = new Map<spell, boolean>([
        [SHARED.FAST_FEET, true],
        [SHARED.FEROCITY_OF_XUEN, true],
        [SHARED.CHI_PROFICIENCY, true],
        [SHARED.MARTIAL_INSTINCTS, true],
    ])
    
    const [options, setOptions] = useState<SimulationOptions>({
        intellect,
        totalHp,
        crit,
        versatility,
        mastery,
        haste,
        enemyCount: 1,
        allyCount: 5,
        specTalents: mistweaverTalents,
        classTalents: sharedTalents,
    });

    const {
        currentRotation,
        rotations,
        addSpellToRotation,
        removeSpellFromRotation,
        finalizeRotation,
        clearCurrentRotation,
        clearAllRotations,
        removeRotation,
        hasRotations,
        onReorderRotation,
    } = useRotationManager();

    const addSpellToRotationCollapse = (spell: any) => {
        addSpellToRotation(spell);
        setExpandedRotations(new Set());
    }

    useEffect(() => {
        const updateHPS = async () => {
            if (rotations.length > 0) {
                setIsSimulating(true);
                try {
                    const hpsData = await Promise.all(
                        rotations.map((rotation, index) => 
                            calculateRotationHPS(rotation.steps, index, options, mistweaver)
                        )
                    );
                    setRotationHPS(hpsData);
                } finally {
                    setIsSimulating(false);
                }
            } else {
                setRotationHPS([]);
            }
        };

        updateHPS();
    }, [rotations, options, mistweaver]);

    const handleRefresh = async () => {
        if (rotations.length > 0) {
            setIsSimulating(true);
            try {
                const hpsData = await Promise.all(
                    rotations.map((rotation, index) => 
                        calculateRotationHPS(rotation.steps, index, options, mistweaver)
                    )
                );
                setRotationHPS(hpsData);
            } finally {
                setIsSimulating(false);
            }
        }
    };

    const toggleRotationExpansion = (index: number) => {
        const newExpanded = new Set(expandedRotations);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedRotations(newExpanded);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <PageHeader
                title={title} 
                subtitle={description}
            />

            <Box sx={{ maxWidth: maxWidth, width: "75%", mx: "auto" }}>
                <ConfigPanel
                    accent={mistweaver.color}
                    sections={[
                        {
                            key: "stats",
                            title: "stats",
                            summary: statsSummary(options),
                            content: <StatsCard options={options} onOptionsChange={setOptions} spec={mistweaver} />,
                        },
                        {
                            key: "targets",
                            title: "targets",
                            summary: `${options.enemyCount} ${pluralize(options.enemyCount, "enemy", "enemies")}, ${options.allyCount} ${pluralize(options.allyCount, "ally", "allies")}`,
                            content: <TargetCountsCard options={options} onOptionsChange={setOptions} />,
                        },
                        {
                            key: "talents",
                            title: "talents",
                            summary: `${[...options.specTalents.values(), ...options.classTalents.values()].filter(Boolean).length} active`,
                            defaultOpen: true,
                            content: (
                                <Group>
                                    <TalentsCard
                                        label="Spec"
                                        options={options.specTalents}
                                        color={mistweaver.color}
                                        onChange={(talent, checked) => {
                                            setOptions(prev => ({
                                                ...prev,
                                                specTalents: new Map(prev.specTalents).set(talent, checked)
                                            }));
                                        }}
                                    />
                                    <TalentsCard
                                        label="Class"
                                        options={options.classTalents}
                                        color={CLASSES.MONK.color}
                                        onChange={(talent, checked) => {
                                            setOptions(prev => ({
                                                ...prev,
                                                classTalents: new Map(prev.classTalents).set(talent, checked)
                                            }));
                                        }}
                                        onRankChange={(talent, rank) => {
                                            setOptions(prev => ({
                                                ...prev,
                                                classTalents: new Map(prev.classTalents).set(talent, rank)
                                            }));
                                        }}
                                    />
                                </Group>
                            ),
                        },
                    ]}
                />
            </Box>

            <Card variant="outlined" sx={{ maxWidth: maxWidth, width: "75%", mx: "auto", mb: rotationHPS.length > 0 ? 0 : 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 2 }}>
                        <SpellButtons
                            spells={
                                options.specTalents.get(TALENTS.RUSHING_WIND_KICK)
                                    ? CHIJI_ABILITIES.map(s => s.id === SPELLS.RISING_SUN_KICK.id ? TALENTS.RUSHING_WIND_KICK : s)
                                    : CHIJI_ABILITIES
                            }
                            addSpellToTable={addSpellToRotationCollapse}
                        />
                    </Box>

                    <Divider />

                    {/* Bottom: rotation builder full width */}
                    <Box sx={{ p: 2 }}>
                        <CurrentRotationControl
                            currentRotation={currentRotation}
                            onRemoveSpell={removeSpellFromRotation}
                            onFinalizeRotation={finalizeRotation}
                            onClearCurrentRotation={clearCurrentRotation}
                            onClearAllRotations={clearAllRotations}
                            hasRotations={hasRotations}
                            onReorderRotation={onReorderRotation}
                        >
                            <SwirlButton
                                key={"refresh-rotation"}
                                color="success"
                                onClick={handleRefresh}
                                disabled={isSimulating || rotationHPS.length === 0}
                                startIcon={<Refresh />}
                            >
                                {isSimulating ? 'Simulating...' : 'Re-simulate'}
                            </SwirlButton>
                        </CurrentRotationControl>
                    </Box>
                </Box>
            </Card>
            {rotationHPS.length > 0 && (
                <>
                    <Box sx={{ width: "75%", maxWidth: maxWidth, px: 0, mb: 2 }}>
                        <Grid container spacing={2}>
                            {rotationHPS.map((rotation, index) => (
                                <Grid 
                                    size={{
                                        xs: 12,
                                        md: rotationHPS.length === 1 ? 12 : 6,
                                        lg: rotationHPS.length === 1 ? 12 : rotationHPS.length === 2 ? 6 : 4
                                    }}
                                    key={index}
                                >
                                    <RotationCard
                                        rotation={rotation}
                                        index={index}
                                        expanded={expandedRotations.has(index)}
                                        onToggleExpansion={() => toggleRotationExpansion(index)}
                                        onDelete={() => removeRotation(rotations[index].id)}
                                        theme={theme}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </>
            )}
        </div>
    );
};

export default ChiJiPage;
