"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Box, InputBase, MenuItem, MenuList, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { ExpandMore } from "@mui/icons-material";
import { GlassMenu } from "@components/Glass";
import SpecDisplay from "@components/SpecializationSelect/SpecDisplay";
import { CHIP_HEIGHT, FONT, ICON, RADIUS, TINT } from "@components/Theme/tokens";
import { type specialization, getSpecs, getSpecializationByKey } from "@data/class";
import { iconLocalUrl, iconFallbackUrl } from "@util/wowhead";

const chipTitle = { fontSize: FONT.micro, fontWeight: 700, letterSpacing: 0.5, color: "text.disabled" };
const chipValue = { fontSize: FONT.small, fontFamily: "monospace", color: "text.primary", textTransform: "lowercase" };

const chipText = { display: "inline-flex", alignItems: "baseline", gap: 1, minWidth: 0 };

const filterChip = (accent: string, active: boolean) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    px: 1.5,
    height: CHIP_HEIGHT,
    boxSizing: "border-box",
    borderRadius: 1,
    border: "1px solid",
    borderColor: active ? accent : "divider",
    backgroundColor: active ? accent + TINT.wash : "background.paper",
    userSelect: "none",
    whiteSpace: "nowrap",
    transition: "border-color 0.15s ease, background-color 0.15s ease",
    "&:hover": { borderColor: accent },
});

interface SearchChipProps {
    accent: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    sx?: SxProps<Theme>;
}

const SEARCH_DELAY_MS = 150;

export const SearchChip: React.FC<SearchChipProps> = ({ accent, value, onChange, placeholder, sx }) => {
    const [text, setText] = useState(value);
    const emitted = useRef(value);

    // pick up outside changes (reset, url) without clobbering what is being typed
    useEffect(() => {
        if (value !== emitted.current) {
            emitted.current = value;
            setText(value);
        }
    }, [value]);

    useEffect(() => {
        if (text === emitted.current) return;
        const timer = setTimeout(() => {
            emitted.current = text;
            onChange(text);
        }, SEARCH_DELAY_MS);
        return () => clearTimeout(timer);
    }, [text, onChange]);

    return (
        <Box
            component="label"
            sx={[
                { ...filterChip(accent, text !== ""), cursor: "text", "&:focus-within": { borderColor: accent } },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        >
            <Box sx={{ ...chipText, flex: 1 }}>
                <Typography sx={chipTitle}>search</Typography>
                <InputBase
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={placeholder}
                    sx={{ ...chipValue, textTransform: "none", lineHeight: 1.5, flex: 1, minWidth: 120, "& input": { p: 0, height: "auto" } }}
                />
            </Box>
        </Box>
    );
};

export interface SelectChipOption {
    value: string;
    label: React.ReactNode;
    sx?: SxProps;
}

interface SelectChipProps {
    accent: string;
    title: string;
    value: string;
    options: SelectChipOption[];
    onChange: (value: string) => void;
    active?: boolean;
    // replaces the selected option's label inside the chip
    display?: React.ReactNode;
    icon?: React.ReactNode;
}

export const SelectChip: React.FC<SelectChipProps> = ({ accent, title, value, options, onChange, active = false, display, icon }) => {
    const [anchor, setAnchor] = useState<null | HTMLElement>(null);
    const selected = options.find(o => o.value === value);

    return (
        <>
            <Box
                onClick={e => setAnchor(e.currentTarget)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setAnchor(e.currentTarget);
                    }
                }}
                sx={{ ...filterChip(accent, active), cursor: "pointer" }}
            >
                <Box sx={chipText}>
                    <Typography sx={chipTitle}>{title}</Typography>
                    {icon && <Box sx={{ display: "flex", alignSelf: "center", flexShrink: 0 }}>{icon}</Box>}
                    <Typography component="div" sx={chipValue}>{display ?? selected?.label ?? value}</Typography>
                </Box>
                <ExpandMore sx={{
                    fontSize: 15,
                    color: "text.disabled",
                    transform: anchor ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                }} />
            </Box>
            <GlassMenu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                slotProps={{ paper: { sx: { minWidth: anchor?.offsetWidth } } }}
            >
                <MenuList dense>
                    {options.map(opt => (
                        <MenuItem
                            key={opt.value}
                            selected={opt.value === value}
                            onClick={() => { onChange(opt.value); setAnchor(null); }}
                            sx={{
                                ...chipValue,
                                "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
                                "&.Mui-selected": {
                                    backgroundColor: "rgba(255,255,255,0.12)",
                                    "&:hover": { backgroundColor: "rgba(255,255,255,0.16)" },
                                },
                                ...opt.sx,
                            }}
                        >
                            {opt.label}
                        </MenuItem>
                    ))}
                </MenuList>
            </GlassMenu>
        </>
    );
};

interface SpecChipProps {
    accent: string;
    spec: specialization;
    onChange: (spec: specialization) => void;
}

export const SpecChip: React.FC<SpecChipProps> = ({ accent, spec, onChange }) => (
    <SelectChip
        accent={accent}
        title="spec"
        value={spec.key}
        options={getSpecs().map(s => ({ value: s.key, label: <SpecDisplay spec={s} /> }))}
        onChange={key => {
            const next = getSpecializationByKey(key);
            if (next) onChange(next);
        }}
        display={spec.name}
        icon={
            <Box
                component="img"
                src={iconLocalUrl(spec.icon)}
                alt=""
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = iconFallbackUrl(spec.icon); }}
                sx={{ width: ICON.xs, height: ICON.xs, borderRadius: `${RADIUS.control}px`, display: "block" }}
            />
        }
    />
);
