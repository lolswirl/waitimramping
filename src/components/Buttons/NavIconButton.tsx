import { IconButton, type IconButtonProps } from "@mui/material";

interface NavIconButtonProps extends Omit<IconButtonProps, 'sx'> {
    hoverColor?: string;
    enableLift?: boolean;
    initialColor?: string;
    children: React.ReactNode;
    href?: string;
    target?: string;
    rel?: string;
}

export const NavIconButton = ({ 
    hoverColor = "rgba(255, 255, 255, 0.8)", 
    enableLift = false,
    initialColor = "white",
    children, 
    ...props 
}: NavIconButtonProps) => {
    return (
        <IconButton
            {...props}
            sx={{
                color: initialColor,
                transition: "color 0.3s ease, transform 0.3s ease",
                backgroundColor: "transparent",
                "&:hover": {
                    color: hoverColor,
                    transform: enableLift ? "translateY(-2px)" : "none",
                    backgroundColor: "transparent",
                },
            }}
        >
            {children}
        </IconButton>
    );
};
