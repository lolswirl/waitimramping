import type React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { CHANGELOG } from "@data/changelog";
import { formatDate } from "@util/stringManipulation";

const MAX_ENTRIES = 5;

const Changelog: React.FC = () => {
    return (
        <Stack spacing={1.5}>
            {CHANGELOG.slice(0, MAX_ENTRIES).map((entry, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ minWidth: 80, pt: 0.3, whiteSpace: 'nowrap' }}>
                        {formatDate(entry.date)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {entry.text}
                    </Typography>
                </Box>
            ))}
        </Stack>
    );
};

export default Changelog;
