import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";
import { ArrowUpward, ArrowDownward, Delete } from "@mui/icons-material";
import { SwirlIconButton } from "@components/Buttons/SwirlIconButton";

import type spell from '@data/spells/spell';
import { calculateCastTime, calculateGCD } from '@data/spells/spell';
import type { specialization } from "@data/class";
import { applyBuffEffects } from '@data/buffs';

import { iconLocalUrl, iconFallbackUrl } from '@util/wowhead';
import { toRomanNumeral } from "@util/toRomanNumeral";

const RECT_HEIGHT = 35;
const ROW_PADDING = 20;
const ROW_TOTAL_HEIGHT = RECT_HEIGHT + ROW_PADDING;
const TRANSITION_DURATION = 500;

const GREY = "#575757";
const LIGHT_GREY = "#a3a3a3";
const ORANGE = "#f8b700";
const LIGHT_ORANGE = "#ffde00";

interface RotationWithId {
  id: string;
  steps: spell[];
}

interface TimelineVisualizerProps {
  selectedSpec: specialization;
  haste: number;
  rotations: RotationWithId[];
  onRemoveRotation: (id: string) => void;
  onMoveRotationUp: (id: string) => void;
  onMoveRotationDown: (id: string) => void;
}

interface IconProps {
  graph: any,
  x: number,
  y: number,
  ability: spell,
  xOffset: number,
  rotationIndex: number,
  imageIndex: number;
}

