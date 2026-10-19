import { IconButton, type IconButtonProps, type SxProps, type Theme, useTheme } from "@mui/material";
import { HAIRLINE_SOFT, TINT, tintedControl } from "@components/Theme/tokens";

interface SwirlIconButtonProps extends Omit<IconButtonProps, 'sx'> {
    tint?: 'default' | 'danger' | 'warning' | 'primary';
    width?: number | string;
    height?: number | string;
    sx?: SxProps<Theme>;
}

// the neutral tint has no accent to derive from, so it keeps its own ladder
const NEUTRAL = {
    border: 'rgba(255,255,255,0.15)',
    color: 'text.secondary',
    hoverBorder: 'rgba(255,255,255,0.35)',
    hoverBg: 'rgba(255,255,255,0.08)',
};

export const SwirlIconButton = ({
    tint = 'default',
    width,
    height,
    sx,
    ...props
}: SwirlIconButtonProps) => {
    const theme = useTheme();
    const accent = tint === 'danger' ? theme.palette.error.main
        : tint === 'warning' ? theme.palette.warning.main
        : tint === 'primary' ? theme.palette.primary.main
        : null;

    const base = accent
        ? {
            ...tintedControl(accent),
            '&:hover': { borderColor: accent, backgroundColor: accent + TINT.wash },
        }
        : {
            color: NEUTRAL.color,
            border: '1px solid',
            borderColor: NEUTRAL.border,
            borderRadius: 1,
            transition: 'border-color 0.2s ease, background-color 0.2s ease',
            '&:hover': { borderColor: NEUTRAL.hoverBorder, backgroundColor: NEUTRAL.hoverBg },
        };

    return (
        <IconButton
            size="small"
            {...props}
            sx={[
                {
                    ...(width  !== undefined && { width  }),
                    ...(height !== undefined && { height }),
                    p: 0.5,
                    ...base,
                    '&.Mui-disabled': {
                        borderColor: HAIRLINE_SOFT,
                        color: 'rgba(255,255,255,0.22)',
                    },
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        />
    );
};
