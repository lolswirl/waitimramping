"use client";
import type React from "react";
import { useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Box, Container, useTheme } from "@mui/material";

import PageHeader from "@components/PageHeader/PageHeader";
import TalentsCard from "@components/TalentsCard/TalentsCard";
import StatsCard, { Group, statsSummary, type StatsCardOptions } from "@components/StatsCard/StatsCard";
import ConfigPanel from "@components/ConfigPanel/ConfigPanel";
import { CONTENT_WIDTH } from "@components/Theme/tokens";

import type spell from "@data/spells/spell";
import TALENTS from "@data/specs/monk/mistweaver/talents";
import SHARED from "@data/specs/monk/talents";
import { CLASSES } from "@data/class";
import { calculateSheilunsGiftBreakdown } from "@data/specs/monk/mistweaver/calcs/SheilunsGift";
import type { TalentMap } from "@data/shared/engine";

import { T } from "@util/T";
import { pluralize } from "@util/stringManipulation";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SheilunsGiftBreakdown: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
  const theme = useTheme();
  
  const [selectedTalents, setSelectedTalents] = useState<TalentMap>(
    new Map<spell, boolean | number>([
      [TALENTS.INVIGORATING_MISTS, true],
      [TALENTS.WAY_OF_THE_SERPENT, false],
      [TALENTS.TEAR_OF_MORNING, false],
      [TALENTS.LEGACY_OF_WISDOM, true],
      [SHARED.CHI_PROFICIENCY, true],
    ])
  );

  const handleTalentChange = (talent: spell, checked: boolean | number) => {
  setSelectedTalents(prev => {
      const newMap = new Map(prev);
      newMap.set(talent, checked);
      return newMap;
    });
  };

  const mistweaver = CLASSES.MONK.SPECS.MISTWEAVER;

  const [options, setOptions] = useState<StatsCardOptions>({
    ...mistweaver.stats,
    totalHp: 99690,
  });

  const healingData = useMemo(() => {
    return calculateSheilunsGiftBreakdown({
      stats: options,
      talents: selectedTalents,
      corePassives: mistweaver.corePassives,
    });
  }, [options, selectedTalents]);

  const talentKey = Array.from(selectedTalents.entries())
    .map(([talent, enabled]) => `${talent.id}-${enabled}`)
    .join('_');

  const percentageChartData = useMemo(() => ({
    labels: healingData.map(data => 
      T(data.cloudCount + " " + pluralize(data.cloudCount, "Cloud"))
    ),
    datasets: [
      {
        label: T("Base Healing"),
        data: healingData.map(data => data.basePercent),
        backgroundColor: "rgba(255, 99, 132, 0.8)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
      {
        label: T("Cloud Healing"),
        data: healingData.map(data => data.cloudsPercent),
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  }), [healingData]);

  const percentageChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: T("Healing Distribution Percentage"),
        font: {
          size: 20,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: (context: any) => T(`${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`)
        }
      },
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: T("Cloud Count"),
        },
        grid: {
          color: theme.custom.chart.gridColor,
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: T("% of Total Heal"),
        },
        beginAtZero: true,
        max: 100,
        grid: {
          color: theme.custom.chart.gridColor,
        },
        ticks: {
          callback: (value: any) => value + '%'
        }
      },
    },
  }), [theme.custom.chart.gridColor]);

  const absoluteChartData = useMemo(() => ({
    labels: healingData.map(data => 
      T(data.cloudCount + " " + pluralize(data.cloudCount, "Cloud"))
    ),
    datasets: [
      {
        label: T("Main Target"),
        data: healingData.map(data => data.mainSpellpower),
        backgroundColor: "rgba(255, 99, 132, 0.8)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
      {
        label: T("Other Targets"),
        data: healingData.map(data => data.cloudsSpellpower),
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
      {
        label: T("Total Spellpower"),
        data: healingData.map(data => data.totalSpellpower),
        backgroundColor: "rgba(75, 192, 192, 0.8)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  }), [healingData]);

  const absoluteChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: T("Total Spellpower"),
        font: {
          size: 20,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: (context: any) => T(`${context.dataset.label}: ${context.parsed.y.toFixed(0)}% Spellpower`),
        }
      },
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: T("Cloud Count"),
        },
        grid: {
          color: theme.custom.chart.gridColor,
        },
      },
      y: {
        title: {
          display: true,
          text: T("Spellpower %"),
        },
        beginAtZero: true,
        grid: {
          color: theme.custom.chart.gridColor,
        },
      },
    },
  }), [theme.custom.chart.gridColor]);

  return (
    <Container sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", justifyContent: "center" }}>
      <PageHeader
        title={title}
        subtitle={description}
      />

      <ConfigPanel
        sx={{ maxWidth: CONTENT_WIDTH.wide }}
        accent={mistweaver.color}
        sections={[
          {
            key: "stats",
            title: "stats",
            summary: statsSummary(options),
            content: <StatsCard options={options} onOptionsChange={setOptions} spec={mistweaver} />,
          },
          {
            key: "talents",
            title: "talents",
            summary: `${[...selectedTalents.values()].filter(Boolean).length} active`,
            defaultOpen: true,
            content: (
              <Group>
                <TalentsCard
                  label="Talents"
                  options={selectedTalents}
                  color={mistweaver.color}
                  onChange={handleTalentChange}
                  onRankChange={handleTalentChange}
                />
              </Group>
            ),
          },
        ]}
      />

      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ height: 500, width: "100%" }}>
          <Bar
            key={`absolute-${talentKey}`}
            data={absoluteChartData} 
            options={absoluteChartOptions}
            redraw={true}
          />
        </Box>
      </Box>

      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ height: 500, width: "100%" }}>
          <Bar
            key={`percentage-${talentKey}`}
            data={percentageChartData} 
            options={percentageChartOptions}
            redraw={true}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default SheilunsGiftBreakdown;
