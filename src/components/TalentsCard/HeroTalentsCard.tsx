import React from 'react';
import type spell from '@data/spells/spell';
import type { HeroTree } from '@data/heroTalents';
import { rowLabel, rowSep, Group } from '@components/StatsCard/StatsCard';
import { TalentOption } from './TalentsCard';

interface HeroTalentsCardProps {
    options: Map<spell, boolean>;
    label?: string;
    onChange: (key: spell, checked: boolean) => void;
}

interface HeroTreeRowProps {
    info: HeroTree;
    spells: [spell, boolean][];
    onChange: (talent: spell, checked: boolean) => void;
}

const HeroTreeRow: React.FC<HeroTreeRowProps> = ({ info, spells, onChange }) => (
    <>
        <span style={{ ...rowLabel, paddingTop: 6 }}>
            {info.shortName}
        </span>
        {rowSep}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {spells.map(([spell, isChecked]) => (
                <TalentOption
                    key={spell.id}
                    talent={spell}
                    isChecked={isChecked}
                    onChange={onChange}
                    color={info.color}
                />
            ))}
        </div>
    </>
);

const HeroTalentsCard: React.FC<HeroTalentsCardProps> = ({ options, label, onChange }) => {
    const trees = new Map<HeroTree, [spell, boolean][]>();
    for (const [spell, checked] of options.entries()) {
        if (!spell.heroTalent) continue;
        if (!trees.has(spell.heroTalent)) trees.set(spell.heroTalent, []);
        trees.get(spell.heroTalent)!.push([spell, checked]);
    }

    const handleChange = (talent: spell, checked: boolean) => {
        if (checked && talent.heroTalent) {
            for (const [other, isChecked] of options.entries()) {
                if (isChecked && other.heroTalent && other.heroTalent !== talent.heroTalent) {
                    onChange(other, false);
                }
            }
        }
        onChange(talent, checked);
    };

    return (
        <React.Fragment>
            <span style={{ ...rowLabel, paddingTop: 6 }}>
                {label ?? 'Hero'}
            </span>
            {rowSep}
            <Group>
                {Array.from(trees.entries()).map(([info, spells]) => (
                    <HeroTreeRow
                        key={info.name}
                        info={info}
                        spells={spells}
                        onChange={handleChange}
                    />
                ))}
            </Group>
        </React.Fragment>
    );
};

export default HeroTalentsCard;
