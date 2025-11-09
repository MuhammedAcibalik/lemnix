/**
 * Stock Visualization 2D Component
 * Interactive SVG-based stock cutting visualization
 *
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React, { useState, useMemo } from "react";
import { Box, Typography, Tooltip, Chip, Stack, alpha } from "@mui/material";
import { CardV2 } from "@/shared";
import { useDesignSystem } from "@/shared/hooks";
import type { StockBreakdownData } from "./utils";
import { formatLength, getWasteCategoryColor } from "./utils";

export interface StockVisualization2DProps {
  readonly stocks: ReadonlyArray<StockBreakdownData>;
  readonly selectedStockIndex?: number;
  readonly onStockClick?: (stockIndex: number) => void;
  readonly maxVisibleStocks?: number;
}

/**
 * 2D Stock Visualization
 * SVG-based horizontal bar chart showing cutting segments
 */
export const StockVisualization2D: React.FC<StockVisualization2DProps> = ({
  stocks,
  selectedStockIndex,
  onStockClick,
  maxVisibleStocks = 10,
}) => {
  const ds = useDesignSystem();
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const visibleStocks = useMemo(() => {
    return stocks.slice(0, maxVisibleStocks);
  }, [stocks, maxVisibleStocks]);

  const SVG_HEIGHT = 60;
  const BAR_HEIGHT = 40;
  const LABEL_WIDTH = 60;
  const SVG_WIDTH = 800;
  const BAR_WIDTH = SVG_WIDTH - LABEL_WIDTH - 40;

  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing["4"], height: "100%" }}>
      {/* Header */}
      <Box sx={{ mb: ds.spacing["3"] }}>
        <Typography
          sx={{
            fontSize: "1.125rem",
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
            mb: ds.spacing["2"],
          }}
        >
          Kesim Planı Görselleştirme
        </Typography>
        <Typography
          sx={{
            fontSize: "0.875rem",
            color: ds.colors.text.secondary,
          }}
        >
          Her çubuk bir stok çubuğunu temsil eder. Renkler farklı iş emirlerini
          gösterir.
        </Typography>
      </Box>

      {/* Legend */}
      <Stack
        direction="row"
        spacing={ds.spacing["2"]}
        sx={{ mb: ds.spacing["3"], flexWrap: "wrap", gap: ds.spacing["2"] }}
      >
        <Chip
          label="Kullanılan Alan"
          size="small"
          sx={{
            height: 28,
            fontSize: "0.8125rem",
            backgroundColor: alpha(ds.colors.primary.main, 0.1),
            color: ds.colors.primary.main,
          }}
        />
        <Chip
          label="Fire (Atık)"
          size="small"
          sx={{
            height: 28,
            fontSize: "0.8125rem",
            backgroundColor: alpha(ds.colors.error.main, 0.1),
            color: ds.colors.error.main,
          }}
        />
        {visibleStocks.length < stocks.length && (
          <Chip
            label={`${stocks.length - maxVisibleStocks} stok daha...`}
            size="small"
            variant="outlined"
            sx={{
              height: 28,
              fontSize: "0.8125rem",
            }}
          />
        )}
      </Stack>

      {/* Stock Bars */}
      <Stack spacing={ds.spacing["3"]}>
        {visibleStocks.map((stock) => {
          const isSelected = selectedStockIndex === stock.stockIndex;
          const scaleX = BAR_WIDTH / stock.stockLength;

          return (
            <Box
              key={stock.stockIndex}
              onClick={() => onStockClick?.(stock.stockIndex)}
              sx={{
                cursor: onStockClick ? "pointer" : "default",
                p: ds.spacing["3"],
                borderRadius: `${ds.borderRadius.md}px`,
                backgroundColor: isSelected
                  ? alpha(ds.colors.primary.main, 0.05)
                  : "transparent",
                border: `1px solid ${isSelected ? ds.colors.primary.main : "transparent"}`,
                transition: ds.transitions.fast,
                "&:hover": onStockClick
                  ? {
                      backgroundColor: alpha(ds.colors.primary.main, 0.03),
                      borderColor: ds.colors.primary[300],
                    }
                  : {},
              }}
            >
              {/* Stock Label */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: ds.spacing["2"],
                  mb: ds.spacing["2"],
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontWeight: ds.typography.fontWeight.semibold,
                    color: ds.colors.text.primary,
                    minWidth: LABEL_WIDTH,
                  }}
                >
                  Stok #{stock.stockIndex}
                </Typography>

                <Chip
                  label={`${stock.segmentCount} kesim`}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                />

                <Chip
                  label={formatLength(stock.wasteLength)}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: alpha(
                      getWasteCategoryColor(stock.wasteCategory),
                      0.1,
                    ),
                    color: getWasteCategoryColor(stock.wasteCategory),
                  }}
                />

                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    color: ds.colors.text.secondary,
                    ml: "auto",
                  }}
                >
                  {stock.usedPercentage.toFixed(1)}% kullanım
                </Typography>
              </Box>

              {/* SVG Bar */}
              <svg
                width={SVG_WIDTH}
                height={SVG_HEIGHT}
                style={{ display: "block" }}
              >
                <defs>
                  {/* Hatched pattern for waste */}
                  <pattern
                    id={`waste-pattern-${stock.stockIndex}`}
                    width="4"
                    height="4"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="4"
                      stroke={ds.colors.error.main}
                      strokeWidth="2"
                    />
                  </pattern>
                </defs>

                {/* Stock outline */}
                <rect
                  x={LABEL_WIDTH}
                  y={(SVG_HEIGHT - BAR_HEIGHT) / 2}
                  width={BAR_WIDTH}
                  height={BAR_HEIGHT}
                  fill="none"
                  stroke={ds.colors.neutral[300]}
                  strokeWidth="2"
                  rx="4"
                />

                {/* Segments */}
                {stock.segments.map((segment) => {
                  const x = LABEL_WIDTH + segment.startPosition * scaleX;
                  const width = segment.length * scaleX;
                  const isHovered = hoveredSegment === segment.id;

                  return (
                    <Tooltip
                      key={segment.id}
                      title={
                        <Box sx={{ p: ds.spacing["1"] }}>
                          <Typography
                            sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                          >
                            {segment.profileType}
                          </Typography>
                          <Typography sx={{ fontSize: "0.6875rem" }}>
                            {formatLength(segment.length)} × {segment.quantity}{" "}
                            adet
                          </Typography>
                          <Typography sx={{ fontSize: "0.6875rem" }}>
                            İş Emri: {segment.workOrderId}
                          </Typography>
                          <Typography sx={{ fontSize: "0.6875rem" }}>
                            Pozisyon: {formatLength(segment.startPosition)} -{" "}
                            {formatLength(segment.endPosition)}
                          </Typography>
                        </Box>
                      }
                      arrow
                      placement="top"
                    >
                      <rect
                        x={x}
                        y={(SVG_HEIGHT - BAR_HEIGHT) / 2}
                        width={width}
                        height={BAR_HEIGHT}
                        fill={segment.color}
                        opacity={isHovered ? 0.9 : 0.7}
                        stroke={isHovered ? "#fff" : "none"}
                        strokeWidth={isHovered ? 2 : 0}
                        onMouseEnter={() => setHoveredSegment(segment.id)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        style={{
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      />
                    </Tooltip>
                  );
                })}

                {/* Waste area */}
                {stock.wasteLength > 0 && (
                  <Tooltip
                    title={
                      <Box sx={{ p: ds.spacing["1"] }}>
                        <Typography
                          sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                        >
                          Fire (Atık)
                        </Typography>
                        <Typography sx={{ fontSize: "0.6875rem" }}>
                          {formatLength(stock.wasteLength)}
                        </Typography>
                        <Typography sx={{ fontSize: "0.6875rem" }}>
                          Kategori: {stock.wasteCategory}
                        </Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <rect
                      x={LABEL_WIDTH + stock.usedLength * scaleX}
                      y={(SVG_HEIGHT - BAR_HEIGHT) / 2}
                      width={stock.wasteLength * scaleX}
                      height={BAR_HEIGHT}
                      fill={`url(#waste-pattern-${stock.stockIndex})`}
                      opacity={0.5}
                      stroke={ds.colors.error.main}
                      strokeWidth="1"
                      strokeDasharray="4,2"
                      style={{ cursor: "help" }}
                    />
                  </Tooltip>
                )}

                {/* Length markers */}
                <text
                  x={LABEL_WIDTH - 5}
                  y={SVG_HEIGHT / 2 + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill={ds.colors.text.secondary}
                >
                  0
                </text>
                <text
                  x={LABEL_WIDTH + BAR_WIDTH + 5}
                  y={SVG_HEIGHT / 2 + 4}
                  textAnchor="start"
                  fontSize="10"
                  fill={ds.colors.text.secondary}
                >
                  {formatLength(stock.stockLength)}
                </text>
              </svg>
            </Box>
          );
        })}
      </Stack>

      {/* Show more indicator */}
      {stocks.length > maxVisibleStocks && (
        <Box
          sx={{
            mt: ds.spacing["3"],
            textAlign: "center",
            py: ds.spacing["2"],
            borderRadius: `${ds.borderRadius.md}px`,
            backgroundColor: alpha(ds.colors.neutral[100], 0.5),
          }}
        >
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: ds.colors.text.secondary,
            }}
          >
            + {stocks.length - maxVisibleStocks} stok daha
          </Typography>
        </Box>
      )}
    </CardV2>
  );
};
