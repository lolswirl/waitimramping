"use client";
import type React from "react";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Box, Container, useTheme } from "@mui/material";

import PageHeader from "@components/PageHeader/PageHeader";
import TalentsCard from "@components/TalentsCard/TalentsCard";
import HeroTalentsCard from "@components/TalentsCard/HeroTalentsCard";

import type spell from "@data/spells/spell";
import SPELLS from "@data/spells";
import TALENTS from "@data/specs/monk/mistweaver/talents";
import TIER from "@data/items/tier";
import { CLASSES } from "@data/class";
import {
  calculateAncientTeachingsHealing,
  calculateSpellDamage,
  calculateSpellHealing,
  type Player,
  type TalentMap,
} from "@data/specs/monk/mistweaver/calcs";

import { T } from "@util/T";
import StatsCard, { Group, statsSummary, type StatsCardOptions } from "@components/StatsCard/StatsCard";
import ConfigPanel from "@components/ConfigPanel/ConfigPanel";
import { CONTENT_WIDTH, FONT } from "@components/Theme/tokens";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type CalcMode = "totalHealing" | "healingPerTarget" | "damage" | "spellpower";

const modeOptions: { value: CalcMode; label: string}[] = [
  { value: "spellpower", label: "Spellpower %" },
  { value: "totalHealing", label: "Total Healing" },
  { value: "healingPerTarget", label: "Healing Per Target" },
  { value: "damage", label: "Raw Damage" },
];

