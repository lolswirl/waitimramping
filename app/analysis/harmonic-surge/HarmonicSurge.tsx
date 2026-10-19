"use client";
import type React from "react";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Box, Container, useTheme } from "@mui/material";

import PageHeader from "@components/PageHeader/PageHeader";
import TalentsCard from "@components/TalentsCard/TalentsCard";
import ConfigPanel from "@components/ConfigPanel/ConfigPanel";
import { Group } from "@components/StatsCard/StatsCard";
import { CONTENT_WIDTH } from "@components/Theme/tokens";

import type spell from "@data/spells/spell";
import SPELLS from "@data/spells";
import TALENTS from "@data/specs/monk/mistweaver/talents";
import { CLASSES } from "@data/class";
import { calculateAncientTeachingsData, calculateGustOfMists, calculateSpellHealing, type Player } from "@data/specs/monk/mistweaver/calcs";
import MISTWEAVER_DEFAULT_TALENTS from "@data/specs/monk/mistweaver/defaultTalents";

import { T } from "@util/T";
import { pluralize } from "@util/stringManipulation";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const VISIBLE_TALENTS: spell[] = [TALENTS.JADE_EMPOWERMENT, SPELLS.CHI_JI, TALENTS.JADE_BOND];

const DEFAULT_TALENTS = new Map<spell, boolean>([
    ...MISTWEAVER_DEFAULT_TALENTS.spec,
    ...MISTWEAVER_DEFAULT_TALENTS.hero,
    ...MISTWEAVER_DEFAULT_TALENTS.class,
    [TALENTS.JADE_EMPOWERMENT, false],
    [SPELLS.CHI_JI, false],
    [TALENTS.JADE_BOND, false],
]);

