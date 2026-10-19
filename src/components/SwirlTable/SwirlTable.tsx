"use client";
import type React from "react";
import { useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RainbowCard from "@components/Buttons/RainbowCard";
import { CHIP_HEIGHT } from "@components/Theme/tokens";

const ACCENT_WIDTH = 7;

export interface SwirlColumn<T> {
    key: string;
    label: React.ReactNode;
    render: (row: T) => React.ReactNode;
    align?: "left" | "right" | "center";
    width?: string | number;
    sortValue?: (row: T) => string | number;
    sortDescFirst?: boolean;
}

interface SwirlTableProps<T> {
    columns: SwirlColumn<T>[];
    rows: T[];
    rowKey: (row: T, index: number) => string;
    onRowClick?: (row: T) => void;
    accentColor?: (row: T) => string | undefined;
    defaultSortKey?: string;
    defaultSortDir?: "asc" | "desc";
    hideHeader?: boolean;
    dense?: boolean;
    dimmed?: (row: T) => boolean;
}

function SwirlTable<T>({
    columns,
    rows,
    rowKey,
    onRowClick,
    accentColor,
    defaultSortKey,
    defaultSortDir = "asc",
    hideHeader = false,
    dense = false,
    dimmed,
}: SwirlTableProps<T>) {
    const [sortKey, setSortKey] = useState<string>(defaultSortKey ?? "");
    const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);

    const sortableColumns = columns.filter(c => c.sortValue !== undefined);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(d => d === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir(columns.find(c => c.key === key)?.sortDescFirst ? "desc" : "asc");
        }
    };

    const sorted = useMemo(() => {
        if (!sortKey) return rows;
        const col = columns.find(c => c.key === sortKey);
        if (!col?.sortValue) return rows;
        return [...rows].sort((a, b) => {
            const av = col.sortValue!(a);
            const bv = col.sortValue!(b);
            if (av < bv) return sortDir === "asc" ? -1 : 1;
            if (av > bv) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
    }, [rows, sortKey, sortDir, columns]);

    const gridTemplateColumns = columns.map(c =>
        c.width ? (typeof c.width === "number" ? `${c.width}px` : c.width) : "1fr"
    ).join(" ");

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
            {/* header */}
            {!hideHeader && <Box sx={{
                display: "grid",
                gridTemplateColumns: accentColor ? `${ACCENT_WIDTH}px ${gridTemplateColumns}` : gridTemplateColumns,
                alignItems: "center",
                height: CHIP_HEIGHT,
                boxSizing: "border-box",
                borderRadius: 1,
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
            }}>
                {accentColor && <Box />}
                {columns.map(col => {
                    const isSortable = col.sortValue !== undefined;
                    return (
                        <Box
                            key={col.key}
                            onClick={isSortable ? () => handleSort(col.key) : undefined}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: col.align === "right" ? "flex-end" : col.align === "center" ? "center" : "flex-start",
                                gap: 0.5,
                                cursor: isSortable ? "pointer" : "default",
                                userSelect: "none",
                                "&:hover": isSortable ? { opacity: 0.7 } : {},
                                px: 1.5,
                            }}
                        >
                            <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                                {col.label}
                            </Typography>
                            {isSortable && sortKey === col.key && (
                                sortDir === "asc"
                                    ? <KeyboardArrowUpIcon sx={{ fontSize: "0.9rem", color: "text.disabled" }} />
                                    : <KeyboardArrowDownIcon sx={{ fontSize: "0.9rem", color: "text.disabled" }} />
                            )}
                        </Box>
                    );
                })}
            </Box>}

            {/* rows */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: dense ? 0.25 : 0.5 }}>
                {sorted.map((row, i) => {
                    const accent = accentColor?.(row);
                    return (
                        <RainbowCard
                            key={rowKey(row, i)}
                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: accent !== undefined ? `${ACCENT_WIDTH}px ${gridTemplateColumns}` : gridTemplateColumns,
                                alignItems: "center",
                                cursor: onRowClick ? "pointer" : "default",
                                overflow: "hidden",
                                opacity: dimmed?.(row) ? 0.45 : 1,
                            }}
                        >
                            {accent !== undefined && (
                                <Box sx={{ width: ACCENT_WIDTH, alignSelf: "stretch", backgroundColor: accent }} />
                            )}
                            {columns.map(col => (
                                <Box
                                    key={col.key}
                                    sx={{
                                        px: 1.5,
                                        py: dense ? 0.5 : 1.25,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: col.align === "right" ? "flex-end" : col.align === "center" ? "center" : "flex-start",
                                        minWidth: 0,
                                    }}
                                >
                                    {col.render(row)}
                                </Box>
                            ))}
                        </RainbowCard>
                    );
                })}
            </Box>
        </Box>
    );
}

export default SwirlTable;
