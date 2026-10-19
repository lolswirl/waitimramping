"use client";
import type React from "react";
import { useState } from "react";
import { Box, Collapse, Divider, Card, Typography, Tab, Tabs } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import SpellButton from "@components/SpellButtons/SpellButton";
import AbilityBar from "@components/AbilityBar/AbilityBar";
import type spell from "@data/spells/spell";
import { formatNumber } from "@util/stringManipulation";
import type { ModelResult, } from "./model";
import type { RotationConfig } from "./types";
import { ICON } from "@components/Theme/tokens";

type Props = {
  rotationConfigs: RotationConfig[];
  damageData: Record<string, ModelResult>;
  showAsHealing: boolean;
  timeSpent: number;
};

const BreakdownCard: React.FC<Props> = ({ rotationConfigs, damageData, showAsHealing, timeSpent }) => {
  const [breakdownTab, setBreakdownTab] = useState(0);
  const [expandedAbilities, setExpandedAbilities] = useState<Set<number>>(new Set());

  const toggleAbility = (id: number) => setExpandedAbilities(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const renderAbilityRow = (spellObj: spell, total: number, denominator: number, color: string, indent = false, hasSub = false, isExpanded = false) => {
    const dps = total / timeSpent;
    const pct = denominator > 0 ? total / denominator : 0;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: indent ? 5.5 : 0 }}>
        <SpellButton selectedSpell={spellObj} size={indent ? 22 : 28} />
        <AbilityBar
          pct={pct}
          color={color}
          dimmed={indent}
          label={spellObj.name}
          sublabel={`${formatNumber(dps, 2)} ${showAsHealing ? 'HPS' : 'DPS'}`}
          labelSuffix={hasSub && (
            <ExpandMore sx={{ fontSize: 14, color: 'text.disabled', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
          )}
        />
      </Box>
    );
  };

  const renderBreakdown = () => {
    const config = rotationConfigs[breakdownTab];
    if (!config) return null;
    const result = damageData[config.dataKey];
    if (!result) return null;
    const totalDamage = result.points.length > 0 ? result.points[result.points.length - 1].damage : 0;
    const totalDps = totalDamage / timeSpent;
    const entries = [...result.perAbility.entries()].sort((a, b) => b[1].total - a[1].total);
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {entries.map(([spellObj, entry]) => {
          const hasSub = entry.sub && entry.sub.size > 1;
          const isExpanded = expandedAbilities.has(spellObj.id);
          return (
            <Box key={spellObj.id}>
              <Box
                onClick={hasSub ? () => toggleAbility(spellObj.id) : undefined}
                sx={{ cursor: hasSub ? 'pointer' : 'default' }}
              >
                {renderAbilityRow(spellObj, entry.total, totalDamage, config.color, false, hasSub, isExpanded)}
              </Box>
              {hasSub && (
                <Collapse in={isExpanded}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                    {[...entry.sub!.entries()]
                      .sort((a, b) => b[1] - a[1])
                      .map(([subSpell, subTotal]) =>
                        <Box key={subSpell.id}>{renderAbilityRow(subSpell, subTotal, entry.total, config.color, true)}</Box>
                      )}
                  </Box>
                </Collapse>
              )}
            </Box>
          );
        })}
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Total: <Typography component="span" variant="caption" sx={{ color: config.color, fontWeight: 700 }}>{formatNumber(totalDps, 2)} {showAsHealing ? 'HPS' : 'DPS'}</Typography>
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Card variant="outlined" sx={{ borderColor: 'divider' }}>
      <Tabs
        value={breakdownTab}
        onChange={(_, v) => setBreakdownTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        {rotationConfigs.map((config, idx) => (
          <Tab
            key={config.dataKey}
            value={idx}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pointerEvents: 'none' }}>
                {config.spells.map((s, i) => (
                  <SpellButton key={i} selectedSpell={s} size={ICON.xs} />
                ))}
              </Box>
            }
          />
        ))}
      </Tabs>
      <Box sx={{ p: 2 }}>
        {renderBreakdown()}
      </Box>
    </Card>
  );
};

export default BreakdownCard;
