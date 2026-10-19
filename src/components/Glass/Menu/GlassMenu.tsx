import { Popover, type PopoverProps } from "@mui/material";
import { BLUR } from "@components/Theme/tokens";

export const GlassMenu = (props: PopoverProps) => {
    const { PaperProps, slotProps, ...otherProps } = props;

    return (
        <Popover
            {...otherProps}
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: "rgba(0, 0, 0, 0.3) !important",
                        backdropFilter: BLUR.surface,
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "none",
                        maxHeight: 400,
                        width: 'fit-content',
                        overflow: 'visible',
                        borderRadius: 1,
                        backgroundImage: 'none',
                        ...PaperProps?.sx,
                        ...(slotProps?.paper as any)?.sx,
                    }
                }
            }}
        />
    );
};