const HarmonicSurge: React.FC<{ title: string; description: string }> = ({ title, description }) => {
    const theme = useTheme();

    const [selectedTalents, setSelectedTalents] = useState<Map<spell, boolean>>(DEFAULT_TALENTS);

    const mistweaver = CLASSES.MONK.SPECS.MISTWEAVER;
    const intellect = mistweaver.stats.intellect;

    const wayOfTheCrane = TALENTS.WAY_OF_THE_CRANE;
    const wayOfTheCraneTigerPalmHits = wayOfTheCrane.effects.tigerPalmHits;

    const craneStyle = TALENTS.CRANE_STYLE;
    const craneStyleRisingSunKickGOM = craneStyle.effects.risingSunKickGOM;
    const craneStyleBlackoutKickGOM = craneStyle.effects.blackoutKickGOM;
    const craneStyleBlackoutKickGOMChance = craneStyle.effects.gomChance;

    const teachingsOfTheMonastery = TALENTS.TEACHINGS_OF_THE_MONASTERY;
    const totmMaxStacks = teachingsOfTheMonastery.maxStacks;

    const player: Player = { stats: mistweaver.stats, talents: selectedTalents, corePassives: mistweaver.corePassives };

    const gustOfMistHealingAbsolute = calculateGustOfMists(player);
    const gustOfMistSpellpower = (gustOfMistHealingAbsolute / intellect) * 100;

    const jadeBond = TALENTS.JADE_BOND;
    const includeChiJiGusts = selectedTalents.get(SPELLS.CHI_JI);
    const chijiGustHealing = gustOfMistHealingAbsolute * (1 + (selectedTalents.get(jadeBond) ? jadeBond.effects.gustIncrease : 0));
    const chijiGustSpellpower = (chijiGustHealing / intellect) * 100;

    const tigerPalm = SPELLS.TIGER_PALM;
    const tigerPalmData = calculateAncientTeachingsData(tigerPalm, player);
    const tigerPalmHealing = (tigerPalmData.healing / intellect) * 100 * wayOfTheCraneTigerPalmHits;

    const blackoutKick = SPELLS.BLACKOUT_KICK;
    const blackoutKickData = calculateAncientTeachingsData(blackoutKick, player);

    // calc bok healing breakdown for stacked bars
    const calculateBlackoutKickBreakdown = (totmStacks: number) => {
        const bokHits = 1 + totmStacks;
        const ancientTeachingsHealing = (blackoutKickData.healing / intellect) * 100 * bokHits;
        const expectedGOMProcs = bokHits * craneStyleBlackoutKickGOMChance;
        const normalGOMHealing = gustOfMistSpellpower * craneStyleBlackoutKickGOM * expectedGOMProcs;

        let chiJiGustHealing = 0;
        if (includeChiJiGusts) {
            const totalGusts = 6 * bokHits;
            chiJiGustHealing = chijiGustSpellpower * totalGusts;
        }

        return {
            ancientTeachingsHealing,
            normalGOMHealing,
            chiJiGustHealing
        };
    };

    const risingSunKick = SPELLS.RISING_SUN_KICK;
    const risingSunKickData = calculateAncientTeachingsData(risingSunKick, player);
    const risingSunKickAncientTeachingsHealing = (risingSunKickData.healing / intellect) * 100;
    const risingSunKickNormalGOMHealing = gustOfMistSpellpower * craneStyleRisingSunKickGOM;
    const risingSunKickChiJiGustHealing = includeChiJiGusts ? chijiGustSpellpower * 6 : 0;

    const cjl = SPELLS.CRACKLING_JADE_LIGHTNING;
    const cjlData = calculateAncientTeachingsData(cjl, player);
    const cjlSpCoeff = (cjlData.healing / intellect) * 100;
    const jadeEmpowerment = TALENTS.JADE_EMPOWERMENT;
    const jadeEmpowermentIncrease = jadeEmpowerment.effects.spellpowerIncrease / 100;
    const jadeEmpowermentChain = jadeEmpowermentIncrease * jadeEmpowerment.effects.chainVal;
    const jeSpellpowerCalc = (value: number) => cjlSpCoeff * value;
    const jeValues = Array.from({ length: 5 }, (_, i) => i + 1);
    const jeSpellpowers = jeValues.map(value => jeSpellpowerCalc(jadeEmpowermentIncrease + (value - 1) * jadeEmpowermentChain));

    const harmonicSurge = TALENTS.HARMONIC_SURGE;
    const harmonicSurgeHealing = calculateSpellHealing(harmonicSurge, player);

    type AbilityDatum = {
        label: string;
        ancientTeachings: number;
        harmonicSurge: number;
        gom: number;
        chiJi: number;
        total: number;
    };
    const abilityData: AbilityDatum[] = [];
    
    abilityData.push({
        label: T(SPELLS.TIGER_PALM.name),
        ancientTeachings: tigerPalmHealing,
        harmonicSurge: 0,
        gom: 0,
        chiJi: 0,
        total: tigerPalmHealing
    });

    for (let stacks = 0; stacks <= totmMaxStacks; stacks++) {
        const breakdown = calculateBlackoutKickBreakdown(stacks);
        const total = breakdown.ancientTeachingsHealing + breakdown.normalGOMHealing + breakdown.chiJiGustHealing;
        abilityData.push({
            label: T(`BoK (${stacks} ToTM ${pluralize(stacks, "stack")})`),
            ancientTeachings: breakdown.ancientTeachingsHealing,
            harmonicSurge: 0,
            gom: breakdown.normalGOMHealing,
            chiJi: breakdown.chiJiGustHealing,
            total: total
        });
    }

    const rskTotal = risingSunKickAncientTeachingsHealing + risingSunKickNormalGOMHealing + risingSunKickChiJiGustHealing;
    abilityData.push({
        label: T(SPELLS.RISING_SUN_KICK.name),
        ancientTeachings: risingSunKickAncientTeachingsHealing,
        harmonicSurge: 0,
        gom: risingSunKickNormalGOMHealing,
        chiJi: risingSunKickChiJiGustHealing,
        total: rskTotal
    });

    for (let stacks = 1; stacks <= 6; stacks++) {
        const hsHealing = (harmonicSurgeHealing / intellect) * 100 * stacks;
        const total = hsHealing + tigerPalmHealing;
        abilityData.push({
            label: T(`HS (${stacks} ${pluralize(stacks, "stack")})`),
            ancientTeachings: tigerPalmHealing,
            harmonicSurge: hsHealing,
            gom: 0,
            chiJi: 0,
            total
        });
    }

    if (selectedTalents.get(TALENTS.JADE_EMPOWERMENT)) {
        jeSpellpowers.forEach((spellpower, index) => {
            abilityData.push({
                label: T(`JE (${index + 1} ${pluralize(index + 1, "Target")})`),
                ancientTeachings: spellpower,
                harmonicSurge: 0,
                gom: 0,
                chiJi: 0,
                total: spellpower
            });
        });
    }

    const sortedData = abilityData.sort((a, b) => a.total - b.total);
    const labels = sortedData.map(item => item.label);
    const ancientTeachingsData = sortedData.map(item => item.ancientTeachings);
    const harmonicSurgeData = sortedData.map(item => item.harmonicSurge);
    const normalGOMData = sortedData.map(item => item.gom);
    const chiJiGustData = sortedData.map(item => item.chiJi);

    const datasets = [
        {
            label: T(TALENTS.ANCIENT_TEACHINGS.name),
            data: ancientTeachingsData,
            backgroundColor: "rgba(255, 169, 32, 0.8)",
            borderColor: "rgba(255, 177, 51, 1)",
            borderWidth: 1,
        },
        {
            label: T(TALENTS.HARMONIC_SURGE.name),
            data: harmonicSurgeData,
            backgroundColor: "rgba(153, 102, 255, 0.8)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
        },
        {
            label: T(TALENTS.GUST_OF_MISTS.name),
            data: normalGOMData,
            backgroundColor: "rgba(118, 201, 167, 0.8)",
            borderColor: "rgba(118, 201, 167, 1)",
            borderWidth: 1,
        },
    ];

    if (includeChiJiGusts) {
        datasets.push({
            label: T(SPELLS.CHI_JI.name),
            data: chiJiGustData,
            backgroundColor: "rgba(216, 91, 38, 0.8)",
            borderColor: "rgba(216, 91, 38, 1)",
            borderWidth: 1,
        });
    }

    const chartData = {
        labels,
        datasets,
    };

    const chartOptions = {
        responsive: true,
        scales: {
            x: {
                stacked: true,
                title: {
                    display: true,
                    text: T("Abilities"),
                },
                grid: {
                    color: theme.custom.chart.gridColor,
                },
            },
            y: {
                stacked: true,
                title: {
                    display: true,
                    text: T("Spellpower (%)"),
                },
                beginAtZero: true,
                grid: {
                    color: theme.custom.chart.gridColor,
                },
            },
        },
        plugins: {
            tooltip: {
                mode: "index" as const,
                intersect: false,
                callbacks: {
                    label: (context: any) => {
                        const value = context.parsed.y.toFixed(2);
                        return ` ${context.dataset.label}: ${value}%`;
                    },
                    afterBody: (context: any) => {
                        const dataIndex = context[0].dataIndex;
                        let total = 0;
                        context.forEach((item: any) => {
                            total += item.parsed.y;
                        });
                        return [`${T("Total")}: ${total.toFixed(2)}%`];
                    }
                }
            },
            legend: {
                display: true,
                position: 'top' as const,
            },
        },
    };

    const handleTalentChange = (key: spell, checked: boolean) => {
        setSelectedTalents((prevTalents) => {
            const newTalents = new Map(prevTalents);
            newTalents.set(key, checked);
            return newTalents;
        });
    };

    return (
        <Container sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", justifyContent: "center" }}>
            <PageHeader
                title={title}
                subtitle={description}
            />

            <ConfigPanel
                sx={{ maxWidth: CONTENT_WIDTH.wide }}
                sections={[
                    {
                        key: "talents",
                        title: "talents",
                        summary: `${VISIBLE_TALENTS.filter(t => selectedTalents.get(t)).length} active`,
                        content: (
                            <Group>
                                <TalentsCard
                                    label="Talents"
                                    options={new Map(VISIBLE_TALENTS.map(t => [t, selectedTalents.get(t) ?? false]))}
                                    color={"#9966ff"}
                                    onChange={handleTalentChange}
                                />
                            </Group>
                        ),
                    },
                ]}
            />
            
            <Box sx={{ height: 600, width: "100%", display: "flex", justifyContent: "center" }}>
                <Bar data={chartData} options={chartOptions} />
            </Box>
        </Container>
    );
};

export default HarmonicSurge;
