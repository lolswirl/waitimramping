import type React from "react";
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Fade,
} from "@mui/material";
import EmpowerLevelButtons from "./EmpowerLevel";
import SpellButton from "@components/SpellButtons/SpellButton";
import type spell from "@data/spells/spell";
import { BLUR } from "@components/Theme/tokens";

interface EmpowerLevelDialogProps {
    open: boolean;
    spell: spell | null;
    onSelect: (level: number) => void;
    onClose: () => void;
}

const EmpowerLevelDialog: React.FC<EmpowerLevelDialogProps> = ({
    open,
    spell,
    onSelect,
    onClose,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slots={{
                transition: Fade,
            }}
            slotProps={{
                transition: {
                    timeout: 200,
                },
            }}
            PaperProps={{
                elevation: 8,
                sx: {
                    borderRadius: 1,
                    width: 'auto',
                    backgroundColor: "rgba(26, 26, 26, 0.2)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
                    overflow: "hidden",
                },
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: BLUR.surface,
                },
            }}
        >
            <DialogContent
                sx={{
                    p: 2,
                    backgroundColor: "rgba(18, 18, 18, 0.6)",
                    color: "white",
                }}
            >
                {spell && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 2,
                        }}
                    >
                        <SpellButton
                            selectedSpell={spell}
                        />
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: "white",
                                }}
                            >
                                {spell.name}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "rgba(255,255,255,0.7)",
                                }}
                            >
                                Select an empower level to add to this spell
                            </Typography>
                        </Box>
                    </Box>
                )}

                <Box
                    sx={{
                        mt: 1.5,
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <EmpowerLevelButtons
                        setEmpowerLevel={onSelect}
                        iconSize={40}
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default EmpowerLevelDialog;
