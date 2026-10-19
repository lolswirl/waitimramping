"use client";
import type React from 'react';
import { FieldCells, type FieldDef } from '@components/FieldCells/FieldCells';

interface TargetCountsCardProps {
    options: {
        enemyCount: number;
        allyCount: number;
    };
    onOptionsChange: (newOptions: any) => void;
    label?: string;
    fields?: FieldDef[];
}

const defaultFields: FieldDef[] = [
    { key: 'enemyCount', label: 'enemies', min: 1 },
    { key: 'allyCount', label: 'allies', min: 1 },
];

const TargetCountsCard: React.FC<TargetCountsCardProps> = ({ options, onOptionsChange, label, fields = defaultFields }) => (
    <FieldCells
        fields={fields}
        options={options}
        onOptionsChange={onOptionsChange}
        label={label}
    />
);

export default TargetCountsCard;
