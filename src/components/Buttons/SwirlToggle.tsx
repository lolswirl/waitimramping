"use client";
import type React from 'react';
import { Switch, type SxProps, type Theme } from '@mui/material';

interface SwirlToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    sx?: SxProps<Theme>;
}

const SwirlToggle: React.FC<SwirlToggleProps> = ({ checked, onChange, sx }) => {
    return (
        <Switch
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            sx={{
                width: 36,
                height: 20,
                p: 0,
                '& .MuiSwitch-switchBase': {
                    p: '2px',
                    '&.Mui-checked': {
                        transform: 'translateX(16px)',
                        color: 'primary.main',
                    },
                },
                '& .MuiSwitch-track': {
                    borderRadius: 1,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    opacity: 1,
                    boxSizing: 'border-box',
                },
                '& .MuiSwitch-thumb': {
                    width: 16,
                    height: 16,
                    borderRadius: 0.5,
                    backgroundColor: 'rgba(180,180,180,0.7)',
                    boxShadow: 'none',
                },
                '& .Mui-checked .MuiSwitch-thumb': {
                    backgroundColor: 'primary.main',
                },
                '&.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    opacity: 1,
                },
                ...sx,
            }}
        />
    );
};

export default SwirlToggle;