const RushingWindKickComparison: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
  const theme = useTheme();
  const [calcMode, setCalcMode] = useState<CalcMode>("spellpower");

  const mistweaver = CLASSES.MONK.SPECS.MISTWEAVER;
  const defaultTalents = mistweaver.defaultTalents!;
  const defaultTierSet = mistweaver.tierSet!;

  const allTalents: TalentMap = new Map([
    ...defaultTalents.spec,
    ...defaultTalents.hero,
    ...defaultTalents.class,
    ...defaultTierSet,
  ]);

  const [talents, setTalents] = useState(allTalents);
  const [stats, setStats] = useState<StatsCardOptions>(mistweaver.stats);
  const player: Player = { stats, talents, corePassives: mistweaver.corePassives };

  const rsk = SPELLS.RISING_SUN_KICK;
  const rwk = TALENTS.RUSHING_WIND_KICK;

  const targetValues = Array.from({ length: 5 }, (_, i) => i + 1);

  const rskBaseDamage = calculateSpellDamage(rsk, player);
  const rskBaseHealing = calculateAncientTeachingsHealing(rskBaseDamage, player, true, rsk);

  const rwkBaseDamage = calculateSpellDamage(rwk, player);
  const rwkDirectHealing = calculateSpellHealing(rwk, player);
  const rwkMaxDamageTargets = rwk.effects.maxDamageTargets;
  const rwkMaxHealingTargets = rwk.targets.healing;
  const rwkDamageIncreasePerTarget = rwk.effects.damageIncrease;
  const rwkDamageHealing = calculateAncientTeachingsHealing(rwkBaseDamage * (1 + rwkDamageIncreasePerTarget), player, false, rwk);

  let rskValues: number[] = [];
  let rwkValues: number[] = [];
  let yAxisLabel = "";

  if (calcMode === "totalHealing") {
    rskValues = targetValues.map(targets => rskBaseHealing);
    
    rwkValues = targetValues.map(targets => {
      const effectiveTargets = Math.min(targets, rwkMaxHealingTargets);
      const directHealing = rwkDirectHealing * effectiveTargets;
      return directHealing + rwkDamageHealing;
    });

    yAxisLabel = T("Total Healing");
  } else if (calcMode === "healingPerTarget") {
    rskValues = targetValues.map(targets => {
      const effectiveTargets = Math.min(targets, 5);
      return rskBaseHealing / effectiveTargets;
    });

    rwkValues = targetValues.map(targets => {
      const effectiveTargets = Math.min(targets, rwkMaxHealingTargets);
      const directHealing = rwkDirectHealing * effectiveTargets;
      const totalHealing = directHealing + rwkDamageHealing;
      return totalHealing / targets;
    });
    
    yAxisLabel = T("Healing Per Target");
  } else if (calcMode === "damage") {
    rskValues = targetValues.map(targets => rskBaseDamage);

    rwkValues = targetValues.map(targets => {
      const effectiveTargets = Math.min(targets, rwkMaxDamageTargets);
      const damageBonus = 1 + (rwkDamageIncreasePerTarget * effectiveTargets);
      return rwkBaseDamage * damageBonus;
    });

    yAxisLabel = T("Raw Damage");
  } else if (calcMode === "spellpower") {
    rskValues = targetValues.map(targets => (rskBaseHealing / stats.intellect) * 100);

    rwkValues = targetValues.map(targets => {
      const effectiveTargets = Math.min(targets, rwkMaxHealingTargets);
      const directHealing = rwkDirectHealing * effectiveTargets;
      return ((directHealing + rwkDamageHealing) / stats.intellect) * 100;
    });

    yAxisLabel = T("Spellpower %");
  }

  const chartData = {
    labels: targetValues.map(value => `${value}`),
    datasets: [
      {
        label: T(rsk.name),
        data: rskValues,
        borderColor: "rgb(249, 85, 3)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        fill: false,
      },
      {
        label: T(rwk.name),
        data: rwkValues,
        borderColor: "rgb(185, 234, 246)",
        backgroundColor: "rgba(103, 178, 227, 0.2)",
        fill: false,
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
    },
    scales: {
      x: {
        title: {
          display: true,
          text: T("Target Count"),
        },
        grid: {
          color: theme.custom.chart.gridColor,
        },
      },
      y: {
        title: {
          display: true,
          text: yAxisLabel,
        },
        beginAtZero: true,
        grid: {
          color: theme.custom.chart.gridColor,
        },
      },
    },
  };

  const handleModeChange = (value: CalcMode) => {
    setCalcMode(value);
  };

  const handleTalentChange = (talent: spell, checked: boolean | number) => {
    setTalents(prev => new Map(prev).set(talent, checked));
  };

  const specTalentSubset: TalentMap = new Map(
    [TALENTS.SPIRITFONT, TALENTS.MORNING_BREEZE,].map(t => [t, talents.get(t) ?? false])
  );

  const heroTalentSubset = new Map<spell, boolean>(
    [TALENTS.YULONS_KNOWLEDGE, TALENTS.MEDITATIVE_FOCUS].map(t => [t, !!talents.get(t)])
  );

  const classTalentSubset: TalentMap = new Map(
    Array.from(defaultTalents.class, ([t]) => [t, talents.get(t) ?? false])
  );

  const tierSetSubset = new Map<spell, boolean>(
    [TIER.T36_MISTWEAVER_2SET].map(t => [t, !!talents.get(t)])
  );

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
            summary: statsSummary(stats, ["intellect", "mastery"]),
            content: <StatsCard options={stats} onOptionsChange={setStats} fields={["intellect", "mastery"]} spec={mistweaver} />,
          },
          {
            key: "mode",
            title: "mode",
            summary: (modeOptions.find(opt => opt.value === calcMode)?.label ?? "").toLowerCase(),
            content: (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {modeOptions.map(opt => {
                  const isSelected = opt.value === calcMode;
                  return (
                    <Box
                      key={opt.value}
                      onClick={() => handleModeChange(opt.value)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        border: `1px solid ${isSelected ? mistweaver.color + "55" : "rgba(255,255,255,0.08)"}`,
                        backgroundColor: isSelected ? mistweaver.color + "18" : "transparent",
                        opacity: isSelected ? 1 : 0.45,
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                        "&:hover": { transform: "scale(1.03)" },
                      }}
                    >
                      <span style={{ fontSize: FONT.micro, fontWeight: 500 }}>{T(opt.label)}</span>
                    </Box>
                  );
                })}
              </div>
            ),
          },
          {
            key: "talents",
            title: "talents",
            summary: `${[...talents.values()].filter(Boolean).length} active`,
            defaultOpen: true,
            content: (
              <Group>
                <TalentsCard
                  label="Spec"
                  options={specTalentSubset}
                  color={mistweaver.color}
                  onChange={handleTalentChange}
                  onRankChange={handleTalentChange}
                />
                <HeroTalentsCard
                  options={heroTalentSubset}
                  onChange={handleTalentChange}
                />
                <TalentsCard
                  label="Class"
                  options={classTalentSubset}
                  color={CLASSES.MONK.color}
                  onChange={handleTalentChange}
                  onRankChange={handleTalentChange}
                />
                {tierSetSubset.size > 0 && (
                  <div style={{ gridColumn: "1 / -1", height: 1, background: "rgba(255,255,255,0.12)" }} />
                )}
                {tierSetSubset.size > 0 && (
                  <TalentsCard
                    label="Tier"
                    options={tierSetSubset}
                    color={mistweaver.color}
                    onChange={handleTalentChange}
                  />
                )}
              </Group>
            ),
          },
        ]}
      />

      <Box sx={{ width: "100%", maxWidth: CONTENT_WIDTH.wide }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Container>
  );
};

export default RushingWindKickComparison;
