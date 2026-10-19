import React from 'react';
import { Box, Card } from '@mui/material';
import SpellButton from '@components/SpellButtons/SpellButton';
import type spell from '@data/spells/spell';
import { Group, rowLabel as baseRowLabel, rowSep } from '@components/StatsCard/StatsCard';
import { FONT, HAIRLINE, ICON } from "@components/Theme/tokens";
import { type TalentMap, getTalentRank } from '@data/shared/engine';

export interface TalentItem {
  key: string;
  talent: spell;
}

interface TalentsCardProps {
  options: TalentMap;
  color: string;
  label?: string;
  card?: boolean;
  onChange: (key: spell, checked: boolean) => void;
  onRankChange?: (key: spell, rank: number) => void;
}

export interface TalentOptionProps {
  talent: spell;
  isChecked: boolean;
  onChange: (talent: spell, checked: boolean) => void;
  color: string;
  joined?: 'left' | 'right';
  joinedNeighborChecked?: boolean;
}

export const TalentOption: React.FC<TalentOptionProps> = ({ talent, isChecked, onChange, color, joined, joinedNeighborChecked }) => {
    // joined chips square off the side facing their choice node
    let radius = '4px';
    if (joined === 'left') {
        radius = '4px 0 0 4px';
    } else if (joined === 'right') {
        radius = '0 4px 4px 0';
    }
    const dividerColor = (isChecked || joinedNeighborChecked) ? color : HAIRLINE;
    return (
        <Box
            onClick={() => onChange(talent, !isChecked)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange(talent, !isChecked);
                }
            }}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                padding: "4px 10px 4px 4px",
                borderRadius: radius,
                position: "relative",
                border: `1px solid ${isChecked ? color : HAIRLINE}`,
                borderRight: joined === 'left' ? 'none' : undefined,
                borderLeft: joined === 'right' ? `1px solid ${dividerColor}` : undefined,
                backgroundColor: isChecked ? color + "14" : "transparent",
                transition: "transform 0.3s ease, border-color 0.15s ease, background-color 0.15s ease",
                userSelect: "none",
                whiteSpace: "nowrap",
                ...(joined === undefined && { "&:hover": { transform: "scale(1.03)" } }),
            }}
        >
            <Box sx={{ filter: isChecked ? "none" : "grayscale(1)", opacity: isChecked ? 1 : 0.55, display: "flex" }}>
                <SpellButton selectedSpell={talent} size={ICON.md} />
            </Box>
            <Box component="span" sx={{ fontSize: FONT.micro, fontWeight: 500, color: isChecked ? "text.primary" : "text.disabled" }}>
                {talent.name}
            </Box>
        </Box>
    );
};

interface RankedTalentOptionProps {
  talent: spell;
  rank: number;
  maxRank: number;
  onRankChange: (talent: spell, rank: number) => void;
  color: string;
}

const RankedTalentOption: React.FC<RankedTalentOptionProps> = ({ talent, rank, maxRank, onRankChange, color }) => {
    const isChecked = rank > 0;

    // wraps back to 0 after max
    const addPoint = () => {
        onRankChange(talent, (rank + 1) % (maxRank + 1));
    };

    return (
        <Box sx={{
            display: "flex",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.02)" },
        }}>
            <TalentOption
                talent={talent}
                isChecked={isChecked}
                onChange={(t, checked) => onRankChange(t, checked ? maxRank : 0)}
                color={color}
                joined="left"
            />
            <Box
                onClick={addPoint}
                role="button"
                aria-label={`${talent.name} ${rank}/${maxRank}`}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        addPoint();
                    }
                }}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 8px",
                    cursor: "pointer",
                    borderRadius: '0 4px 4px 0',
                    border: `1px solid ${isChecked ? color : HAIRLINE}`,
                    backgroundColor: isChecked ? color + "14" : "transparent",
                    fontSize: FONT.micro,
                    fontWeight: 500,
                    color: isChecked ? "text.primary" : "text.disabled",
                    transition: "border-color 0.15s ease, background-color 0.15s ease",
                    userSelect: "none",
                }}
            >
                {rank}/{maxRank}
            </Box>
        </Box>
    );
};

// nudged down to sit against the 32px talent icons
const rowLabel: React.CSSProperties = { ...baseRowLabel, alignSelf: "flex-start", paddingTop: 6 };


const TalentsCard: React.FC<TalentsCardProps> = ({ options, color, label, card, onChange, onRankChange }) => {
    const entries = Array.from(options.entries());

    const handleChange = (talent: spell, checked: boolean) => {
        if (checked && talent.exclusive) {
            for (const [other, isChecked] of options.entries()) {
                if (isChecked && talent.exclusive.includes(other.id)) {
                    onChange(other, false);
                }
            }
        }
        onChange(talent, checked);
    };

    // exclusive pairs where both talents are present render as one joined choice node
    const consumed = new Set<spell>();
    const items: React.ReactNode[] = [];
    for (const [talent, value] of entries) {
        if (consumed.has(talent)) continue;
        const isChecked = !!value;
        const partner = talent.exclusive
            ? entries.find(([other]) => other !== talent && !consumed.has(other) && talent.exclusive!.includes(other.id))
            : undefined;
        if (onRankChange && talent.maxRank && talent.maxRank > 1) {
            consumed.add(talent);
            items.push(
                <RankedTalentOption
                    key={talent.name}
                    talent={talent}
                    rank={getTalentRank(options, talent)}
                    maxRank={talent.maxRank}
                    onRankChange={onRankChange}
                    color={color}
                />
            );
        } else if (partner) {
            consumed.add(talent);
            consumed.add(partner[0]);
            items.push(
                <Box key={talent.name} sx={{
                    display: "flex",
                    transition: "transform 0.3s ease",
                    "&:hover": { transform: "scale(1.02)" },
                }}>
                    <TalentOption talent={talent} isChecked={isChecked} onChange={handleChange} color={color} joined="left" />
                    <TalentOption talent={partner[0]} isChecked={!!partner[1]} onChange={handleChange} color={color} joined="right" joinedNeighborChecked={isChecked} />
                </Box>
            );
        } else {
            consumed.add(talent);
            items.push(
                <TalentOption key={talent.name} talent={talent} isChecked={isChecked} onChange={handleChange} color={color} />
            );
        }
    }

    const chips = (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {items}
        </div>
    );

    if (card) {
        return (
            <Card variant="outlined" sx={{ p: 2 }}>
                <Group>
                    <span style={rowLabel}>{label ?? ''}</span>
                    {rowSep}
                    {chips}
                </Group>
            </Card>
        );
    }

    return (
        <React.Fragment>
            <span style={rowLabel}>{label ?? ''}</span>
            {rowSep}
            {chips}
        </React.Fragment>
    );
};

export default TalentsCard;
