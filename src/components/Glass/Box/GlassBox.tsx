import { Box, type BoxProps } from "@mui/material";
import { BLUR } from "@components/Theme/tokens";

interface GlassBoxProps extends BoxProps {
    children: React.ReactNode;
    showOnMobile?: boolean;
    showOnDesktop?: boolean;
}

export const GlassBox = ({
    children,
    showOnMobile = true,
    showOnDesktop = true,
    sx,
    ...props
}: GlassBoxProps) => {
    const getDisplay = () => {
        if (showOnMobile && showOnDesktop) return "flex";
        if (showOnMobile && !showOnDesktop) return { xs: "flex", md: "none" };
        if (!showOnMobile && showOnDesktop) return { xs: "none", md: "flex" };
        return "none";
    };

    return (
        <Box
            {...props}
            sx={{
                position: 'relative',
                zIndex: 1,
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: BLUR.surface,
                ml: 1,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                border: '1px solid rgba(255,255,255,0.1)',
                display: getDisplay(),
                alignItems: 'center',
                justifyContent: 'center',
                height: 'fit-content',
                ...sx,
            }}
        >
            {children}
        </Box>
    );
};
