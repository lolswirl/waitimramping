import type React from "react";
import { Card, type CardProps } from "@mui/material";

export const RAINBOW_COLORS = ["#7ee5ff", "#89ff7f", "#ffd700", "#ff69b4", "#d0a3ff"];
export const RAINBOW_GRADIENT = `linear-gradient(90deg, ${RAINBOW_COLORS.map((color, index) => 
  `${color} ${Math.floor((index / (RAINBOW_COLORS.length - 1)) * 100)}%`
).join(', ')})`;

interface RainbowCardProps extends Omit<CardProps, "ref"> {
    href?: string;
}

const RainbowCard: React.FC<RainbowCardProps> = ({ sx, children, href, ...rest }) => {
    const linkProps = href ? { component: "a" as React.ElementType, href } : {};

    return (
        <Card
            {...linkProps}
            sx={[
                (theme) => ({
                    border: "1px solid transparent",
                    background: `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}) padding-box, linear-gradient(${theme.palette.divider}, ${theme.palette.divider}) border-box`,
                    transition: "background 0.2s ease",
                    cursor: href ? "pointer" : "default",
                    textDecoration: "none",
                    "&:hover": {
                        background: `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}) padding-box, ${RAINBOW_GRADIENT} border-box`,
                    },
                }),
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...rest}
        >
            {children}
        </Card>
    );
};

export default RainbowCard;
