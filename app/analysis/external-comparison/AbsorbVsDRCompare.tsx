"use client";
import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { TextField, Box, Container, Typography, useTheme } from "@mui/material";

import PageHeader from "@components/PageHeader/PageHeader";

import { T } from "@util/T";
import { formatNumber } from "@util/stringManipulation";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AbsorbVsDRCompare: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
  const [absorbValue, setAbsorbValue] = useState(253000);
  const [damageReduction, setDamageReduction] = useState(40.5);
  const [maxXAxis, setMaxXAxis] = useState(1000000);
  const [intersectionPoint, setIntersectionPoint] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

  const theme = useTheme();

  const damageValues = useMemo(() => Array.from({ length: Math.floor(maxXAxis / 20000) + 1 }, (_, i) => i * 20000), [maxXAxis]);

  const absorbDamageIntake = useMemo(() => {
    return damageValues.map(
      (value) => (value <= absorbValue ? 0 : value - absorbValue)
    );
  }, [absorbValue, damageValues]);

  const reductionDamageIntake = useMemo(() => {
    return damageValues.map((value) => value * (1 - damageReduction / 100));
  }, [damageReduction, damageValues]);

  useEffect(() => {
    let intersectX: number | null = null;
    let intersectY: number | null = null;
  
    for (let i = 0; i < damageValues.length; i++) {
      if (reductionDamageIntake[i] < absorbDamageIntake[i]) {
        intersectX = damageValues[i];
        intersectY = reductionDamageIntake[i];
        break;
      }
    }
  
    setIntersectionPoint({
      x: intersectX,
      y: intersectY,
    });
  }, [absorbValue, damageReduction, damageValues, absorbDamageIntake, reductionDamageIntake]);


  const chartData = useMemo(() => ({
    labels: damageValues.map((value) => formatNumber(value)),
    datasets: [
      {
        label: T(`${formatNumber(absorbValue)} Absorb`),
        data: absorbDamageIntake,
        borderColor: "rgba(255, 99, 132, 0.6)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
      {
        label: T(`${formatNumber(damageReduction, 1)}% damage reduction`),
        data: reductionDamageIntake,
        borderColor: "rgba(53, 162, 235, 0.6)",
        backgroundColor: "rgba(53, 162, 235, 0.2)",
        fill: true,
      },
      {
        label: T("No mitigation"),
        data: damageValues,
        borderColor: "rgba(75, 192, 192, 0.6)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
        borderDash: [5, 5],
      },
    ],
  }), [absorbValue, damageReduction, absorbDamageIntake, reductionDamageIntake, damageValues]);

  return (
    <Container sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
      <PageHeader
        title={title}
        subtitle={description}
      />

      <Box sx={{ height: "100%", width: "100%", display: "flex", justifyContent: "center" }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            scales: {
              x: {
                title: { display: true, text: T("Incoming Damage") },
                grid: {
                  color: theme.custom.chart.gridColor,
                },
              },
              y: {
                title: { display: true, text: T("Damage Taken") },
                max: maxXAxis,
                grid: {
                  color: theme.custom.chart.gridColor,
                },
              },
            },
          }}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, width: "75%", justifyContent: "center" }}>
        <TextField
          label={T("Absorb Value")}
          variant="outlined"
          value={absorbValue}
          onChange={(e) => setAbsorbValue(parseFloat(e.target.value) || 0)}
          type="number"
          fullWidth
        />
        <TextField
          label={T("Damage Reduction (%)")}
          variant="outlined"
          value={damageReduction}
          onChange={(e) => setDamageReduction(parseFloat(e.target.value) || 0)}
          type="number"
          fullWidth
        />
        <TextField
          label={T("Max Axis")}
          variant="outlined"
          value={maxXAxis}
          onChange={(e) => setMaxXAxis(parseFloat(e.target.value) || 10)}
          type="number"
          fullWidth
        />
      </Box>

      {intersectionPoint.x !== null && intersectionPoint.y !== null && (
        <Typography variant="body1">
          
            Damage Reduction becomes better than Absorb at {formatNumber(intersectionPoint.x)} damage ({formatNumber(intersectionPoint.y)} damage intake).
          
        </Typography>
      )}
    </Container>
  );
};

export default AbsorbVsDRCompare;

