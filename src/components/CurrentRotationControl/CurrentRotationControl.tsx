import type React from 'react';
import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography
} from '@mui/material';
import { Add, DeleteForever, DeleteTwoTone } from '@mui/icons-material';
import SpellButton from '../SpellButtons/SpellButton';
import { toRomanNumeral } from '../../util/toRomanNumeral';
import type Spell from "../../data/spells/spell";
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import SwirlButton from '../Buttons/SwirlButton';
import { FONT } from "@components/Theme/tokens";

interface CurrentRotationControlProps {
    children?: React.ReactNode;
    currentRotation: Spell[];
    onRemoveSpell: (spell: Spell) => void;
    onFinalizeRotation: () => void;
    onClearCurrentRotation: () => void;
    onClearAllRotations: () => void;
    hasRotations: boolean;
    onReorderRotation?: (newRotation: Spell[]) => void;
}

const CurrentRotationControl: React.FC<CurrentRotationControlProps> = ({
    children,
    currentRotation,
    onRemoveSpell,
    onFinalizeRotation,
    onClearCurrentRotation,
    onClearAllRotations,
    hasRotations,
    onReorderRotation,
}) => {
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const reordered = Array.from(currentRotation);
        const [removed] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, removed);
        if (onReorderRotation) onReorderRotation(reordered);
    };

    return (
        <Stack direction="column" alignItems="center" spacing={1}>
            <Card variant="outlined" sx={{ width: "100%", mb: 0 }}>
                <CardContent sx={{ p: 0, height: 60 }}>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="rotation-droppable" direction="horizontal">
                            {(provided) => (
                                <Box
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: 60,
                                        gap: 0.5,
                                        p: 0,
                                    }}
                                >
                                    {currentRotation.length > 0 ? (
                                        currentRotation.map((spell, idx) => (
                                            <Draggable key={spell.uuid ?? `spell-${idx}`} draggableId={spell.uuid ?? `spell-${idx}`} index={idx}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            display: 'inline-block',
                                                            opacity: snapshot.isDragging ? 0.7 : 1,
                                                            position: 'relative',
                                                            verticalAlign: 'middle',
                                                            ...provided.draggableProps.style,
                                                        }}
                                                    >
                                                        <SpellButton
                                                            selectedSpell={spell}
                                                            action={() => onRemoveSpell(spell)}
                                                            isRemove={true}
                                                        />
                                                        {spell.empowerLevel && (
                                                            <Box
                                                                style={{
                                                                    position: "absolute",
                                                                    bottom: -2,
                                                                    right: -2,
                                                                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                                                                    color: "white",
                                                                    fontSize: FONT.small,
                                                                    fontWeight: "bold",
                                                                    padding: "2px 4px",
                                                                    borderRadius: 1,
                                                                }}
                                                            >
                                                                {toRomanNumeral(spell.empowerLevel)}
                                                            </Box>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))
                                    ) : (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                height: "100%",
                                                m: 0,
                                                p: 0,
                                            }}
                                        >
                                            <Typography variant="body2" color="textSecondary">
                                                No spells added
                                            </Typography>
                                        </Box>
                                    )}
                                    {provided.placeholder}
                                </Box>
                            )}
                        </Droppable>
                    </DragDropContext>
                </CardContent>
            </Card>
            <Stack direction="row" spacing={0.5} sx={{ mb: 0 }}>
                <SwirlButton
                    key={"add-rotation"}
                    color="primary"
                    onClick={onFinalizeRotation}
                    disabled={currentRotation.length === 0}
                    startIcon={<Add />}
                >
                    Add Rotation
                </SwirlButton>
                <SwirlButton
                    key={"clear-current"}
                    color="error"
                    onClick={onClearCurrentRotation}
                    disabled={currentRotation.length === 0}
                    startIcon={<DeleteTwoTone />}
                >
                    Clear Current
                </SwirlButton>
                <SwirlButton
                    key={"clear-all"}
                    color="error"
                    onClick={onClearAllRotations}
                    disabled={!hasRotations}
                    startIcon={<DeleteForever />}
                >
                    Clear All
                </SwirlButton>
                {children}
            </Stack>
        </Stack>
    );
};

export default CurrentRotationControl;