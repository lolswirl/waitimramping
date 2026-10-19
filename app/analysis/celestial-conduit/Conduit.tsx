"use client";
import type React from "react";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Box, Container, useTheme } from "@mui/material";

import PageHeader from "@components/PageHeader/PageHeader";
import TalentsCard from "@components/TalentsCard/TalentsCard";
import ConfigPanel from "@components/ConfigPanel/ConfigPanel";
import { Group } from "@components/StatsCard/StatsCard";
import { CONTENT_WIDTH } from "@components/Theme/tokens";
import type spell from "@data/spells/spell";
import { calcSpellpower } from "@data/spells/spell";
import SPELLS from "@data/spells";
import TALENTS from "@data/specs/monk/mistweaver/talents";
import { CLASSES } from "@data/class";
import { calculateSpellHealing, calculateAncientTeachingsData, type Player } from "@data/specs/monk/mistweaver/calcs";
import { T } from "@util/T";
import { pluralize } from "@util/stringManipulation";

import calculateUnityWithin from "./UnityWithin";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Conduit: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({
    title,
    description,
}) => {
    const theme = useTheme();

    const [selectedTalents, setSelectedTalents] = useState(
        new Map<spell, boolean>([
            [TALENTS.UNITY_WITHIN, true],
            [SPELLS.SHEILUNS_GIFT, false],
            [TALENTS.LEGACY_OF_WISDOM, false],
            [TALENTS.EMPERORS_FAVOR, false],
            [TALENTS.JADE_EMPOWERMENT, false],
        ])
    );

    const colorMap = {
        jade: {
            backgroundColor: "rgba(54, 162, 235, 0.8)",
            borderColor: "rgba(54, 162, 235, 1)",
        },
        sheilun: {
            backgroundColor: "rgba(255, 99, 132, 0.8)",
            borderColor: "rgba(255, 99, 132, 1)",
        },
        conduit: {
            backgroundColor: "rgba(75, 192, 192, 0.8)",
            borderColor: "rgba(75, 192, 192, 1)",
        },
        unity: {
            backgroundColor: "rgba(250, 247, 153, 0.8)",
            borderColor: "rgba(250, 247, 153, 1)",
        },
    };

    const mistweaver = CLASSES.MONK.SPECS.MISTWEAVER;
    const intellect = mistweaver.stats.intellect;
    const player: Player = { stats: mistweaver.stats, talents: selectedTalents, corePassives: mistweaver.corePassives };

    const celestialConduit = SPELLS.CELESTIAL_CONDUIT;
    const conduitValues = Array.from(
        { length: celestialConduit.effects?.maxTargets },
        (_, i) => i + 1
    );

    const conduitSpellpower = celestialConduit.coeff.healing * 100;
    const fallingStarTalent = TALENTS.PATH_OF_THE_FALLING_STAR;
    const conduitSpellpowerCalc = (targets: number) => {
        const bonus = Math.max(0, fallingStarTalent.effects.singleTargetBonus - (targets - 1) * fallingStarTalent.effects.reductionPerTarget);
        return conduitSpellpower * (1 + bonus);
    };
    const conduitSpellpowers = conduitValues.map(conduitSpellpowerCalc);

    const unityWithinSpellpowerCalc = (targets: number) =>
        selectedTalents.get(TALENTS.UNITY_WITHIN)
            ? calculateUnityWithin(
                  targets,
                  selectedTalents.get(TALENTS.UNITY_WITHIN)!,
              ).spellpower * 100
            : 0;
    const unityWithinSpellpowers = conduitValues.map(unityWithinSpellpowerCalc);

    // Sheilun's Gift calculations
    const sheilunsGift = SPELLS.SHEILUNS_GIFT;
    const sheilunBaseHealing = calculateSpellHealing(sheilunsGift, player);
    const sheilunHealingPerStack = sheilunBaseHealing * sheilunsGift.effects.coeffPerStack;
    const sheilunMaxStacks = sheilunsGift.maxStacks;
    const sheilunMainTargetIncrease = TALENTS.INVIGORATING_MISTS.effects?.sheilunsMainTargetIncrease;

    const legacyOfWisdom = TALENTS.LEGACY_OF_WISDOM;
    const emperorsFavor = TALENTS.EMPERORS_FAVOR;

    const sheilunTargetsHit =
        (selectedTalents.get(legacyOfWisdom) && legacyOfWisdom.effects?.targetsHit) ||
        (selectedTalents.get(emperorsFavor) && emperorsFavor.effects?.targetsHit) ||
        sheilunsGift.targets;

    const calculateSheilunSpellpower = (stacks: number) => {
        const healingPerTarget = sheilunBaseHealing + (sheilunHealingPerStack * stacks);
        
        const mainTargetHealing = healingPerTarget * (1 + sheilunMainTargetIncrease);
        
        const emperorsFavorMultiplier = selectedTalents.get(emperorsFavor)
            ? emperorsFavor.effects?.increase
            : 1;
        
        const finalMainTargetHealing = mainTargetHealing * emperorsFavorMultiplier;
        const otherTargetsHealing = healingPerTarget * (sheilunTargetsHit - 1);
        
        const totalHealing = finalMainTargetHealing + otherTargetsHealing;
        
        return calcSpellpower(totalHealing, intellect);
    };

    const cjlHealing = calculateAncientTeachingsData(SPELLS.CRACKLING_JADE_LIGHTNING, player).healing;
    const cjlSpCoeff = (cjlHealing / intellect) * 100;

    const jadeEmpowerment = TALENTS.JADE_EMPOWERMENT;
    const jadeEmpowermentIncrease = jadeEmpowerment.effects?.spellpowerIncrease / 100;
    const jadeEmpowermentChain =
        jadeEmpowermentIncrease * jadeEmpowerment.effects?.chainVal;

    const jeSpellpowerCalc = (value: number) => cjlSpCoeff * value;
    const jeValues = Array.from(
        { length: 5 },
        (_, i) => jadeEmpowermentIncrease + i * jadeEmpowermentChain
    );
    const jeSpellpowers = jeValues.map((value) => jeSpellpowerCalc(value));

    const xValues = Array.from({ length: sheilunMaxStacks + 1 }, (_, i) => i);
    const sheilunSpellpowers = xValues.map((stacks) => 
        calculateSheilunSpellpower(stacks)
    );

    const allAbilities = [
        ...conduitValues.map((value, index) => ({
            label: T(`CC ${value} ` + pluralize(value, "Target")),
            conduitValue: conduitSpellpowers[index],
            unityValue: unityWithinSpellpowers[index],
            totalValue:
                conduitSpellpowers[index] + unityWithinSpellpowers[index],
            type: "conduit" as const,
        })),
        ...(selectedTalents.get(SPELLS.SHEILUNS_GIFT)
            ? xValues.map((value, index) => ({
                  label: T(`SG ${value} ` + pluralize(value, "Stack")),
                  totalValue: sheilunSpellpowers[index],
                  type: "sheilun" as const,
              }))
            : []),
        ...(selectedTalents.get(TALENTS.JADE_EMPOWERMENT)
            ? jeValues.map((_, index) => ({
                  label: T(
                      `JE ${index + 1} ` + pluralize(index + 1, "Target")
                  ),
                  totalValue: jeSpellpowers[index],
                  type: "jade" as const,
              }))
            : []),
    ];

    const sortedAbilities = allAbilities.sort(
        (a, b) => a.totalValue - b.totalValue
    );

    const chartData = {
        labels: sortedAbilities.map((ability) => ability.label),
        datasets: [
            {
                label: T(" Spellpower"),
                data: sortedAbilities.map((ability) =>
                    ability.type === "conduit"
                        ? ability.conduitValue
                        : ability.totalValue
                ),
                backgroundColor: sortedAbilities.map(
                    (ability) =>
                        colorMap[ability.type as keyof typeof colorMap]
                            .backgroundColor
                ),
                borderColor: sortedAbilities.map(
                    (ability) =>
                        colorMap[ability.type as keyof typeof colorMap]
                            .borderColor
                ),
                borderWidth: 2,
            },
            ...(selectedTalents.get(TALENTS.UNITY_WITHIN)
                ? [
                      {
                          label: T(" Unity Within"),
                          data: sortedAbilities.map((ability) =>
                              ability.type === "conduit"
                                  ? ability.unityValue
                                  : 0
                          ),
                          backgroundColor: colorMap.unity.backgroundColor,
                          borderColor: colorMap.unity.borderColor,
                          borderWidth: 2,
                      },
                  ]
                : []),
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            tooltip: {
                mode: "index" as const,
                intersect: false,
                callbacks: {
                    afterBody: (context: any) => {
                        // fill in total sp% for conduit + unity within
                        const index = context[0].dataIndex;
                        const ability = sortedAbilities[index];

                        if (
                            ability.type === "conduit" &&
                            ability.unityValue > 0
                        ) {
                            return T(
                                `Total: ${ability.totalValue.toFixed(1)}%`
                            );
                        }

                        return [];
                    },
                    label: (context: any) => {
                        // dont show unity within tooltip value if its not conduit!!!
                        const ability = sortedAbilities[context.dataIndex];

                        if (
                            context.dataset.label.includes(
                                T("Unity Within")
                            ) &&
                            ability.type !== "conduit"
                        ) {
                            return [];
                        }

                        return `${
                            context.dataset.label
                        }: ${context.parsed.y.toFixed(1)}%`;
                    },
                },
            },
            legend: {
                display: false,
                position: "top" as const,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: T("Abilities"),
                },
                grid: {
                    color: theme.custom.chart.gridColor,
                },
                stacked: true,
            },
            y: {
                title: {
                    display: true,
                    text: T("Spellpower"),
                },
                beginAtZero: true,
                grid: {
                    color: theme.custom.chart.gridColor,
                },
                stacked: true,
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
        <Container
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <PageHeader title={title} subtitle={description} />
            <ConfigPanel
                sx={{ maxWidth: CONTENT_WIDTH.wide }}
                sections={[
                    {
                        key: "talents",
                        title: "talents",
                        summary: `${[...selectedTalents.values()].filter(Boolean).length} active`,
                        content: (
                            <Group>
                                <TalentsCard
                                    label="Talents"
                                    options={selectedTalents}
                                    color={"#4bc0c0"}
                                    onChange={handleTalentChange}
                                />
                            </Group>
                        ),
                    },
                ]}
            />
            <Box
                sx={{
                    height: 600,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Bar data={chartData} options={chartOptions} />
            </Box>
        </Container>
    );
};

export default Conduit;
