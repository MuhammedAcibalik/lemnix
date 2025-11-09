import React from "react";
import { Box, Typography } from "@mui/material";
import { appConfig } from "../config/legacy/appConfig";

interface LogoProps {
  variant?: "full" | "compact";
  size?: "small" | "medium" | "large";
  color?: "primary" | "white" | "gradient";
}

export const Logo: React.FC<LogoProps> = ({
  variant = "full",
  size = "medium",
  color = "gradient",
}) => {
  const getSize = () => {
    switch (size) {
      case "small":
        return { width: 32, height: 32, fontSize: "0.875rem" };
      case "large":
        return { width: 48, height: 48, fontSize: "1.5rem" };
      default:
        return { width: 40, height: 40, fontSize: "1.2rem" };
    }
  };

  const getPrimaryColor = () => {
    switch (color) {
      case "white":
        return "#ffffff";
      case "primary":
        return "#1a237e";
      case "gradient":
        return "#1a237e";
      default:
        return "#1a237e";
    }
  };

  const getAccentColor = () => {
    switch (color) {
      case "white":
        return "#ff6f00";
      case "primary":
        return "#ff6f00";
      default:
        return "#ff6f00";
    }
  };

  const sizeProps = getSize();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Simple Professional LEMNİX Logo */}
      <Box
        component="svg"
        width={sizeProps.width}
        height={sizeProps.height}
        viewBox="0 0 40 40"
        sx={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a237e" />
            <stop offset="100%" stopColor="#3949ab" />
          </linearGradient>
        </defs>

        {/* Ana profil şekli - Basit dikdörtgen */}
        <rect
          x="8"
          y="12"
          width="24"
          height="16"
          fill={color === "gradient" ? "url(#logoGradient)" : getPrimaryColor()}
          stroke={color === "white" ? "#1a237e" : "none"}
          strokeWidth="1"
        />

        {/* Kesim çizgisi - Basit yatay çizgi */}
        <line
          x1="10"
          y1="20"
          x2="30"
          y2="20"
          stroke={getAccentColor()}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* L harfi - Basit */}
        <path
          d="M 12 14 L 12 26 L 16 26"
          stroke={color === "white" ? "#1a237e" : "#ffffff"}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X harfi - Basit */}
        <path
          d="M 24 14 L 28 18 M 28 14 L 24 18"
          stroke={color === "white" ? "#1a237e" : "#ffffff"}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Box>

      {/* Metin */}
      {variant === "full" && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: sizeProps.fontSize,
            background:
              color === "gradient"
                ? "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)"
                : "none",
            backgroundClip: color === "gradient" ? "text" : "none",
            WebkitBackgroundClip: color === "gradient" ? "text" : "none",
            WebkitTextFillColor:
              color === "gradient" ? "transparent" : "inherit",
            color:
              color === "white"
                ? "#ffffff"
                : color === "primary"
                  ? "#1a237e"
                  : "inherit",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            fontFamily: '"Inter", "Roboto", sans-serif',
          }}
        >
          {appConfig.brandName}
        </Typography>
      )}
    </Box>
  );
};
