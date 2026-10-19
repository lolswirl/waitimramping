import type React from "react";
import { Typography, type TypographyProps } from "@mui/material";

interface SwirlLinkProps extends Omit<TypographyProps<"a">, "component"> {
    href: string;
}

const SwirlLink: React.FC<SwirlLinkProps> = ({ href, sx, ...rest }) => (
    <Typography
        component="a"
        href={href}
        sx={[
            { color: "primary.light", textDecoration: "none", "&:hover": { textDecoration: "underline wavy" } },
            ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...rest}
    />
);

export default SwirlLink;
