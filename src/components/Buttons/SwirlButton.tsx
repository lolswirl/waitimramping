import type React from "react";
import { Box, Button, type Theme, useTheme } from "@mui/material";
import { T } from "@util/T";
import { RAINBOW_COLORS } from "@components/Buttons/RainbowCard";
import { FONT, HAIRLINE_SOFT, INK, TINT, tintedControl } from "@components/Theme/tokens";

const REST_BORDER = "rgba(255,255,255,0.15)";
const DISABLED_INK = "rgba(255,255,255,0.22)";

// semantic colors come from the site rainbow, not the mui defaults
const SEMANTIC: Record<string, string> = {
    success: RAINBOW_COLORS[1],
    warning: RAINBOW_COLORS[2],
    info: RAINBOW_COLORS[4],
};

interface SwirlButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    selected?: boolean;
    sx?: object;
    color?: string;
    variant?: "tinted" | "nav";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    startIcon?: React.ReactNode;
}

const resolveAccent = (color: string, theme: Theme): string => {
    if (!color || color === "inherit") {
        return theme.palette.primary.main;
    }
    if (SEMANTIC[color]) {
        return SEMANTIC[color];
    }
    const palette = theme.palette as unknown as Record<string, { main?: string }>;
    return palette[color]?.main ?? color;
};

const SwirlButton: React.FC<SwirlButtonProps> = ({
    children,
    onClick,
    href,
    selected = false,
    sx,
    color = "inherit",
    variant = "tinted",
    type = "button",
    disabled = false,
    startIcon = null,
}) => {
    const theme = useTheme();
    const accent = resolveAccent(color, theme);
    const isNav = variant === "nav";
    const hasIcon = Boolean(startIcon);

    const underline = {
        content: '""',
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: accent,
        transform: selected ? "scaleX(1)" : "scaleX(0)",
        transition: "transform 0.3s ease",
    };

    const navSx = {
        color: selected ? accent : INK.secondary,
        "&::after": { ...underline, borderRadius: 1 },
        "&:hover": { color: accent },
        "&:hover::after": { transform: "scaleX(1)" },
    };

    const tintedSx = {
        ...tintedControl(accent, selected),
        ...(!selected && { color: INK.secondary, borderColor: REST_BORDER }),
        "&:hover": { borderColor: accent, color: accent },
        height: 30,
        minWidth: 0,
        p: 0,
        alignItems: "stretch",
        fontSize: FONT.small,
        overflow: "hidden",
        "& .sb-icon": {
            display: "flex",
            alignItems: "center",
            px: 0.9,
            color: accent,
            backgroundColor: accent + TINT.wash,
            borderRight: `1px solid ${REST_BORDER}`,
            "& svg": { fontSize: 15 },
        },
        "& .sb-label": {
            display: "flex",
            alignItems: "center",
            px: 1.25,
            position: "relative",
            ...(hasIcon && { "&::after": underline }),
        },
        ...(hasIcon
            ? { "&:hover .sb-label::after": { transform: "scaleX(1)" } }
            : { "&::after": underline, "&:hover::after": { transform: "scaleX(1)" } }),
        "&.Mui-disabled": {
            borderColor: HAIRLINE_SOFT,
            color: DISABLED_INK,
            "& .sb-icon": {
                backgroundColor: "transparent",
                borderRightColor: HAIRLINE_SOFT,
                color: DISABLED_INK,
            },
        },
    };

    const label = typeof children === "string" ? T(children) : children;

    return (
        <Button
            component={href ? "a" : "button"}
            href={href}
            onClick={onClick}
            disabled={disabled}
            startIcon={isNav ? startIcon : undefined}
            type={type}
            sx={{
                position: "relative",
                fontWeight: 600,
                textTransform: "none",
                transition: "color 0.2s ease, border-color 0.15s ease",
                ...(isNav ? navSx : tintedSx),
                ...sx,
            }}
        >
            {isNav ? label : (
                <>
                    {startIcon && <Box component="span" className="sb-icon">{startIcon}</Box>}
                    <Box component="span" className="sb-label">{label}</Box>
                </>
            )}
        </Button>
    );
};

export default SwirlButton;
