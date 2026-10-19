"use client";
import type React from "react";
import { useState, useRef } from "react";
import { Box, Collapse, Typography, useTheme } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { CHIP_HEIGHT, FONT, TINT } from "@components/Theme/tokens";

export interface ConfigSection {
    key: string;
    title: string;
    summary: React.ReactNode;
    content: React.ReactNode;
    icon?: React.ReactNode;
    defaultOpen?: boolean;
}

interface ConfigPanelProps {
    sections: ConfigSection[];
    accent?: string;
    onReset?: () => void;
    // extra chips in the row, before the sections
    leading?: React.ReactNode;
    sx?: object;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ sections, accent, onReset, leading, sx }) => {
    const theme = useTheme();
    const accentColor = accent ?? theme.palette.primary.main;
    const [activeKey, setActiveKey] = useState<string | null>(
        (sections.find(s => s.defaultOpen) ?? sections[0])?.key ?? null
    );

    const active = sections.find(s => s.key === activeKey);
    const lastActiveRef = useRef(active);
    if (active) lastActiveRef.current = active;

    return (
        <Box sx={{ width: "100%", ...sx }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                {leading}
                {sections.map(section => {
                    const isActive = section.key === activeKey;
                    return (
                        <Box
                            key={section.key}
                            onClick={() => setActiveKey(isActive ? null : section.key)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setActiveKey(isActive ? null : section.key);
                                }
                            }}
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 1,
                                px: 1.5,
                                height: CHIP_HEIGHT,
                                boxSizing: "border-box",
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor: isActive ? accentColor : "divider",
                                backgroundColor: isActive ? accentColor + TINT.wash : "background.paper",
                                cursor: "pointer",
                                userSelect: "none",
                                whiteSpace: "nowrap",
                                transition: "border-color 0.15s ease, background-color 0.15s ease",
                                "&:hover": { borderColor: accentColor },
                            }}
                        >
                            <Box sx={{ display: "inline-flex", alignItems: "baseline", gap: 1 }}>
                                <Typography sx={{ fontSize: FONT.micro, fontWeight: 700, letterSpacing: 0.5, color: "text.disabled" }}>
                                    {section.title}
                                </Typography>
                                {section.icon && (
                                    <Box sx={{ display: "flex", alignSelf: "center", flexShrink: 0 }}>
                                        {section.icon}
                                    </Box>
                                )}
                                <Typography component="div" sx={{ fontSize: FONT.small, fontFamily: "monospace", color: "text.primary" }}>
                                    {section.summary}
                                </Typography>
                            </Box>
                            <ExpandMore sx={{
                                fontSize: 15,
                                color: "text.disabled",
                                transform: isActive ? "rotate(180deg)" : "none",
                                transition: "transform 0.2s",
                            }} />
                        </Box>
                    );
                })}
                {onReset && (
                    <Box
                        onClick={onReset}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onReset();
                            }
                        }}
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            ml: "auto",
                            px: 1,
                            cursor: "pointer",
                            userSelect: "none",
                            fontSize: FONT.micro,
                            fontWeight: 600,
                            color: "text.disabled",
                            "&:hover": { color: "text.primary" },
                        }}
                    >
                        reset
                    </Box>
                )}
            </Box>

            <Collapse in={active !== undefined}>
                <Box sx={{
                    mt: 1,
                    p: 2,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                }}>
                    {(active ?? lastActiveRef.current)?.content}
                </Box>
            </Collapse>
        </Box>
    );
};

export default ConfigPanel;
