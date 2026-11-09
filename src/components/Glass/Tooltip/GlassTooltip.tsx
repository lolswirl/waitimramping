import { Box, Tooltip, type TooltipProps } from "@mui/material";
import { BLUR, HAIRLINE } from "@components/Theme/tokens";

// solid so it covers the box border where the arrow joins it
const ARROW_FILL = "#0d0d0d";

export const GlassTooltip = (props: TooltipProps) => {
    const { slotProps, ...otherProps } = props;
    
    return (
        <Tooltip
            {...otherProps}
            arrow
            disableInteractive
            slotProps={{
                ...slotProps,
                tooltip: {
                    ...slotProps?.tooltip,
                    sx: {
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        backdropFilter: BLUR.surface,
                        border: `1px solid ${HAIRLINE}`,
                        boxShadow: "none",
                        ...((slotProps?.tooltip as any)?.sx),
                    }
                },
                arrow: {
                    ...slotProps?.arrow,
                    sx: {
                        color: ARROW_FILL,
                        "&::before": {
                            border: `1px solid ${HAIRLINE}`,
                        }
                    }
                },
                popper: {
                    ...(slotProps?.popper as any),
                    modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, -5],
                        },
                    },
                ],
                }
            }}
        />
    );
};

export const GlassTooltipRule = () => <Box sx={{ gridColumn: "1 / -1", height: "1px", backgroundColor: HAIRLINE, my: 0.25 }} />;
