"use client";
import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Box, Container, Divider, useTheme, Card, Typography, Tab, Tabs, Skeleton } from "@mui/material";
import { Refresh, EmojiEvents } from "@mui/icons-material";
import SwirlButton from "@components/Buttons/SwirlButton";

import PageHeader from "@components/PageHeader/PageHeader";
import SpellButton from "@components/SpellButtons/SpellButton";
import TalentsCard from "@components/TalentsCard/TalentsCard";
import HeroTalentsCard from "@components/TalentsCard/HeroTalentsCard";
import StatsCard, { Group, statsSummary, type StatsCardOptions } from "@components/StatsCard/StatsCard";
import { FieldCells, type FieldDef } from "@components/FieldCells/FieldCells";
import ConfigPanel from "@components/ConfigPanel/ConfigPanel";
import { CONTENT_WIDTH, ICON } from "@components/Theme/tokens";

import type spell from "@data/spells/spell";
import SPELLS from "@data/spells";
import TALENTS from "@data/specs/monk/mistweaver/talents";
import SHARED from "@data/specs/monk/talents";
import { CLASSES } from "@data/class";

import { T } from "@util/T";
import { formatNumber } from "@util/stringManipulation";
import SwirlChip from "@components/SwirlChip/SwirlChip";

import type { TalentMap } from "@data/shared/engine";
import type { ModelResult } from "./model";
import { buildRotationConfigs, getBackgroundColor, getBorderColor, getCardBg } from "./types";
import BreakdownCard from "./BreakdownCard";
import HeatmapCard from "./HeatmapCard";
import ComboRankCard from "./ComboRankCard";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Options = { timeSpent: number; targetCount: number };

const TARGET_WINDOW = 10;
const SWEEP_TIME = 500;

const OPTIONS_FIELDS: FieldDef[] = [
  { key: 'timeSpent', label: 'time', min: 1, adornment: "sec", },
  { key: 'targetCount', label: 'targets', min: 1, stepper: true },
];

