import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type Spell from '@data/spells/spell';

interface Rotation {
    id: string;
    name: string;
    steps: Spell[];
}

interface UseRotationManagerOptions {
    generateRotationName?: (steps: Spell[]) => string;
    validateSpell?: (spell: Spell) => boolean;
}

export const useRotationManager = (options: UseRotationManagerOptions = {}) => {
    const [currentRotation, setCurrentRotation] = useState<Spell[]>([]);
    const [rotations, setRotations] = useState<Rotation[]>([]);

    const {
        generateRotationName = (steps: Spell[]) => `Rotation ${rotations.length + 1}`,
        validateSpell = () => true
    } = options;

    const addSpellToRotation = (spell: Spell, empowerLevel: number = 0) => {
        if (!validateSpell(spell)) {
            return;
        }
        
        setCurrentRotation(prev => [
            ...prev,
            {
                ...spell,
                ...(Object.hasOwn(spell, "empowerLevel") ? { empowerLevel } : {}),
                uuid: uuidv4(),
            }
        ]);
    };

    const removeSpellFromRotation = (spellToRemove: Spell) => {
        setCurrentRotation(prev => 
            prev.filter(spell => spell.uuid !== spellToRemove.uuid)
        );
    };

    const finalizeRotation = () => {
        if (currentRotation.length === 0) return;
        
        const newRotation: Rotation = {
            id: uuidv4(),
            name: generateRotationName(currentRotation),
            steps: [...currentRotation]
        };
        
        setRotations(prev => [...prev, newRotation]);
        setCurrentRotation([]);
    };

    const clearCurrentRotation = () => {
        setCurrentRotation([]);
    };

    const clearAllRotations = () => {
        setRotations([]);
        setCurrentRotation([]);
    };

    const removeRotation = (rotationId: string) => {
        setRotations(prev => prev.filter(r => r.id !== rotationId));
    };

    const moveRotationUp = (rotationId: string) => {
        setRotations(prev => {
            const index = prev.findIndex(r => r.id === rotationId);
            if (index <= 0) return prev;
            const next = [...prev];
            [next[index - 1], next[index]] = [next[index], next[index - 1]];
            return next;
        });
    };

    const moveRotationDown = (rotationId: string) => {
        setRotations(prev => {
            const index = prev.findIndex(r => r.id === rotationId);
            if (index < 0 || index >= prev.length - 1) return prev;
            const next = [...prev];
            [next[index], next[index + 1]] = [next[index + 1], next[index]];
            return next;
        });
    };

    const setCurrentRotationDirect = (spells: Spell[]) => {
        setCurrentRotation(spells);
    };

    const onReorderRotation = (newRotation: Spell[]) => {
        setCurrentRotation(newRotation);
    };

    return {
        currentRotation,
        rotations,
        addSpellToRotation,
        removeSpellFromRotation,
        finalizeRotation,
        clearCurrentRotation,
        clearAllRotations,
        removeRotation,
        moveRotationUp,
        moveRotationDown,
        setCurrentRotation: setCurrentRotationDirect,
        setRotations,
        onReorderRotation,
        hasRotations: rotations.length > 0
    };
};