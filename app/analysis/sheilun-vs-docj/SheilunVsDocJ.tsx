"use client";
import type React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Box, Container, useTheme } from "@mui/material";

import PageHeader from "@components/PageHeader/PageHeader";

import type spell from "@data/spells/spell";
import SPELLS from "@data/spells";
import TALENTS from "@data/specs/monk/mistweaver/talents";
import { calculateSpellDamage, calculateWayOfTheCraneHealing, type Player } from "@data/specs/monk/mistweaver/calcs";
import { CLASSES } from "@data/class";
import { calculateSheilunsGiftBreakdown } from "@data/specs/monk/mistweaver/calcs/SheilunsGift";

import { T } from "@util/T";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SheilunVsDocJ: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
  const theme = useTheme();

  const mistweaver = CLASSES.MONK.SPECS.MISTWEAVER;
  const player: Player = {
    stats: mistweaver.stats,
    talents: new Map<spell, boolean>([
      [TALENTS.LEGACY_OF_WISDOM, true],
      [TALENTS.INVIGORATING_MISTS, true],
    ]),
    corePassives: mistweaver.corePassives,
  };

  const sheilunData = calculateSheilunsGiftBreakdown(player);

  // docj calcs
  const sck = SPELLS.SPINNING_CRANE_KICK;
  const danceofChijiIncrease = TALENTS.DANCE_OF_CHI_JI.effects.spellpowerIncrease;

  const docjSpellpowerCalc = () => {
    const sckDamage = calculateSpellDamage(sck, player) * (danceofChijiIncrease / 100);
    const healing = calculateWayOfTheCraneHealing(sckDamage);
    return (healing / player.stats.intellect) * 100;
  };
  const docjValues = Array.from({ length: 10 }, (_, i) => i + 1);
  const docjSpellpowers = docjValues.map(targets =>
    targets <= 5
      ? docjSpellpowerCalc() * targets
      : docjSpellpowerCalc() * targets * Math.sqrt(5 / targets)
  );

  const allAbilities = [
    ...sheilunData.map((data, index) => ({
      label: T(data.cloudCount === 0 ? "SG Main Only" : `SG Main + ${data.cloudCount} Cloud${data.cloudCount > 1 ? 's' : ''}`),
      value: data.mainSpellpower,
      type: 'sheilun'
    })),
    ...docjValues.map((value, index) => ({
      label: T(`DocJ (${value} Target${value > 1 ? 's' : ''})`),
      value: docjSpellpowers[index],
      type: 'docj'
    }))
  ];

  const sortedAbilities = allAbilities.sort((a, b) => a.value - b.value);

  const getColor = (type: string) => {
    if (type === 'sheilun') return { bg: "rgba(255, 99, 132, 0.8)", border: "rgba(255, 99, 132, 1)" };
    return { bg: "rgba(62, 172, 37, 0.8)", border: "rgba(62, 172, 37, 1)" };
  };

  const chartData = {
    labels: sortedAbilities.map(ability => ability.label),
    datasets: [
      {
        label: T("Spellpower"),
        data: sortedAbilities.map(ability => ability.value),
        backgroundColor: sortedAbilities.map(ability => getColor(ability.type).bg),
        borderColor: sortedAbilities.map(ability => getColor(ability.type).border),
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
      legend: {
        display: false,
        position: 'top' as const,
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
      },
    },
  };

  return (
    <Container sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", justifyContent: "center" }}>
      <PageHeader
        title={title}
        subtitle={description}
      />
      <Box sx={{ height: 600, width: "100%", display: "flex", justifyContent: "center" }}>
        <Bar data={chartData} options={chartOptions} />
      </Box>
    </Container>
  );
};

export default SheilunVsDocJ;
