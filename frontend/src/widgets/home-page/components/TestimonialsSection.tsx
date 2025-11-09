/**
 * @fileoverview Testimonials Section Component for HomePage
 * @module TestimonialsSection
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
  Rating,
  Chip,
  Fade,
  Zoom,
} from "@mui/material";
import { Star as StarIcon } from "@mui/icons-material";
import { TestimonialsSectionProps, StarRatingProps } from "../types";
import {
  textContent,
  stylingConstants,
  accessibilityLabels,
  responsiveConfig,
} from "../constants";

/**
 * Star Rating Component
 */
const StarRating: React.FC<StarRatingProps> = ({ rating, maxRating = 5 }) => (
  <Rating
    value={rating}
    max={maxRating}
    readOnly
    icon={<StarIcon sx={{ color: "#ffd700" }} />}
    emptyIcon={<StarIcon sx={{ color: "#e0e0e0" }} />}
    sx={{ mb: 2 }}
  />
);

/**
 * Testimonials Section Component
 */
export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
}) => {
  return (
    <Box
      id="testimonials-section"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: "#f8fafc",
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
              aria-label={accessibilityLabels.testimonials.title}
            >
              {textContent.testimonials.title}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                maxWidth: 600,
                mx: "auto",
                fontSize: { xs: "1rem", md: "1.25rem" },
              }}
              aria-label={accessibilityLabels.testimonials.title}
            >
              {textContent.testimonials.subtitle}
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid
              item
              key={testimonial.name}
              xs={responsiveConfig.grid.testimonials.xs}
              md={responsiveConfig.grid.testimonials.md}
            >
              <Zoom in timeout={1000 + index * 300}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: stylingConstants.borderRadius.large,
                    boxShadow: stylingConstants.shadows.light,
                    transition: stylingConstants.transitions.normal,
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: stylingConstants.shadows.heavy,
                    },
                  }}
                  aria-label={`${testimonial.name} müşteri yorumu`}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          mr: 3,
                          backgroundColor: "primary.main",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "1.2rem",
                        }}
                      >
                        {testimonial.avatar}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: "text.primary",
                            mb: 0.5,
                          }}
                        >
                          {testimonial.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            mb: 0.5,
                          }}
                        >
                          {testimonial.role}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "primary.main",
                            fontWeight: 500,
                          }}
                        >
                          {testimonial.company}
                        </Typography>
                      </Box>
                    </Box>

                    <StarRating rating={testimonial.rating} />

                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.primary",
                        lineHeight: 1.6,
                        mb: 3,
                        fontStyle: "italic",
                        fontSize: "1.1rem",
                      }}
                    >
                      "{testimonial.quote}"
                    </Typography>

                    <Box sx={{ textAlign: "center" }}>
                      <Chip
                        label={testimonial.result}
                        color="success"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          px: 2,
                          py: 1,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
