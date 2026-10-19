import type React from 'react';
import { Chip, type SxProps, type Theme } from '@mui/material';
import { TINT, tintAlpha } from '@components/Theme/tokens';

interface SwirlChipProps {
    message: string;
    size?: 'small' | 'medium';
    showIcon?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    borderColor?: string;
    fontSize?: string;
    variant?: 'outlined' | 'filled';
    onClick?: () => void;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    sx?: SxProps<Theme>;
}

const SwirlChip: React.FC<SwirlChipProps> = ({ 
    message, 
    size = 'small',
    showIcon = false,
    icon = '⚠︎',
    iconPosition = 'left',
    borderColor,
    fontSize = '0.875rem',
    variant = 'outlined',
    onClick,
    color,
    sx = {},
}) => {
    const isStringIcon = typeof icon === 'string';
    const displayMessage = (showIcon && isStringIcon) ? `${icon} ${message}` : message;
    
    const hasCustomColor = borderColor !== undefined;
    
    const customSx: SxProps<Theme> = {
        fontSize: fontSize,
        fontWeight: 500,
        maxWidth: 'none',
        height: 'auto',
        '& .MuiChip-label': {
            px: 1,
            overflow: 'visible',
            whiteSpace: 'normal',
            textAlign: 'center',
        },
        '& .MuiChip-icon': {
            fontSize: fontSize,
            marginLeft: '4px',
            color: 'inherit',
        },
        // deleteIcon used to pseudo-position icons on the right side via MUI
        '& .MuiChip-deleteIcon': {
            fontSize: fontSize,
            marginRight: '4px',
            color: 'inherit',
            opacity: 1,
            pointerEvents: 'none',
            '&:hover': {
                color: 'inherit',
                opacity: 1,
            },
        },
        borderRadius: "4px",
        ...(hasCustomColor && {
            color: borderColor,
            borderColor: tintAlpha(borderColor!, TINT.restBorder),
            backgroundColor: tintAlpha(borderColor!, TINT.wash),
            '&:hover': {
                backgroundColor: tintAlpha(borderColor!, TINT.hoverWash),
            },
        }),
        ...(onClick && { cursor: 'pointer' }),
        ...sx
    };
    
    const iconElement = (showIcon && !isStringIcon) ? icon as React.ReactElement : undefined;
    
    return (
        <Chip 
            label={(displayMessage)}
            icon={iconPosition === 'left' ? iconElement : undefined}
            deleteIcon={iconPosition === 'right' ? iconElement : undefined}
            onDelete={iconPosition === 'right' && iconElement ? () => {} : undefined}
            size={size}
            variant={variant}
            onClick={onClick}
            color={color}
            sx={customSx}
        />
    );
};

export default SwirlChip;