export default function TimelineVisualizer({ selectedSpec, haste, rotations = [], onRemoveRotation, onMoveRotationUp, onMoveRotationDown }: TimelineVisualizerProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const theme = useTheme();

  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [buttonLeft, setButtonLeft] = useState<number>(0);

  useEffect(() => {
    function handleResize() {
      setContainerWidth(window.innerWidth);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (rotations.length === 0) return;

    function createGlow(svg) {
      const defs = svg.append("defs");

      const glow = defs.append("filter")
        .attr("id", "glow")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");

      glow.append("feGaussianBlur")
        .attr("stdDeviation", 2)
        .attr("result", "blur");

      glow.append("feFlood")
        .attr("flood-color", GREY)
        .attr("result", "whiteGlow");

      glow.append("feComposite")
        .attr("in", "whiteGlow")
        .attr("in2", "blur")
        .attr("operator", "in")
        .attr("result", "glowEffect");

      glow.append("feMerge")
        .selectAll("feMergeNode")
        .data(["glowEffect", "SourceGraphic"])
        .enter()
        .append("feMergeNode")
        .attr("in", d => d);
    }

    function drawCast(graph, x, y, duration, scale, castFirst: boolean) {
      graph.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", duration * scale)
        .attr("height", RECT_HEIGHT)
        .attr("fill", ORANGE)
        .attr("opacity", 0)
        .attr("rx", 9)
        .attr("ry", 9)
        .attr("stroke", LIGHT_ORANGE)
        .attr("filter", "url(#glow)")
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("opacity", 1);
    }

    function drawGCD(graph, x, y, gcd, scale, GCDFirst: boolean) {
      graph.append("rect")
        .attr("x", x)
        .attr("y", y - 1)
        .attr("width", gcd * scale)
        .attr("height", RECT_HEIGHT + 2)
        .attr("fill", GREY)
        .attr("stroke", LIGHT_GREY)
        .attr("stroke-dasharray", "")
        .attr("opacity", 0)
        .attr("rx", 9)
        .attr("ry", 9)
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("opacity", 1);
    }

    function drawIcon(graph, x, y, ability, xOffset, rotationIndex, imageIndex) {
      const imageSize = 50;
      const borderX = x - 1 + xOffset;
      const borderY = y + (RECT_HEIGHT - imageSize) / 2;
      const clipId = `clip-${rotationIndex}-${imageIndex}`;

      graph.append("clipPath")
        .attr("id", clipId)
        .append("rect")
        .attr("x", borderX)
        .attr("y", borderY)
        .attr("width", imageSize)
        .attr("height", imageSize)
        .attr("rx", 8)
        .attr("ry", 8);

      graph.append("rect")
        .attr("x", borderX)
        .attr("y", borderY)
        .attr("width", imageSize)
        .attr("height", imageSize)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("fill", "none")
        .attr("stroke", GREY)
        .attr("stroke-width", 1)
        .attr("opacity", 0)
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("opacity", 1);

      const zoomFactor = 1.1;
      const zoomedSize = imageSize * zoomFactor;
      const offset = (zoomedSize - imageSize) / 2;

      graph.append("image")
        .attr("x", borderX - offset)
        .attr("y", borderY - offset)
        .attr("width", zoomedSize)
        .attr("height", zoomedSize)
        .attr("clip-path", `url(#${clipId})`)
        .attr("opacity", 0)
        .attr("href", iconLocalUrl(ability.icon))
        .on("error", function () {
          d3.select(this).attr("href", iconFallbackUrl(ability.icon));
        })
        .transition()
        .duration(TRANSITION_DURATION)
        .attr("opacity", 1);

      if (ability.empowerLevel) {
        const roman = toRomanNumeral(ability.empowerLevel);
        const labelGroup = graph.append("g")
          .attr("class", "empower-label");

        const text = labelGroup.append("text")
          .text(roman)
          .style("fill", "white")
          .style("font-size", "0.75rem")
          .style("font-weight", "bold")
          .attr("text-anchor", "end")
          .attr("x", borderX + imageSize)
          .attr("y", borderY + imageSize);

        const bbox = text.node().getBBox();

        labelGroup.insert("rect", "text")
          .attr("x", bbox.x - 2)
          .attr("y", bbox.y - 2)
          .attr("width", bbox.width + 4)
          .attr("height", bbox.height + 4)
          .attr("rx", 4)
          .attr("ry", 4)
          .style("fill", "rgba(0, 0, 0, 0.75)");
      }
    }

    async function renderTimeline() {
      const ogcdImages: IconProps[] = [];

      const updatedRotations = await Promise.all(
        rotations.map(rotation => applyBuffEffects(selectedSpec, rotation.steps))
      );

      let totalTime = 0;
      let maxSpellCount = 0;

      updatedRotations.forEach(rotation => {
        let time = 0;
        let spellCount = 0;
        rotation.forEach(ability => {
          const isOffGCDInstant = (ability.castTime === 0 || ability.castTime === undefined) && ability.gcd === false;
          if (!isOffGCDInstant) {
            const castTime = calculateCastTime(ability, haste);
            const baseGCD = calculateGCD(haste);
            const gcd = ability.replaceGCD !== undefined
              ? Math.min(ability.replaceGCD / (1 + haste / 100), baseGCD)
              : baseGCD;
            time += castTime > gcd ? castTime : gcd;
            spellCount++;
          }
        });
        totalTime = Math.max(totalTime, time);
        maxSpellCount = Math.max(maxSpellCount, spellCount);
      });

      const roundedTime = Math.ceil(totalTime * 2) / 2;

      const buttonAreaWidth = RECT_HEIGHT * 3 + 16;
      const margin = { top: 50, right: buttonAreaWidth + 8, bottom: 75, left: 50 };
      const availableWidth = containerWidth - margin.left - margin.right;

      let scale;
      if (maxSpellCount < 5) {
        const MIN_SCALE_COMPACT = 90;
        const MAX_SCALE_COMPACT = 200;
        scale = Math.min(Math.max(availableWidth / roundedTime, MIN_SCALE_COMPACT), MAX_SCALE_COMPACT);
      } else {
        const MIN_SCALE = 40;
        scale = Math.max(availableWidth / roundedTime, MIN_SCALE);
      }

      const width = roundedTime * scale;
      const svgWidth = Math.min(width + margin.left + margin.right, containerWidth);
      const height = ROW_TOTAL_HEIGHT * rotations.length + 130;
      setButtonLeft(svgWidth - margin.right + 8);

      const svg = d3
        .select(svgRef.current)
        .attr("width", svgWidth)
        .attr("height", height)
        .style("background-color", theme.palette.background.default || theme.palette.background);

      svg.selectAll("*").remove();

      createGlow(svg);

      const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

      const legend = svg.append("g")
        .attr("class", "legend");

      const legendItems = [
        { label: ("GCD"), shape: "rect", color: GREY },
        { label: ("Cast"), shape: "rect", color: ORANGE }
      ];

      const legendPadding = 10;
      const legendX = width + margin.left - 150;
      const legendY = legendPadding;

      legend.attr("transform", `translate(${legendX}, ${legendY})`);

      legendItems.forEach((item, i) => {
        const y = i * 20;

        const gItem = legend.append("g").attr("transform", `translate(0, ${y})`);

        gItem.append("rect")
          .attr("x", 0)
          .attr("y", -7)
          .attr("width", 20)
          .attr("height", 14)
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("fill", item.color);

        gItem.append("text")
          .attr("x", 30)
          .attr("y", 4)
          .text(item.label)
          .style("font-size", "0.8rem")
          .style("fill", LIGHT_GREY);
      });

      updatedRotations.forEach((rotation, rotationIndex) => {
        let time = 0;
        let imageIndex = 0;

        let offGCDStackMap: { [time: number]: number } = {};

        rotation.forEach(ability => {
          const duration = calculateCastTime(ability, haste);
          const isOffGCDInstant = (ability.castTime === 0 || ability.castTime === undefined) && ability.gcd === false;
          const x = time * scale;

          const baseY = rotationIndex * ROW_TOTAL_HEIGHT;
          const yOffset = 0;

          const iconXOffset = Object.keys(offGCDStackMap).length * 55;

          if (isOffGCDInstant) {
            const t = +time.toFixed(3);
            const count = offGCDStackMap[t] || 0;
            offGCDStackMap[t] = count + 1;
          } else {
            offGCDStackMap = {};
          }

          const y = baseY + yOffset;

          if (!isOffGCDInstant) {
            const baseGCD = calculateGCD(haste);
            const gcd = ability.replaceGCD !== undefined
              ? Math.min(ability.replaceGCD / (1 + haste / 100), baseGCD)
              : baseGCD;
            if (duration > gcd) {
              drawCast(g, x, y, duration, scale, true);
              drawGCD(g, x, y, gcd, scale, false);
            } else if (duration < gcd) {
              drawGCD(g, x, y, gcd, scale, true);
              drawCast(g, x, y, duration, scale, false);
            } else {
              drawCast(g, x, y, duration, scale, true);
              drawGCD(g, x, y, gcd, scale, true);
            }

            drawIcon(g, x, y, ability, iconXOffset, rotationIndex, imageIndex)
          } else {
            const icon: IconProps = {
              graph: g,
              x,
              y,
              ability,
              xOffset: iconXOffset,
              rotationIndex,
              imageIndex
            }
            ogcdImages.push(icon);
          }

          if (!isOffGCDInstant) {
            time += duration;
          }

          imageIndex++;
        });

        ogcdImages.forEach((icon) => {
          drawIcon(
            icon.graph,
            icon.x,
            icon.y,
            icon.ability,
            icon.xOffset,
            icon.rotationIndex,
            icon.imageIndex
          );
        });
      });

      const xScale = d3.scaleLinear().domain([0, roundedTime]).range([0, roundedTime * scale]);
      svg.append("g")
        .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(roundedTime * 2).tickFormat(d3.format(".1f")));
    }

    renderTimeline();

  }, [rotations, containerWidth, theme.palette.background, selectedSpec, haste]);

  return (
    <>
      {rotations.length > 0 && (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <svg ref={svgRef} style={{ maxWidth: "100%", display: "block" }} />
          <Box sx={{ position: 'absolute', top: 50, left: buttonLeft, display: 'flex', flexDirection: 'column', gap: `${ROW_PADDING}px` }}>
            {rotations.map((rotation, index) => (
              <Box
                key={rotation.id}
                sx={{
                  height: RECT_HEIGHT,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                }}
              >
                <SwirlIconButton
                  onClick={() => onMoveRotationUp(rotation.id)}
                  disabled={index === 0}
                  width={RECT_HEIGHT}
                  height={RECT_HEIGHT}
                >
                  <ArrowUpward sx={{ fontSize: 15 }} />
                </SwirlIconButton>
                <SwirlIconButton
                  tint="danger"
                  onClick={() => onRemoveRotation(rotation.id)}
                  width={RECT_HEIGHT}
                  height={RECT_HEIGHT}
                >
                  <Delete sx={{ fontSize: 15 }} />
                </SwirlIconButton>
                <SwirlIconButton
                  onClick={() => onMoveRotationDown(rotation.id)}
                  disabled={index === rotations.length - 1}
                  width={RECT_HEIGHT}
                  height={RECT_HEIGHT}
                >
                  <ArrowDownward sx={{ fontSize: 15 }} />
                </SwirlIconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </>
  );
}
