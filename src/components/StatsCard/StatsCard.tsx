"use client";
import type React from 'react';
import { FieldCells, type FieldDef } from '@components/FieldCells/FieldCells';
import type { Stats } from '@data/shared/stats';
import type { specialization } from '@data/class';
import { FONT } from "@components/Theme/tokens";

export interface StatsCardOptions extends Stats {
    totalHp?: number;
}

interface StatsCardProps {
    options: StatsCardOptions;
    onOptionsChange: (newOptions: any) => void;
    label?: string;
    fields?: (keyof StatsCardOptions)[];
    spec?: specialization;
}

export const rowLabel: React.CSSProperties = { fontSize: FONT.micro, fontWeight: 600, opacity: 0.45, textAlign: "right", whiteSpace: "nowrap" };
export const rowSep = <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.12)" }} />;

export const Group: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ display: "grid", gridTemplateColumns: "max-content 1px auto", gap: "8px 10px", alignItems: "start" }}>
        {children}
    </div>
);

interface StatFieldDef extends FieldDef {
    summary?: {
        suffix: string;
        compact?: boolean;
        format?: (value: number) => string;
    };
}

const formatK = (value: number): string =>
    value >= 1000 ? `${Math.round(value / 1000)}k` : `${value}`;

const baseFields: StatFieldDef[] = [
    { key: 'intellect', label: 'intellect', min: 1, summary: { suffix: ' int' } },
    { key: 'totalHp', label: 'total hp', min: 1, summary: { suffix: ' hp', format: formatK } },
];

const secondaryFields: StatFieldDef[] = [
    { key: 'haste', label: 'haste', min: 0, adornment: "%", summary: { suffix: 'h', compact: true } },
    { key: 'crit', label: 'crit', min: 0, adornment: "%", tooltip: "We're using the law of large numbers to assume that, out of a large number of casts, you will critically strike as often as your crit percentage.", summary: { suffix: 'c', compact: true } },
    { key: 'versatility', label: 'vers', min: 0, adornment: "%", summary: { suffix: 'v', compact: true } },
    { key: 'mastery', label: 'mastery', min: 0, adornment: "%", summary: { suffix: '% mast' } },
];

export const statsSummary = (options: StatsCardOptions, fields?: (keyof StatsCardOptions)[]): string => {
    type SummaryEntry = { summary: NonNullable<StatFieldDef['summary']>; value: number };

    const present = [...baseFields, ...secondaryFields]
        .filter(field => field.summary && (!fields || fields.includes(field.key as keyof StatsCardOptions)))
        .map(field => ({ summary: field.summary!, value: options[field.key as keyof StatsCardOptions] }))
        .filter((entry): entry is SummaryEntry => typeof entry.value === 'number' && entry.value > 0);

    const format = ({ summary, value }: SummaryEntry) =>
        `${(summary.format ?? (v => v.toLocaleString()))(value)}${summary.suffix}`;

    const compact = present.filter(entry => entry.summary.compact).map(format).join(" ");
    const separate = present.filter(entry => !entry.summary.compact).map(format);

    return [...separate, ...(compact ? [compact] : [])].join(", ");
};

const StatsCard: React.FC<StatsCardProps> = ({ options, onOptionsChange, label, fields, spec }) => {
    const masteryMin = spec ? spec.masteryCoefficient * 8 : 0;
    const visibleFields = [...baseFields, ...secondaryFields]
        .map(field => field.key === 'mastery' ? { ...field, min: masteryMin } : field)
        .filter(field => !fields || fields.includes(field.key as keyof StatsCardOptions));

    return (
        <FieldCells
            fields={visibleFields}
            options={options}
            onOptionsChange={onOptionsChange}
            label={label}
        />
    );
};

export default StatsCard;
