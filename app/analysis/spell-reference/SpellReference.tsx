"use client";
import React, { useCallback, useState, useMemo, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { GlassTooltip } from "@components/Glass";
import SwirlTable, { type SwirlColumn } from "@components/SwirlTable/SwirlTable";

import PageHeader from "@components/PageHeader/PageHeader";
import StatsCard, { Group, statsSummary, type StatsCardOptions } from "@components/StatsCard/StatsCard";
import ConfigPanel from "@components/ConfigPanel/ConfigPanel";
import { CONTENT_WIDTH, FONT, HAIRLINE, ICON, RADIUS } from "@components/Theme/tokens";
import { SearchChip, SelectChip, SpecChip } from "@components/FilterChips/FilterChips";

import type spell from "@data/spells/spell";
import { CATEGORY, CATEGORY_COLORS, calculateCastTime } from "@data/spells/spell";
import { formatNumber, formatPercent } from "@util/stringManipulation";
import type { specialization } from "@data/class";
import { useSpec } from "@context/SpecContext";
import { type Player, type SpellModifier, type TalentMap, isTalentEnabled } from "@data/shared/engine";
import { getSpecEngine } from "@data/shared/specEngines";
import type { HeroTree } from "@data/heroTalents";
import TalentsCard from "@components/TalentsCard/TalentsCard";
import HeroTalentsCard from "@components/TalentsCard/HeroTalentsCard";

import SpellButton from "@components/SpellButtons/SpellButton";


type SpellRow = {
  spell: spell;
  type: SpellType;
  baseSpCoeff: number | null;
  spCoeff: number | null;
  absolute: number | null;
  modifiers?: SpellModifier[];
  targets: number;
  available: boolean;
};

type SpellType = typeof CATEGORY.DAMAGE | typeof CATEGORY.HEALING;

const ALL_TYPES = "All";

const coeffTypes = (s: spell): SpellType[] => {
  if (s.formula !== undefined) {
    return [s.category === CATEGORY.DAMAGE ? CATEGORY.DAMAGE : CATEGORY.HEALING];
  }
  if (s.coeff === undefined) {
    const types: SpellType[] = [];
    if (s.value?.damage !== undefined) types.push(CATEGORY.DAMAGE);
    if (s.value?.healing !== undefined) types.push(CATEGORY.HEALING);
    return types;
  }
  if (typeof s.coeff === "number") {
    return [s.category === CATEGORY.DAMAGE ? CATEGORY.DAMAGE : CATEGORY.HEALING];
  }
  const types: SpellType[] = [];
  if (s.coeff.damage !== undefined) types.push(CATEGORY.DAMAGE);
  if (s.coeff.healing !== undefined) types.push(CATEGORY.HEALING);
  return types;
};

const getRawCoeff = (s: spell, type: SpellType): number | null => {
  if (s.coeff === undefined) return null;
  if (typeof s.coeff === "number") return s.coeff;
  return (type === CATEGORY.DAMAGE ? s.coeff.damage : s.coeff.healing) ?? null;
};

const resolveValue = (
  s: spell,
  type: SpellType,
  player: Player,
  specKey: string,
  targetMultiplier = 1,
): { baseSpCoeff: number | null; spCoeff: number | null; absolute: number | null; modifiers?: SpellModifier[] } => {
  const engine = getSpecEngine(specKey);

  const overridden = engine?.resolveSpellValue?.(s, player);
  if (overridden !== null && overridden !== undefined) {
    const absolute = overridden * targetMultiplier;
    const spCoeff = (absolute / player.stats.intellect) * 100;
    const modifiers = engine?.getSpellModifiers?.(s, player, type === CATEGORY.DAMAGE ? "damage" : "healing");
    if (modifiers?.length) {
      // no datamined coeff here, so derive the base by backing the modifiers out
      const totalMultiplier = modifiers.reduce((acc, m) => acc * m.multiplier, 1);
      return { baseSpCoeff: spCoeff / totalMultiplier, spCoeff, absolute, modifiers };
    }
    return { baseSpCoeff: null, spCoeff, absolute };
  }

  if (s.formula !== undefined) {
    const absolute = s.formula(player.stats) * targetMultiplier;
    return { baseSpCoeff: null, spCoeff: (absolute / player.stats.intellect) * 100, absolute };
  }

  if (s.coeff !== undefined && engine !== undefined) {
    const absolute = (type === CATEGORY.DAMAGE
      ? engine.calculateSpellDamage(s, player)
      : engine.calculateSpellHealing(s, player)) * targetMultiplier;
    const rawCoeff = getRawCoeff(s, type);
    return {
      baseSpCoeff: rawCoeff !== null ? rawCoeff * 100 * targetMultiplier : null,
      spCoeff: (absolute / player.stats.intellect) * 100,
      absolute,
      modifiers: engine.getSpellModifiers?.(s, player, type === CATEGORY.DAMAGE ? "damage" : "healing"),
    };
  }

  return { baseSpCoeff: null, spCoeff: null, absolute: null };
};

const hasValue = (s: spell) =>
  s.coeff !== undefined || s.formula !== undefined || s.value?.damage !== undefined || s.value?.healing !== undefined;

const getMaxTargets = (s: spell, type: SpellType): number => {
  const th = s.targets;
  if (!th) return 1;
  if (typeof th === "number") return th;
  return (type === CATEGORY.DAMAGE ? th.damage : th.healing) ?? 1;
};

const isAvailable = (s: spell, talents: TalentMap, activeTrees: Set<HeroTree>): boolean => {
  if (talents.has(s) && !isTalentEnabled(talents, s)) return false;
  if (s.heroTalent && activeTrees.size > 0 && !activeTrees.has(s.heroTalent)) return false;
  return true;
};

const expandRows = (s: spell, player: Player, specKey: string, activeTrees: Set<HeroTree>): SpellRow[] =>
  coeffTypes(s).map(type => {
    const targets = getMaxTargets(s, type);
    const resolved = resolveValue(s, type, player, specKey, targets);
    return {
      spell: s,
      type,
      targets,
      ...resolved,
      available: isAvailable(s, player.talents, activeTrees),
    };
  });

const spellName = (s: spell) => s.display?.name ?? s.name;

const rowTags = (row: SpellRow): string[] => {
  const tags: string[] = [];
  if (row.spell.periodic) tags.push(row.type === CATEGORY.DAMAGE ? "DoT" : "HoT");
  if (row.targets > 1) tags.push(`${row.targets} targets`);
  if (!row.available) tags.push("not talented");
  return tags;
};

const numeric = { fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" };

const formatMultiplier = (multiplier: number) => `×${parseFloat(multiplier.toFixed(3))}`;

const tooltipRule = <Box sx={{ gridColumn: "1 / -1", height: "1px", backgroundColor: HAIRLINE, my: 0.25 }} />;

const dash = <Typography variant="body2" color="text.disabled">—</Typography>;

const EmptyMessage: React.FC<{ message: string; hint: string }> = ({ message, hint }) => (
  <Box sx={{
    width: "100%",
    maxWidth: CONTENT_WIDTH.wide,
    py: 4,
    textAlign: "center",
    border: `1px dashed ${HAIRLINE}`,
    borderRadius: `${RADIUS.card}px`,
  }}>
    <Typography variant="body2">{message}</Typography>
    <Typography variant="caption" color="text.disabled">{hint}</Typography>
  </Box>
);

const SpellReference: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { spec, setSpec } = useSpec();
  const [stats, setStats] = useState<StatsCardOptions>({ ...spec.stats });
  const [specTalents, setSpecTalents] = useState<TalentMap>(spec.defaultTalents?.spec ?? new Map());
  const [heroTalents, setHeroTalents] = useState(spec.defaultTalents?.hero ?? new Map<spell, boolean>());
  const [classTalents, setClassTalents] = useState<TalentMap>(spec.defaultTalents?.class ?? new Map());
  const [tierSet, setTierSet] = useState(spec.tierSet ?? new Map<spell, boolean>());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);

  const talents = useMemo(
    (): TalentMap => new Map([...specTalents, ...heroTalents, ...classTalents, ...tierSet]),
    [specTalents, heroTalents, classTalents, tierSet]
  );

  const resetConfig = useCallback((target: specialization) => {
    setStats({ ...target.stats });
    setSpecTalents(target.defaultTalents?.spec ?? new Map());
    setHeroTalents(target.defaultTalents?.hero ?? new Map());
    setClassTalents(target.defaultTalents?.class ?? new Map());
    setTierSet(target.tierSet ?? new Map());
  }, []);

  useEffect(() => resetConfig(spec), [spec, resetConfig]);

  const allSpells = useMemo(() => [
    ...Object.values(spec.spells),
    ...Object.values(spec.talents ?? {}),
  ].filter(hasValue), [spec]);

  const rows = useMemo(() => {
    const player: Player = { stats, talents, corePassives: spec.corePassives ?? [] };
    const activeTrees = new Set<HeroTree>();
    for (const [talent, enabled] of heroTalents) {
      if (enabled && talent.heroTalent) activeTrees.add(talent.heroTalent);
    }
    return allSpells.flatMap(s => expandRows(s, player, spec.key, activeTrees));
  }, [spec, allSpells, stats, talents, heroTalents]);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter(row =>
      (typeFilter === ALL_TYPES || row.type === typeFilter) &&
      spellName(row.spell).toLowerCase().includes(query)
    );
  }, [rows, search, typeFilter]);

  const columns: SwirlColumn<SpellRow>[] = [
    {
      key: "spell",
      label: "Spell",
      width: "2fr",
      sortValue: row => spellName(row.spell),
      render: row => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <SpellButton selectedSpell={{ ...row.spell, icon: row.spell.display?.icon ?? row.spell.icon }} size={ICON.md} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight="bold" noWrap>{spellName(row.spell)}</Typography>
            <Typography variant="caption" color="text.disabled" component="div" noWrap>
              <Box component="span" sx={{ color: CATEGORY_COLORS[row.type] }}>{row.type.toLowerCase()}</Box>
              {rowTags(row).map(tag => ` · ${tag}`)}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "cast",
      label: "Cast",
      width: "0.8fr",
      align: "right",
      sortValue: row => row.spell.castTime !== undefined ? calculateCastTime(row.spell, stats.haste) : -1,
      render: row => {
        if (row.spell.castTime === undefined) return dash;
        return (
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" color="text.secondary" sx={numeric}>
              {row.spell.castTime === 0 ? "instant" : `${calculateCastTime(row.spell, stats.haste).toFixed(2)}s`}
            </Typography>
            {row.spell.cooldown !== undefined && (
              <Typography variant="caption" color="text.disabled" component="div" sx={numeric}>
                {row.spell.cooldown}s cd
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      key: "baseSp",
      label: "Base SP%",
      width: "1fr",
      align: "right",
      sortDescFirst: true,
      sortValue: row => row.baseSpCoeff ?? -1,
      render: row => row.baseSpCoeff === null ? dash : (
        <Typography variant="body2" color="text.secondary" sx={numeric}>
          {formatPercent(row.baseSpCoeff)}
        </Typography>
      ),
    },
    {
      key: "effectiveSp",
      label: "Effective SP%",
      width: "1fr",
      align: "right",
      sortDescFirst: true,
      sortValue: row => row.spCoeff ?? -1,
      render: row => {
        if (row.spCoeff === null) return dash;
        const value = <Typography variant="body2" sx={numeric}>{formatPercent(row.spCoeff)}</Typography>;
        if (row.baseSpCoeff === null || !row.modifiers?.length) return value;
        const totalMultiplier = row.modifiers.reduce((acc, m) => acc * m.multiplier, 1);
        return (
          <GlassTooltip
            placement="left"
            title={
              <Box sx={{ display: "grid", gridTemplateColumns: "auto auto", columnGap: 1.5, rowGap: 0.25 }}>
                <Typography variant="caption" color="text.secondary">base</Typography>
                <Typography variant="caption" align="right" sx={numeric}>{formatPercent(row.baseSpCoeff)}</Typography>
                {tooltipRule}
                {row.modifiers.map((m, i) => (
                  <React.Fragment key={i}>
                    <Typography variant="caption" color="text.secondary">{m.label.toLowerCase()}</Typography>
                    <Typography variant="caption" align="right" sx={numeric}>{formatMultiplier(m.multiplier)}</Typography>
                  </React.Fragment>
                ))}
                {tooltipRule}
                <Typography variant="caption" color="text.secondary">total multiplier</Typography>
                <Typography variant="caption" align="right" sx={numeric}>{formatMultiplier(totalMultiplier)}</Typography>
                <Typography variant="caption" fontWeight="bold">effective</Typography>
                <Typography variant="caption" align="right" fontWeight="bold" sx={numeric}>{formatPercent(row.spCoeff)}</Typography>
              </Box>
            }
          >
            <Box component="span" sx={{ display: "inline-block", cursor: "help", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>
              {value}
            </Box>
          </GlassTooltip>
        );
      },
    },
    {
      key: "absolute",
      label: "Per cast",
      width: "1fr",
      align: "right",
      sortDescFirst: true,
      sortValue: row => row.absolute ?? -1,
      render: row => {
        if (row.absolute === null) return dash;
        return (
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" fontWeight="bold" sx={numeric}>{formatNumber(row.absolute)}</Typography>
            {row.targets > 1 && (
              <Typography variant="caption" color="text.disabled" component="div" sx={numeric}>
                {formatNumber(row.absolute / row.targets)} each
              </Typography>
            )}
          </Box>
        );
      },
    },
  ];

  const mobileHidden = ["cast", "baseSp"];

  return (
    <Container sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center" }}>
      <PageHeader title={title} subtitle={description} marginBottom={0} />

      <ConfigPanel
        sx={{ maxWidth: CONTENT_WIDTH.wide }}
        accent={spec.color}
        onReset={() => resetConfig(spec)}
        leading={<SpecChip accent={spec.color} spec={spec} onChange={setSpec} />}
        sections={[
          {
            key: "stats",
            title: "stats",
            summary: statsSummary(stats),
            content: <StatsCard options={stats} onOptionsChange={setStats} spec={spec} />,
          },
          ...(specTalents.size > 0 || heroTalents.size > 0 || classTalents.size > 0 || tierSet.size > 0 ? [{
            key: "talents",
            title: "talents",
            summary: `${[...talents.values()].filter(Boolean).length} active`,
            defaultOpen: true,
            content: (
              <Group>
                {specTalents.size > 0 && (
                  <TalentsCard
                    label="Spec"
                    options={specTalents}
                    color={spec.color}
                    onChange={(t, c) => setSpecTalents(prev => new Map(prev).set(t, c))}
                    onRankChange={(t, r) => setSpecTalents(prev => new Map(prev).set(t, r))}
                  />
                )}
                {heroTalents.size > 0 && (
                  <HeroTalentsCard
                    options={heroTalents}
                    onChange={(t, c) => setHeroTalents(prev => new Map(prev).set(t, c))}
                  />
                )}
                {classTalents.size > 0 && (
                  <TalentsCard
                    label="Class"
                    options={classTalents}
                    color={spec.color}
                    onChange={(t, c) => setClassTalents(prev => new Map(prev).set(t, c))}
                    onRankChange={(t, r) => setClassTalents(prev => new Map(prev).set(t, r))}
                  />
                )}
                {tierSet.size > 0 && (
                  <>
                    {(specTalents.size > 0 || heroTalents.size > 0 || classTalents.size > 0) && (
                      <div style={{ gridColumn: "1 / -1", height: 1, background: "rgba(255,255,255,0.12)" }} />
                    )}
                    <TalentsCard
                      label="Tier"
                      options={tierSet}
                      color={spec.color}
                      onChange={(t, c) => setTierSet(prev => new Map(prev).set(t, c))}
                    />
                  </>
                )}
              </Group>
            ),
          }] : []),
        ]}
      />

      <Box sx={{ width: "100%", maxWidth: CONTENT_WIDTH.wide, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <SearchChip accent={spec.color} value={search} onChange={setSearch} placeholder="spell name..." />
        <SelectChip
          accent={spec.color}
          title="type"
          value={typeFilter}
          options={[ALL_TYPES, CATEGORY.DAMAGE, CATEGORY.HEALING].map(t => ({ value: t, label: t }))}
          onChange={setTypeFilter}
          active={typeFilter !== ALL_TYPES}
        />
        <Typography sx={{ ml: "auto", px: 1, fontSize: FONT.micro, fontWeight: 600, color: "text.disabled" }}>
          {visibleRows.length} of {rows.length}
        </Typography>
      </Box>

      {allSpells.length === 0 ? (
        <EmptyMessage
          message={`No spell data for ${spec.name} yet`}
          hint="Pick another spec to see its spells"
        />
      ) : visibleRows.length === 0 ? (
        <EmptyMessage message="No spells match" hint="Clear the search or change the type filter" />
      ) : (
        <Box sx={{ width: "100%", maxWidth: CONTENT_WIDTH.wide }}>
          <SwirlTable
            rows={visibleRows}
            rowKey={row => `${row.spell.id}-${row.type}`}
            columns={isMobile ? columns.filter(c => !mobileHidden.includes(c.key)) : columns}
            accentColor={row => CATEGORY_COLORS[row.type] ?? "#ffffff"}
            defaultSortKey="absolute"
            defaultSortDir="desc"
            dense
            dimmed={row => !row.available}
          />
        </Box>
      )}
    </Container>
  );
};

export default SpellReference;
