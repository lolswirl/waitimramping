import React, { useState } from "react";
import EmpowerLevelDialog from "@components/EmpowerLevel/EmpowerLevelDialog";
import type SPELL from "@data/spells/spell";
import { type SpellCategory, CATEGORY } from "@data/spells/spell";
import type { specialization } from "@data/class";
import SpellButton from "@components/SpellButtons/SpellButton";
import { GlassTooltip } from "@components/Glass/Tooltip/GlassTooltip";
import { FONT, ICON } from "@components/Theme/tokens";

interface SpellButtonsProps {
    selectedSpec?: specialization;
    spells?: SPELL[];
    addSpellToTable: (spell: SPELL, empowerLevel: number) => void;
    onSelectPreset?: (spells: SPELL[]) => void;
}

const categorize = (spell: SPELL): SpellCategory => {
    if (spell.category) return spell.category;
    if (spell.value?.damage && !spell.value?.healing) return CATEGORY.DAMAGE;
    if (spell.value?.healing && !spell.value?.damage) return CATEGORY.HEALING;
    return CATEGORY.COOLDOWN;
};

const formatPresetName = (key: string) => key.replace(/_/g, " ").toLowerCase();

const rowLabel: React.CSSProperties = { fontSize: FONT.micro, fontWeight: 600, opacity: 0.45, textAlign: "right", whiteSpace: "nowrap", paddingTop: 6 };
const rowSep = <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.12)" }} />;

const SpellButtons: React.FC<SpellButtonsProps> = ({
    selectedSpec,
    spells,
    addSpellToTable,
    onSelectPreset,
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedSpell, setSelectedSpell] = useState<SPELL | null>(null);

    let spellList: SPELL[] = [];
    if (spells) {
        spellList = Object.values(spells);
    } else if (selectedSpec) {
        spellList = Object.values(selectedSpec.spells);
    }

    if (spellList.length === 0) return null;

    const groups = Object.values(CATEGORY)
        .map((key) => ({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            spells: spellList.filter((s) => categorize(s) === key),
        }))
        .filter((g) => g.spells.length > 0);

    const presetEntries = selectedSpec?.rotations
        ? Object.entries(selectedSpec.rotations)
        : [];

    const handlePresetClick = (presetSpells: SPELL[]) => {
        if (onSelectPreset) {
            onSelectPreset(presetSpells);
        } else {
            presetSpells.forEach((spell) => addSpellToTable(spell, 0));
        }
    };

    const handleSpellClick = (spell: SPELL, empowerLevel: number = 0) => {
        if (Object.hasOwn(spell, "empowerLevel")) {
            setSelectedSpell(spell);
            setDialogOpen(true);
        } else {
            addSpellToTable(spell, empowerLevel);
        }
    };

    const handleEmpowerLevelSelect = (level: number) => {
        if (selectedSpell) addSpellToTable(selectedSpell, level);
        handleDialogClose();
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setTimeout(() => setSelectedSpell(null), 200);
    };

    return (
        <div>
            <div style={{ display: "grid", gridTemplateColumns: "max-content 1px auto", gap: "6px 10px", alignItems: "start" }}>
                {groups.map(({ label, spells }) => (
                    <React.Fragment key={label}>
                        <span style={rowLabel}>{label}</span>
                        {rowSep}
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                            {spells.map((spell) => (
                                <SpellButton key={spell.id} selectedSpell={spell} action={handleSpellClick} />
                            ))}
                        </div>
                    </React.Fragment>
                ))}

                {presetEntries.length > 0 && (
                    <React.Fragment>
                        <span style={{ ...rowLabel, paddingTop: 0 }}>presets</span>
                        {rowSep}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            {presetEntries.map(([name, presetSpells]) => (
                                <GlassTooltip
                                    key={name}
                                    title={
                                        <div style={{ display: "flex", gap: 4 }}>
                                            {presetSpells.map((spell, i) => (
                                                <SpellButton key={spell.uuid || spell.id + i} selectedSpell={spell} size={ICON.md} />
                                            ))}
                                        </div>
                                    }
                                    placement="bottom-start"
                                    slotProps={{ tooltip: { sx: { maxWidth: "none", padding: "4px" } } }}
                                >
                                    <button
                                        onClick={() => handlePresetClick(presetSpells)}
                                        style={{
                                            all: "unset",
                                            cursor: "pointer",
                                            fontSize: FONT.micro,
                                            padding: "2px 8px",
                                            borderRadius: 4,
                                            border: "1px solid rgba(255,255,255,0.12)",
                                            opacity: 0.55,
                                            transition: "all 0.15s",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {formatPresetName(name)}
                                    </button>
                                </GlassTooltip>
                            ))}
                        </div>
                    </React.Fragment>
                )}
            </div>

            <EmpowerLevelDialog
                open={dialogOpen}
                spell={selectedSpell}
                onSelect={handleEmpowerLevelSelect}
                onClose={handleDialogClose}
            />
        </div>
    );
};

export default SpellButtons;
