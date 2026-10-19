import type React from "react";
import { Box } from "@mui/material";
import { iconLocalUrl, iconFallbackUrl } from "@util/wowhead";
import type { specialization } from "@data/class";
import { ICON, RADIUS } from "@components/Theme/tokens";
import "./SpecializationSelect.css";

const SpecDisplay: React.FC<{ spec: specialization, short?: boolean }> = ({ spec, short }) => (
  <div className="spec">
    <Box
      sx={{
        width: ICON.sm,
        height: ICON.sm,
        overflow: "hidden",
        borderRadius: `${RADIUS.control}px`,
        border: "1px solid",
        borderColor: "divider",
        position: "relative",
        marginRight: "5px",
        flexShrink: 0,
      }}
    >
      <img
        src={iconLocalUrl(spec.icon)}
        alt={`${spec.name}`}
        className="spec_icon"
        style={{
          width: "calc(100% + 4px)",
          height: "calc(100% + 4px)",
          objectFit: "cover",
          display: "block",
          position: "absolute",
          top: "-2px",
          left: "-2px",
        }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = iconFallbackUrl(spec.icon);
        }}
      />
    </Box>
    {!short && (
      <>
        {spec.name}
      </>
    )}
  </div>
);

export default SpecDisplay;