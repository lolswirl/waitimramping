import type React from 'react';
import { Card, Box, Typography, IconButton, Collapse, Divider } from '@mui/material';
import { ExpandMore, ExpandLess, DeleteTwoTone } from '@mui/icons-material';
import type { RotationResult } from '../../../app/analysis/chi-ji/types';
import SpellButton from "@components/SpellButtons/SpellButton";
import SwirlChip from "@components/SwirlChip/SwirlChip";
import { formatNumber, formatPercent } from "@util/stringManipulation";
import TALENTS from "@data/specs/monk/mistweaver/talents";
import SPELLS from "@data/spells";
import { RAINBOW_COLORS } from '@components/Buttons/RainbowCard';
import { ICON } from "@components/Theme/tokens";

interface RotationCardProps {
    rotation: RotationResult;
    index: number;
    expanded: boolean;
    onToggleExpansion: () => void;
    onDelete: () => void;
    theme: any;
}

const HEALING_SOURCES = [
    { key: 'baseHealing', title: 'Base', color: '#4caf50' },
    { key: 'chiCocoons', title: 'Chi Cocoon', color: '#0a995d' },
    { key: 'chiJiGusts', title: 'Chi-Ji Gusts', color: '#fb3100' },
    { key: 'ancientTeachings', title: 'Ancient Teachings', color: '#f1a828' },
    { key: 'wayOfTheCrane', title: 'Way of the Crane', color: '#ff3600' },
    { key: 'rapidDiffusion', title: 'Rapid Diffusion', color: '#257343' },
    { key: 'gustOfMists', title: 'Gust of Mists', color: '#79ceab' },
];

export const RotationCard: React.FC<RotationCardProps> = ({
    rotation,
    index,
    expanded,
    onToggleExpansion,
    onDelete,
    theme,
}) => {
    const accent = RAINBOW_COLORS[index % RAINBOW_COLORS.length];

    const aggregateSources = HEALING_SOURCES.map(s => ({
        ...s,
        value: rotation.breakdown.reduce((sum, item) => sum + (Number((item.sources as any)[s.key]) || 0), 0),
    })).filter(s => s.value > 0).sort((a, b) => b.value - a.value);

    const aggregateTotal = aggregateSources.reduce((sum, s) => sum + s.value, 0);

    const aggregateStops = (() => {
        let pct = 0;
        return aggregateSources.flatMap(s => {
            const start = pct;
            pct += (s.value / aggregateTotal) * 100;
            return [`${s.color} ${start}%`, `${s.color} ${pct}%`];
        });
    })();

    return (
        <Card
            variant="outlined"
            sx={{
                p: 0,
                width: '100%',
                maxWidth: 650,
                mx: 'auto',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: `${accent}44`,
                background: theme.palette.background.paper,
            }}
        >
            <Box sx={{ height: 3, background: accent, opacity: 0.85 }} />

            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', flex: 1 }}>
                        {rotation.spells.map((spell, i) => (
                            <SpellButton key={`${spell.id}-${i}`} selectedSpell={spell} />
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexShrink: 0 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: accent, letterSpacing: '-0.5px', lineHeight: 1 }}>
                                {formatNumber(Math.round(rotation.hps))}
                                <Typography component="span" variant="body2" sx={{ fontWeight: 400, color: 'text.secondary', ml: 0.5 }}>
                                    hps
                                </Typography>
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {formatNumber(rotation.duration, 1)}s, {formatNumber(Math.round(rotation.totalHealing))} total
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={onDelete} color="error" sx={{ p: 0, mt: 0.25 }}>
                            <DeleteTwoTone fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {aggregateSources.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                        <Box sx={{
                            height: 8,
                            mb: 0.75,
                            borderRadius: 0.5,
                            background: `linear-gradient(to right, ${aggregateStops.join(', ')})`,
                            opacity: 0.85,
                        }} />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {aggregateSources.map(s => (
                                <Box
                                    key={s.key}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.4,
                                        px: 0.75,
                                        py: 0.25,
                                        borderRadius: 1,
                                        bgcolor: `${s.color}15`,
                                        border: `1px solid ${s.color}40`,
                                    }}
                                >
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
                                    <Typography variant="caption" sx={{ color: s.color, fontWeight: 600, lineHeight: 1 }}>
                                        {s.title}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                                        {formatPercent((s.value / aggregateTotal) * 100, 1)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                <Divider sx={{ my: 1.5, borderColor: `${accent}22` }} />

                <Box
                    onClick={onToggleExpansion}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        py: 0.5,
                        px: 1,
                        borderRadius: 1,
                        '&:hover': { bgcolor: `${accent}10` },
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: accent }}>
                        Breakdown
                    </Typography>
                    {expanded ? <ExpandLess sx={{ color: accent }} /> : <ExpandMore sx={{ color: accent }} />}
                </Box>

                <Collapse in={expanded}>
                    <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {rotation.breakdown.map((item, i) => {
                            const spellObj =
                                rotation.spells.find(s => s.name === item.spellName) ||
                                Object.values(TALENTS).find(t => t.name === item.spellName) ||
                                SPELLS.RENEWING_MIST ||
                                rotation.spells[0];

                            const sources = HEALING_SOURCES.map(s => ({
                                ...s,
                                value: Number((item.sources as any)[s.key]) || 0,
                            })).filter(s => s.value > 0);

                            return (
                                <Box key={i}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <SpellButton selectedSpell={spellObj} size={ICON.md}/>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {item.spellName}
                                            </Typography>
                                        </Box>
                                        <SwirlChip
                                            message={`${formatPercent(item.percentage, 1)}`}
                                            borderColor={accent}
                                            fontSize="0.7rem"
                                        />
                                    </Box>

                                    {sources.length > 0 && (() => {
                                        const total = sources.reduce((sum, s) => sum + s.value, 0);
                                        const sorted = [...sources].sort((a, b) => b.value - a.value);
                                        let pct = 0;
                                        const stops = sorted.flatMap(s => {
                                            const start = pct;
                                            pct += (s.value / total) * 100;
                                            return [`${s.color} ${start}%`, `${s.color} ${pct}%`];
                                        });
                                        return (
                                            <Box sx={{ position: 'relative', height: 6, mb: 0.75, borderRadius: 0.5, bgcolor: 'rgba(255,255,255,0.08)' }}>
                                                <Box sx={{
                                                    position: 'absolute',
                                                    left: 0, top: 0, bottom: 0,
                                                    width: `${item.percentage}%`,
                                                    borderRadius: 0.5,
                                                    background: `linear-gradient(to right, ${stops.join(', ')})`,
                                                    opacity: 0.85,
                                                }} />
                                            </Box>
                                        );
                                    })()}

                                    {sources.length > 0 && (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {sources.map(s => (
                                                <Box
                                                    key={s.key}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.4,
                                                        px: 0.75,
                                                        py: 0.25,
                                                        borderRadius: 1,
                                                        bgcolor: `${s.color}15`,
                                                        border: `1px solid ${s.color}40`,
                                                    }}
                                                >
                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
                                                    <Typography variant="caption" sx={{ color: s.color, fontWeight: 600, lineHeight: 1 }}>
                                                        {s.title}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                                                        {formatNumber(Math.round(s.value))}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}

                                    {i < rotation.breakdown.length - 1 && (
                                        <Divider sx={{ mt: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Collapse>
            </Box>
        </Card>
    );
};
