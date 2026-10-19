"use client";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Box, Card, Typography, Tab, Tabs, Table, TableBody, TableCell, TableRow, Skeleton } from "@mui/material";
import SpellButton from "@components/SpellButtons/SpellButton";
import SwirlButton from "@components/Buttons/SwirlButton";
import { Calculate } from "@mui/icons-material";
import type spell from "@data/spells/spell";
import { formatNumber, formatPercent } from "@util/stringManipulation";
import type { ComboResultSerialized } from "./comboRank.worker";
import { CONTENT_WIDTH, FONT, ICON } from "@components/Theme/tokens";

type Props = {
  targetCount: number;
  spellById: Map<number, spell>;
};

const ComboRankCard: React.FC<Props> = ({ targetCount, spellById }) => {
  const [comboResults, setComboResults] = useState<ComboResultSerialized[] | null>(null);
  const [comboAsHealing, setComboAsHealing] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => () => workerRef.current?.terminate(), []);

  const runCalculation = () => {
    workerRef.current?.terminate();
    setComboResults(null);
    setIsCalculating(true);
    const worker = new Worker(new URL('./comboRank.worker.ts', import.meta.url));
    workerRef.current = worker;
    worker.onmessage = (e: MessageEvent<{ type: 'progress'; pct: number } | { type: 'done'; results: ComboResultSerialized[] }>) => {
      if (e.data.type === 'done') {
        setComboResults(e.data.results);
        setIsCalculating(false);
        worker.terminate();
        workerRef.current = null;
      }
    };
    worker.postMessage({ targetCount, asHealing: comboAsHealing });
  };

  return (
    <Card variant="outlined" sx={{ width: "100%", maxWidth: CONTENT_WIDTH.wide }}>
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
        <Tabs value={comboAsHealing ? 0 : 1} onChange={(_, v) => setComboAsHealing(v === 0)}>
          <Tab label="HPS" />
          <Tab label="DPS" />
        </Tabs>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            All Combos, {targetCount} target{targetCount !== 1 ? 's' : ''}, 500s{comboResults !== null ? `, ${comboResults.length} combinations` : ''}
          </Typography>
          <SwirlButton
            color="success"
            onClick={runCalculation}
            disabled={isCalculating}
            startIcon={<Calculate />}
          >
            {isCalculating ? 'Calculating…' : 'Calculate'}
          </SwirlButton>
        </Box>
      </Box>
      <Box sx={{ maxHeight: 480, overflowY: 'auto' }}>
        {comboResults === null && !isCalculating && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Click Calculate to evaluate all talent/rotation combinations.
            </Typography>
          </Box>
        )}
        {comboResults === null && isCalculating && (
          <Table size="small"><TableBody>
            {[...Array(14)].map((_, i) => (
              <TableRow key={i}>
                <TableCell sx={{ border: 0, py: 0.75, px: 1.5, width: 36 }}><Skeleton variant="text" width={24} /></TableCell>
                <TableCell sx={{ border: 0, py: 0.75, px: 1 }}><Box sx={{ display: 'flex', gap: 0.5 }}>{[...Array(5)].map((_, j) => <Skeleton key={j} variant="rounded" width={22} height={22} />)}</Box></TableCell>
                <TableCell sx={{ border: 0, py: 0.75, px: 1 }}><Box sx={{ display: 'flex', gap: 0.5 }}>{[...Array(3)].map((_, j) => <Skeleton key={j} variant="rounded" width={18} height={18} />)}</Box></TableCell>
                <TableCell align="right" sx={{ border: 0, py: 0.75, px: 1.5 }}><Skeleton variant="text" width={48} sx={{ ml: 'auto' }} /></TableCell>
              </TableRow>
            ))}
          </TableBody></Table>
        )}
        {comboResults !== null && <Table size="small">
          <TableBody>
            {comboResults.map((r, idx) => {
              const isTop = idx === 0;
              const pct = comboResults[0].value > 0 ? r.value / comboResults[0].value : 0;
              const activeTalentSpells = r.talentIds.map(id => spellById.get(id)).filter((s): s is spell => s !== undefined);
              return (
                <TableRow key={idx} sx={{ bgcolor: isTop ? 'rgba(250,204,21,0.06)' : undefined }}>
                  <TableCell sx={{ border: 0, py: 0.75, px: 1.5, width: 36, color: isTop ? '#facc15' : 'text.disabled', fontWeight: 700, fontSize: FONT.small }}>
                    #{idx + 1}
                  </TableCell>
                  <TableCell sx={{ border: 0, py: 0.75, px: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', pointerEvents: 'none' }}>
                      {activeTalentSpells.map(t => (
                        <SpellButton key={t.id} selectedSpell={t} size={ICON.sm} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ border: 0, py: 0.75, px: 1, whiteSpace: 'nowrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pointerEvents: 'none' }}>
                      {r.rotationSpellIds.map((id, i) => {
                        const s = spellById.get(id);
                        return s ? <SpellButton key={i} selectedSpell={s} size={ICON.xs} /> : null;
                      })}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ border: 0, py: 0.75, px: 1.5, whiteSpace: 'nowrap' }}>
                    <Typography variant="caption" sx={{ color: r.rotationColor, fontWeight: 700 }}>
                      {formatNumber(r.value, 2)}
                    </Typography>
                    {!isTop && (
                      <Typography variant="caption" sx={{ color: '#ef4444', ml: 0.75 }}>
                        {formatPercent((pct - 1) * 100, 1)}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>}
      </Box>
    </Card>
  );
};

export default ComboRankCard;
