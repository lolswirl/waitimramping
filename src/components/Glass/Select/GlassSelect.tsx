"use client";
import type React from 'react';
import { useState } from 'react';
import { Box, MenuList, MenuItem, Typography } from '@mui/material';
import { GlassMenu } from '@components/Glass/Menu';
import type { SxProps } from '@mui/material/styles';
import { KeyboardArrowDown } from '@mui/icons-material';
import { CONTROL_HEIGHT, FONT } from "@components/Theme/tokens";

export interface GlassSelectOption {
    value: string;
    label: string;
    sx?: SxProps;
}

interface GlassSelectProps {
    value: string;
    options: GlassSelectOption[];
    onChange: (value: string) => void;
    label?: string;
}

const GlassSelect: React.FC<GlassSelectProps> = ({ value, options, onChange, label }) => {
    const [anchor, setAnchor] = useState<null | HTMLElement>(null);
    const open = Boolean(anchor);
    const selected = options.find(o => o.value === value);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {label && (
                <Typography variant="caption" sx={{ fontSize: FONT.micro, fontWeight: 600, opacity: 0.45, px: 0.5 }}>
                    {label}
                </Typography>
            )}
            <Box
                onClick={(e) => setAnchor(e.currentTarget)}
                sx={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    minHeight: CONTROL_HEIGHT,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    fontSize: FONT.small,
                    whiteSpace: 'nowrap',
                    transition: 'border-color 0.2s ease',
                    userSelect: 'none',
                    '&:hover': { borderColor: 'text.secondary' },
                }}
            >
                <Typography variant="inherit" color={selected ? 'text.primary' : 'text.secondary'}>
                    {selected?.label ?? value}
                </Typography>
                <KeyboardArrowDown sx={{
                    fontSize: 18,
                    opacity: 0.5,
                    ml: 'auto',
                    transition: 'transform 0.2s ease',
                    transform: open ? 'rotate(90deg)' : 'none',
                }} />
            </Box>
            <GlassMenu
                anchorEl={anchor}
                open={open}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{ paper: { sx: { minWidth: anchor?.offsetWidth } } }}
            >
                <MenuList dense>
                    {options.map((opt) => (
                        <MenuItem
                            key={opt.value}
                            selected={opt.value === value}
                            onClick={() => { onChange(opt.value); setAnchor(null); }}
                            sx={{
                                fontSize: FONT.small,
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(255,255,255,0.12)',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.16)' },
                                },
                                ...opt.sx,
                            }}
                        >
                            {opt.label}
                        </MenuItem>
                    ))}
                </MenuList>
            </GlassMenu>
        </Box>
    );
};

export default GlassSelect;