const DamageComparison: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [timeSpent, setTimeSpent] = useState(60);
  const [targetCount, setTargetCount] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [rerollKey, setRerollKey] = useState(0);
  const showAsHealing = activeTab === 0;
  const [damageData, setDamageData] = useState<Record<string, ModelResult>>({});

  const mistweaver = CLASSES.MONK.SPECS.MISTWEAVER;

  const [specTalents, setSpecTalents] = useState<Map<spell, boolean>>(new Map<spell, boolean>([
    [TALENTS.JADEFIRE_TEACHINGS, true],
    [TALENTS.RUSHING_WIND_KICK, false],
    [TALENTS.WAY_OF_THE_CRANE, true],
    [TALENTS.SPIRITFONT, false], // haha lol not used
    [TALENTS.MORNING_BREEZE, true], // used in keys woo
    [TALENTS.JADE_EMPOWERMENT, false],
  ]));

  const [heroTalents, setHeroTalents] = useState<Map<spell, boolean>>(new Map<spell, boolean>([
    [TALENTS.TEMPLE_TRAINING, true], // bugged sck increase
    [TALENTS.YULONS_KNOWLEDGE, true], // just gonna assume this one since its in keys
    [TALENTS.MEDITATIVE_FOCUS, false],
    [TALENTS.HARMONIC_SURGE, false],
  ]));

  const [classTalents, setClassTalents] = useState<TalentMap>(new Map<spell, boolean>([
    [SHARED.FAST_FEET, true],
    [SHARED.FEROCITY_OF_XUEN, true],
    [SHARED.CHI_PROFICIENCY, true],
    [SHARED.MARTIAL_INSTINCTS, true],
  ]));

  const [tierSet, setTierSet] = useState<Map<spell, boolean>>(mistweaver.tierSet ?? new Map<spell, boolean>());

  const [stats, setStats] = useState<StatsCardOptions>({ ...mistweaver.stats });

  const talents = useMemo((): TalentMap => new Map([...specTalents, ...classTalents, ...heroTalents, ...tierSet]), [specTalents, classTalents, heroTalents, tierSet]);

  const spellById = useMemo<Map<number, spell>>(() => {
    const all: spell[] = [
      ...Object.values(SPELLS),
      ...Object.values(TALENTS),
      ...Object.values(SHARED),
    ];
    return new Map(all.map(s => [s.id, s]));
  }, []);

  const player = useMemo(() => ({ talents, stats, corePassives: mistweaver.corePassives }), [talents, stats, mistweaver.corePassives]);

  const useRwk = talents.get(TALENTS.RUSHING_WIND_KICK) === true;

  const useJe = talents.get(TALENTS.JADE_EMPOWERMENT) === true;
  const ROTATION_CONFIGS = useMemo(
    () => buildRotationConfigs(useRwk, talents),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [useRwk, useJe]
  );

  useEffect(() => {
    setDamageData(
      Object.fromEntries(
        ROTATION_CONFIGS.map(c => [c.dataKey, c.modelFn(timeSpent, targetCount, showAsHealing, player)])
      )
    );
  }, [timeSpent, targetCount, showAsHealing, player, rerollKey, ROTATION_CONFIGS]);

  const handleOptionsChange = (updater: (prev: Options) => Options) => {
    const next = updater({ timeSpent, targetCount });
    setTimeSpent(next.timeSpent);
    setTargetCount(next.targetCount);
  };

  const targetRange = useMemo(() => {
    const end = Math.max(TARGET_WINDOW, targetCount);
    return Array.from({ length: TARGET_WINDOW }, (_, i) => end - TARGET_WINDOW + 1 + i);
  }, [targetCount]);

  const targetSweep = useMemo(
    () => targetRange.map(targets => ROTATION_CONFIGS.map(config => {
      const result = config.modelFn(SWEEP_TIME, targets, showAsHealing, player);
      return result.points.length > 0 ? result.points[result.points.length - 1].damage / SWEEP_TIME : 0;
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetRange, ROTATION_CONFIGS, showAsHealing, player, rerollKey]
  );

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: { mode: "index" as const, intersect: false },
    },
    scales: {
      x: {
        title: { display: true, text: T("Targets") },
        grid: {
          color: theme.custom.chart.gridColor,
        },
      },
      y: {
        title: { display: true, text: T(showAsHealing ? "HPS" : "DPS") },
        beginAtZero: true,
        grid: {
          color: theme.custom.chart.gridColor,
        },
      },
    },
  };

  const chartData = {
    labels: targetRange,
    datasets: ROTATION_CONFIGS.map((config, idx) => ({
      label: T(config.label),
      data: targetSweep.map(values => values[idx]),
      borderColor: config.color,
      backgroundColor: getBackgroundColor(config.color),
      fill: false,
      // only the selected target count carries a visible point
      pointRadius: targetRange.map(targets => targets === targetCount ? 6 : 0),
      pointHoverRadius: 6,
    }))
  };

  if (!mounted) return (
    <Container sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", justifyContent: "center" }}>
      <PageHeader title={title} subtitle={description} marginBottom={0} />
      {/* controls card */}
      <Card variant="outlined" sx={{ width: "100%", maxWidth: CONTENT_WIDTH.wide, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
          <Skeleton variant="rounded" width={160} height={40} />
          <Skeleton variant="rounded" width={100} height={40} />
          <Skeleton variant="rounded" width={140} height={40} />
        </Box>
        <Divider />
        <Box sx={{ pt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Skeleton variant="rounded" width={180} height={80} />
          <Skeleton variant="rounded" width={180} height={80} />
          <Skeleton variant="rounded" width={180} height={80} />
        </Box>
      </Card>
      {/* stat cards + chart */}
      <Card variant="outlined" sx={{ width: "100%", maxWidth: CONTENT_WIDTH.wide, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          {[...Array(5)].map((_, i) => <Skeleton key={i} variant="rounded" sx={{ flex: '1 1 140px' }} height={80} />)}
        </Box>
        <Skeleton variant="rounded" width="100%" height={500} />
      </Card>
      {/* heatmap */}
      <Card variant="outlined" sx={{ width: "100%", maxWidth: CONTENT_WIDTH.wide, p: 2 }}>
        <Skeleton variant="rounded" width="100%" height={320} />
      </Card>
    </Container>
  );

  return (
    <Container sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", justifyContent: "center" }}>
      <PageHeader title={title} subtitle={description} marginBottom={0} />
      <Box sx={{ width: "100%", maxWidth: CONTENT_WIDTH.wide }}>
        <ConfigPanel
          accent={mistweaver.color}
          sections={[
            {
              key: "options",
              title: "options",
              summary: `${timeSpent}s, ${targetCount} ${targetCount === 1 ? "target" : "targets"}`,
              content: (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <FieldCells
                    fields={OPTIONS_FIELDS}
                    options={{ timeSpent, targetCount }}
                    onOptionsChange={handleOptionsChange}
                  />
                  <SwirlButton
                    color="success"
                    onClick={() => setRerollKey(k => k + 1)}
                    startIcon={<Refresh />}
                  >
                    Re-formulate
                  </SwirlButton>
                  <Box sx={{ flexGrow: 1 }} />
                  <SwirlChip message="Values may slightly shift due to the RNG of Rising Sun Kick resets" showIcon borderColor="#ffa726" />
                </Box>
              ),
            },
            {
              key: "stats",
              title: "stats",
              summary: statsSummary(stats),
              content: (
                <Group>
                  <StatsCard options={stats} onOptionsChange={setStats} spec={mistweaver} />
                </Group>
              ),
            },
            {
              key: "talents",
              title: "talents",
              summary: `${[...specTalents.values(), ...heroTalents.values(), ...classTalents.values(), ...tierSet.values()].filter(Boolean).length} active`,
              content: (
                <Group>
                  <TalentsCard label="Spec" options={specTalents} color={mistweaver.color} onChange={(t, c) => setSpecTalents(prev => new Map(prev).set(t, c))} />
                  <HeroTalentsCard label="Hero" options={heroTalents} onChange={(t, c) => setHeroTalents(prev => new Map(prev).set(t, c))} />
                  <TalentsCard label="Class" options={classTalents} color={CLASSES.MONK.color} onChange={(t, c) => setClassTalents(prev => new Map(prev).set(t, c))} onRankChange={(t, r) => setClassTalents(prev => new Map(prev).set(t, r))} />
                  {tierSet.size > 0 && (
                    <>
                      <div style={{ gridColumn: "1 / -1", height: 1, background: "rgba(255,255,255,0.12)" }} />
                      <TalentsCard label="Tier" options={tierSet} color={mistweaver.color} onChange={(t, c) => setTierSet(prev => new Map(prev).set(t, c))} />
                    </>
                  )}
                </Group>
              ),
            },
          ]}
        />
      </Box>

      <Card variant="outlined" sx={{ width: "100%", maxWidth: CONTENT_WIDTH.wide }}>
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label={"HPS"} />
            <Tab label={"DPS"} />
          </Tabs>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {timeSpent}s, {targetCount} target{targetCount !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {(() => {
              const avgs = ROTATION_CONFIGS.map(config => {
                const result = damageData[config.dataKey];
                return result && result.points.length > 0 ? result.points[result.points.length - 1].damage / timeSpent : 0;
              });
              const bestAvg = Math.max(...avgs);
              return ROTATION_CONFIGS.map((config, idx) => {
                const avg = avgs[idx];
                const isBest = avg === bestAvg && bestAvg > 0;
                return (
                  <Card key={config.dataKey} variant="outlined" sx={{
                    flex: '1 1 140px',
                    px: 1.5,
                    py: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    position: 'relative',
                    borderColor: getBorderColor(config.color),
                    background: getCardBg(config.color),
                  }}>
                    {isBest && (
                      <EmojiEvents sx={{ position: 'absolute', top: 8, right: 8, fontSize: 16, color: '#facc15' }} />
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {config.spells.map((s, i) => (
                        <SpellButton key={i} selectedSpell={s} size={ICON.sm} />
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {config.label}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: config.color, lineHeight: 1.2 }}>
                        {formatNumber(avg, 2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {showAsHealing ? 'HPS' : 'DPS'}
                      </Typography>
                    </Box>
                  </Card>
                );
              });
            })()}
          </Box>
          <Divider/>
          <Box sx={{ height: "500px", width: "100%" }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
          <BreakdownCard
            rotationConfigs={ROTATION_CONFIGS}
            damageData={damageData}
            showAsHealing={showAsHealing}
            timeSpent={timeSpent}
          />
        </Box>
      </Card>

      <HeatmapCard
        rotationConfigs={ROTATION_CONFIGS}
        player={player}
        rerollKey={rerollKey}
        showAsHealing={showAsHealing}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ComboRankCard
        targetCount={targetCount}
        spellById={spellById}
      />
    </Container>
  );
};

export default DamageComparison;
