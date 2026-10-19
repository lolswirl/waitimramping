import type React from "react";
import IconButtonBase from "./IconButtonBase";
import type spell from "@data/spells/spell";

interface SpellButtonProps {
    selectedSpell: spell;
    action?: (spell: spell, empowerLevel: number) => void;
    empowerLevel?: number;
    isRemove?: boolean;
    size?: number;
    showName?: boolean;
    [key: string]: any;
}

const SpellButton: React.FC<SpellButtonProps> = ({
    selectedSpell,
    action,
    empowerLevel,
    isRemove = false,
    size = 40,
    showName = false,
    ...rest
}) => {
    const safeEmpowerLevel = empowerLevel ?? 0;
    return (
        <IconButtonBase
            icon={selectedSpell.icon}
            name={selectedSpell.name}
            id={selectedSpell.id}
            spellModifier={selectedSpell.spellModifier}
            onClick={action ? () => action(selectedSpell, safeEmpowerLevel) : undefined}
            size={size}
            {...rest}
        />
    );
};

export default SpellButton;
