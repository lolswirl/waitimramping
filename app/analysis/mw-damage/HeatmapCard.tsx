"use client";
import type React from "react";
import { useMemo } from "react";
import { Box, Card, Typography, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import SpellButton from "@components/SpellButtons/SpellButton";
import SwirlChip from "@components/SwirlChip/SwirlChip";
import { formatNumber, formatPercent } from "@util/stringManipulation";
import type { Player } from "@data/specs/monk/mistweaver/calcs";
import type { RotationConfig } from "./types";
import { CONTENT_WIDTH, FONT, ICON } from "@components/Theme/tokens";

type Props = {
  rotationConfigs: RotationConfig[];
  player: Player;
  rerollKey: number;
  showAsHealing: boolean;
  activeTab: number;
  onTabChange: (v: number) => void;
};

const HeatmapCard: React.FC<Props> = ({ rotationConfigs, player, rerollKey, showAsHealing, activeTab, onTabChange }) => {
  const heatmapRows = useMemo(() => {
    const time = 500;
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(targets => ({
      targets,
      dps: rotationConfigs.map(config => {
        const result = config.modelFn(time, targets, false, player);
        return result.points.length > 0 ? result.points[result.points.length - 1].damage / time : 0;
      }),
      hps: rotationConfigs.map(config => {
        const result = config.modelFn(time, targets, true, player);
        return result.points.length > 0 ? result.points[result.points.length - 1].damage / time : 0;
      }),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rerollKey, player, rotationConfigs]);

  const renderHeatmapTable = (type: 'DPS' | 'HPS', asHealing: boolean) => {
    const rows = heatmapRows.map(row => ({ targets: row.targets, values: asHealing ? row.hps : row.dps }));

    return (
      <TableContainer component={Card} variant="outlined" sx={{ borderRadius: 1, border: "1px solid", borderColor: "divider", overflowX: "auto" }}>
        <Box sx={{ px: 2, pt: 1.5, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: '0.5px', fontSize: FONT.small }}>
            {type} by Target Count (500 seconds)
          </Typography>
          <SwirlChip message="% shown is relative to the best rotation in each row" borderColor="rgba(255,255,255,0.2)" />
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold', border: 0, py: 1, px: 1.5, width: 60 }}>
                <Typography variant="caption" fontWeight="bold">Targets</Typography>
              </TableCell>
              {rotationConfigs.map(config => (
                <TableCell key={config.dataKey} align="center" sx={{ border: 0, py: 1, px: 1, width: 120, minWidth: 120 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {config.spells.map((spell, idx) => (
                        <SpellButton key={`${config.dataKey}-spell-${idx}`} selectedSpell={spell} size={ICON.sm} />
                      ))}
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: FONT.micro, color: config.color }}>
                      {config.label}
                    </Typography>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(({ targets, values }) => {
              const min = Math.min(...values);
              const max = Math.max(...values);
              const range = max - min || 1;
              return (
                <TableRow key={targets}>
                  <TableCell align="center" sx={{ border: 0, py: 1.25, px: 1.5 }}>
                    <Typography variant="body2" fontWeight="bold">{targets}</Typography>
                  </TableCell>
                  {values.map((value, idx) => {
                    const t = (value - min) / range;
                    const r = Math.round(239 - t * (239 - 74));
                    const g = Math.round(68 + t * (222 - 68));
                    const b = Math.round(68 + t * (128 - 68));
                    return (
                      <TableCell key={rotationConfigs[idx].dataKey} align="center" sx={{
                        border: 0,
                        py: 1.25,
                        px: 1,
                        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.18)`,
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          {formatNumber(value)}
                        </Typography>
                        {t < 1 && (
                          <Typography variant="caption" sx={{ color: '#ef4444', lineHeight: 1, display: 'block', fontSize: FONT.micro, fontWeight: 700 }}>
                            {formatPercent((value - max) / max * 100, 1)}
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Card variant="outlined" sx={{ width: "100%", maxWidth: CONTENT_WIDTH.wide }}>
      <Tabs value={activeTab} onChange={(_, v) => onTabChange(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={"HPS"} />
        <Tab label={"DPS"} />
      </Tabs>
      <Box sx={{ p: 2 }}>
        {renderHeatmapTable(showAsHealing ? 'HPS' : 'DPS', showAsHealing)}
      </Box>
    </Card>
  );
};

export default HeatmapCard;
