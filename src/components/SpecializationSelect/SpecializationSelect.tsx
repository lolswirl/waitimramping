"use client";
import type React from 'react';
import { useState } from 'react';
import { FormControl, InputLabel, MenuItem, Box, MenuList } from '@mui/material';
import Select from '@mui/material/Select';
import { GlassMenu } from '@components/Glass';

import SpecDisplay from "@components/SpecializationSelect/SpecDisplay";

import { type specialization, getSpecs, getSpecializationByKey } from '@data/class';
import { KeyboardArrowDown } from '@mui/icons-material';
import { BLUR, FIELD_HEIGHT, FONT } from "@components/Theme/tokens";

interface SpecializationSelectProps {
  selectedSpec: specialization;
  onSpecChange: (spec: specialization) => void;
  size?: "small" | "medium";
  short?: boolean;
  withLabel?: boolean;
  height?: number;
}

const SpecializationSelect: React.FC<SpecializationSelectProps> = ({
  selectedSpec,
  onSpecChange,
  size = "medium",
  short = false,
  withLabel = false,
  height = FIELD_HEIGHT,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSpecChange = (spec: specialization) => {
    onSpecChange(spec);
    handleClose();
  };

  if (short) {
    return (
      <>
        <Box
          onClick={handleClick}
          sx={withLabel ? {
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            height: height,
            boxSizing: 'border-box',
            width: 'fit-content',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            color: 'text.primary',
            fontSize: FONT.small,
            transition: 'border-color 0.2s ease',
            '&:hover': { borderColor: 'text.secondary' },
          } : {
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            transition: 'transform 0.15s ease',
            '&:hover': { transform: 'scale(1.06)' },
          }}
        >
          <SpecDisplay spec={selectedSpec} short={!withLabel} />
          {withLabel && <KeyboardArrowDown sx={{ fontSize: 18, opacity: 0.5, transition: 'transform 0.2s ease', transform: open ? 'rotate(90deg)' : 'none' }} />}
        </Box>
        
        <GlassMenu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{ paper: { sx: { minWidth: anchorEl?.offsetWidth } } }}
        >
          <MenuList dense>
            {getSpecs().map((spec, index) => (
              <MenuItem 
                key={index} 
                onClick={() => handleSpecChange(spec)}
                selected={selectedSpec.class === spec.class && selectedSpec.name === spec.name}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  },
                }}
              >
                <SpecDisplay spec={spec} />
              </MenuItem>
            ))}
          </MenuList>
        </GlassMenu>
      </>
    );
  }

  return (
    <FormControl sx={{ minWidth: 150, height: 100 }} size={size}>
      <InputLabel id="spec-select-label">Specialization</InputLabel>
      <Select
        labelId="spec-select-label"
        id="spec-select"
        value={`${selectedSpec.class.toLowerCase()}_${selectedSpec.name.toLowerCase()}`}
        onChange={(e) => {
          const spec = getSpecializationByKey(e.target.value as string);
          if (spec) onSpecChange(spec);
        }}
        autoWidth
        label={("Specialization")}
        sx={{ height: height }}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                backgroundColor: "rgba(0, 0, 0, 0.3) !important",
                backdropFilter: BLUR.surface,
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "none",
                maxHeight: 400,
                borderRadius: 1,
                backgroundImage: 'none',
              }
            }
          }
        }}
      >
        {getSpecs().map((spec, index) => (
          <MenuItem 
            key={index} 
            value={`${spec.class.toLowerCase()}_${spec.name.toLowerCase()}`}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              },
            }}
          >
            <SpecDisplay spec={spec} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SpecializationSelect;
