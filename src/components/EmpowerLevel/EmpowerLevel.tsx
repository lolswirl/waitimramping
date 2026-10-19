import type React from "react";
import { Button, Box, useTheme } from "@mui/material";
import { FONT, TINT, tintedControl } from "@components/Theme/tokens";

import { toRomanNumeral } from "@util/toRomanNumeral";

interface EmpowerLevelButtonsProps {
    setEmpowerLevel: (level: number) => void;
    iconSize?: number;
    levels?: number[];
}

const EmpowerLevelButtons: React.FC<EmpowerLevelButtonsProps> = ({
    setEmpowerLevel,
    iconSize = 36,
    levels = [1, 2, 3, 4, 5],
}) => {
    const theme = useTheme();
    const accent = theme.palette.primary.main;

    return (
        <Box sx={{ display: "flex", gap: 1.5 }}>
            {levels.map((level) => (
                <Button
                    key={level}
                    variant="outlined"
                    onClick={() => setEmpowerLevel(level)}
                    sx={{
                        ...tintedControl(accent),
                        minWidth: 36,
                        minHeight: 36,
                        width: iconSize,
                        height: iconSize,
                        fontSize: FONT.small,
                        fontWeight: 700,
                        p: 0,
                        "&:hover": {
                            borderColor: accent,
                            backgroundColor: accent + TINT.wash,
                        },
                    }}
                >
                    {toRomanNumeral(level)}
                </Button>
            ))}
        </Box>
    );
};

export default EmpowerLevelButtons;
