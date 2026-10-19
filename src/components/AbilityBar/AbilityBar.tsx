import type React from "react";
import { Box, Typography } from "@mui/material";
import SwirlChip from "@components/SwirlChip/SwirlChip";
import { formatPercent } from "@util/stringManipulation";

interface AbilityBarProps {
  pct: number; // 0–1, fraction of the reference total
  color: string;
  label: string;
  sublabel?: string;
  dimmed?: boolean;
  labelSuffix?: React.ReactNode;
}

const AbilityBar: React.FC<AbilityBarProps> = ({ pct, color, label, sublabel, dimmed = false, labelSuffix }) => (
  <Box sx={{ flex: 1 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: dimmed ? 'text.secondary' : 'text.primary' }}>
          {label}
        </Typography>
        {labelSuffix}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        {sublabel && (
          <Typography variant="caption" sx={{ color, fontWeight: 700, opacity: dimmed ? 0.7 : 1 }}>
            {sublabel}
          </Typography>
        )}
        <SwirlChip message={formatPercent(pct * 100, 1)} borderColor={color} fontSize="0.7rem" />
      </Box>
    </Box>
    <Box sx={{ position: 'relative', height: dimmed ? 4 : 6, borderRadius: '2px', bgcolor: 'rgba(255,255,255,0.08)' }}>
      <Box sx={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: `${Math.min(pct * 100, 100)}%`,
        borderRadius: '2px',
        bgcolor: color,
        opacity: dimmed ? 0.5 : 0.85,
      }} />
    </Box>
  </Box>
);

export default AbilityBar;
