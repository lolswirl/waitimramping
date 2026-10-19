import type React from "react";
import { Typography, type TypographyProps } from "@mui/material";

const Code: React.FC<TypographyProps> = ({ sx, ...rest }) => (
    <Typography
        component="code"
        sx={[
            {
                fontFamily: "monospace",
                backgroundColor: "rgba(255,255,255,0.08)",
                px: 0.75,
                py: 0.25,
                borderRadius: 0.5,
                fontSize: "0.85em",
            },
            ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...rest}
    />
);

export default Code;
