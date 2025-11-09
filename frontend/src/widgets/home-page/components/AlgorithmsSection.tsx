/**
 * @fileoverview Algorithms Section Component for HomePage
 * @module AlgorithmsSection
 * @version 1.0.0
 */

import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Fade,
  Slide,
} from "@mui/material";
import { AlgorithmsSectionProps } from "../types";
import {
  textContent,
  stylingConstants,
  accessibilityLabels,
  responsiveConfig,
} from "../constants";

/**
 * Algorithms Section Component
 */
export const AlgorithmsSection: React.FC<AlgorithmsSectionProps> = ({
  algorithms,
}) => {
  return (
    <Box
      id="algorithms-section"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: "#fff",
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: "text.primary",
                fontSize: { xs: "2rem", md: "3rem" },
              }}
              aria-label={accessibilityLabels.algorithms.title}
            >
              {textContent.algorithms.title}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                maxWidth: 600,
                mx: "auto",
                fontSize: { xs: "1rem", md: "1.25rem" },
              }}
              aria-label={accessibilityLabels.algorithms.title}
            >
              {textContent.algorithms.subtitle}
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          {algorithms.map((algorithm, index) => (
            <Grid
              item
              key={algorithm.name}
              xs={responsiveConfig.grid.algorithms.xs}
              md={responsiveConfig.grid.algorithms.md}
            >
              <Slide direction="up" in timeout={1000 + index * 200}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: stylingConstants.borderRadius.large,
                    boxShadow: stylingConstants.shadows.light,
                    transition: stylingConstants.transitions.normal,
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: stylingConstants.shadows.heavy,
                      borderColor: algorithm.color,
                      "& .algorithm-icon": {
                        transform: "scale(1.1)",
                      },
                    },
                  }}
                  aria-label={`${algorithm.name} algoritması`}
                >
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Avatar
                      className="algorithm-icon"
                      sx={{
                        width: 80,
                        height: 80,
                        mx: "auto",
                        mb: 3,
                        backgroundColor: algorithm.color,
                        transition: stylingConstants.transitions.normal,
                        boxShadow: `0 8px 24px ${algorithm.color}40`,
                      }}
                    >
                      <algorithm.icon sx={{ fontSize: 40, color: "#fff" }} />
                    </Avatar>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: "text.primary",
                      }}
                    >
                      {algorithm.name}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={`%${algorithm.efficiency} Verimlilik`}
                        sx={{
                          backgroundColor: algorithm.color,
                          color: "#fff",
                          fontWeight: 600,
                          mr: 1,
                        }}
                      />
                      <Chip
                        label={algorithm.speed}
                        variant="outlined"
                        sx={{
                          borderColor: algorithm.color,
                          color: algorithm.color,
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.6,
                      }}
                    >
                      {algorithm.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
