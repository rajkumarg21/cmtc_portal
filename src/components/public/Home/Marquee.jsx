// Marquee.jsx
import React from "react";
import { Box, Typography } from "@mui/material";

const Marquee = ({ items }) => {
  return (
    <Box
      sx={{
        position: "relative",
        height: "48px",
        backgroundColor: "#212121",
        zIndex: 1100,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          whiteSpace: "nowrap",
          animation: "marquee 20s linear infinite",
          color: "#fff",
          px: 2,
          "& span": {
            mx: 4,
            display: "inline-block",
          },
        }}
      >
        {items.map((item, idx) => (
          <span key={idx}>{item}</span>
        ))}
      </Box>

    
    </Box>
  );
};

export default Marquee;
