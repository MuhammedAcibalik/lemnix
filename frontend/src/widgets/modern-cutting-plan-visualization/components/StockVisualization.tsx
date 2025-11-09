/**
 * @fileoverview Stock Visualization Component
 * @module StockVisualization
 * @version 1.0.0
 */

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Avatar,
  Chip,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  useTheme,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Architecture as ArchitectureIcon,
  Speed as SpeedIcon,
  LocalFlorist as EcoIcon,
} from "@mui/icons-material";
import { StockVisualizationProps, CuttingPiece } from "../types";
import { getEfficiencyColor, formatLength } from "../utils";

/**
 * Individual cutting piece component
 */
const CuttingPieceCard: React.FC<{
  piece: CuttingPiece;
  index: number;
}> = ({ piece, index }) => (
  <Card
    variant="outlined"
    sx={{
      p: 2,
      bgcolor: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
      border: "1px solid #e0e0e0",
      borderRadius: 2,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        border: "1px solid #1976d2",
      },
    }}
  >
    <Stack direction="row" alignItems="center" spacing={3}>
      <Avatar
        sx={{
          bgcolor: piece.color || "#1976d2",
          width: 40,
          height: 40,
          fontSize: "0.9rem",
          fontWeight: 700,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          border: "2px solid #ffffff",
        }}
      >
        {index + 1}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        {/* Ana Bilgi Satırı */}
        <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 1 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#1976d2", minWidth: 120 }}
          >
            {piece.profileType}
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "#d32f2f", minWidth: 150 }}
          >
            {formatLength(piece.length)} × {piece.quantity} adet
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, color: "#1976d2" }}
          >
            Toplam: {formatLength(piece.totalLength)}
          </Typography>
        </Stack>

        {/* Detay Bilgi Satırı */}
        <Stack direction="row" alignItems="center" spacing={4}>
          {/* İş Emri */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "#666", minWidth: 60 }}
            >
              İş Emri:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#1976d2" }}
            >
              {piece.workOrderId || "Bilinmeyen"}
            </Typography>
          </Box>

          {/* Ürün */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "#666", minWidth: 50 }}
            >
              Ürün:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#1976d2" }}
            >
              {piece.productName || "Bilinmeyen"}
            </Typography>
          </Box>

          {/* Ebat */}
          {piece.size && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#666", minWidth: 40 }}
              >
                Ebat:
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#1976d2" }}
              >
                {piece.size}
              </Typography>
            </Box>
          )}

          {/* Renk */}
          {piece.color && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#666", minWidth: 40 }}
              >
                Renk:
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    bgcolor: piece.color,
                    border: "1px solid #ffffff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#1976d2" }}
                >
                  {piece.color}
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Not */}
          {piece.note && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "#e65100", minWidth: 40 }}
              >
                Not:
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: "#e65100", fontStyle: "italic" }}
              >
                {piece.note}
              </Typography>
            </Box>
          )}

          {/* Öncelik */}
          <Chip
            size="small"
            label={piece.priority?.toUpperCase() || "NORMAL"}
            color={
              piece.priority === "high"
                ? "error"
                : piece.priority === "medium"
                  ? "warning"
                  : "success"
            }
            sx={{
              fontWeight: 700,
              fontSize: "0.7rem",
              height: 24,
            }}
          />
        </Stack>
      </Box>
    </Stack>
  </Card>
);

/**
 * Stock visualization bar component
 */
const StockVisualizationBar: React.FC<{
  stock: StockVisualizationProps["stock"];
  settings: StockVisualizationProps["settings"];
  hoveredPiece: string | null;
  onPieceHover: (pieceId: string) => void;
  onPieceLeave: () => void;
}> = ({ stock, settings, hoveredPiece, onPieceHover, onPieceLeave }) => (
  <Box sx={{ mb: 2 }}>
    <Box
      sx={{
        width: "100%",
        height: settings.viewMode === "compact" ? 50 : 70,
        border: "2px solid #e0e0e0",
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        background:
          "linear-gradient(135deg, #f8f9fa 0%, #ffffff 25%, #f1f3f4 50%, #ffffff 75%, #f8f9fa 100%)",
        boxShadow:
          "0 4px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "40%",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 100%)",
          pointerEvents: "none",
          borderRadius: "3px 3px 0 0",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "20%",
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.01) 100%)",
          pointerEvents: "none",
          borderRadius: "0 0 3px 3px",
        },
      }}
    >
      {/* Cutting Pieces */}
      {stock.cuts.map((piece, index) => {
        const widthPercentage = (piece.totalLength / stock.stockLength) * 100;
        const leftPosition = stock.cuts
          .slice(0, index)
          .reduce(
            (sum, p) => sum + (p.totalLength / stock.stockLength) * 100,
            0,
          );

        return (
          <Tooltip
            key={piece.id}
            title={
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {piece.profileType}
                </Typography>
                <Typography variant="body2">
                  Uzunluk: {formatLength(piece.length)} × {piece.quantity} adet
                </Typography>
                <Typography variant="body2">
                  Toplam: {formatLength(piece.totalLength)}
                </Typography>
                {piece.workOrderId && (
                  <Typography variant="body2">
                    İş Emri: {piece.workOrderId}
                  </Typography>
                )}
              </Box>
            }
            arrow
            placement="top"
          >
            <Box
              sx={{
                position: "absolute",
                left: `${leftPosition}%`,
                width: `${widthPercentage}%`,
                height: "100%",
                background: settings.showColors
                  ? `linear-gradient(135deg, ${piece.color} 0%, ${piece.color}cc 50%, ${piece.color}aa 100%)`
                  : "linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)",
                border:
                  hoveredPiece === piece.id
                    ? "2px solid #ffffff"
                    : "1px solid rgba(255,255,255,0.3)",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow:
                  hoveredPiece === piece.id
                    ? "0 8px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : "0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "50%",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)",
                  borderRadius: "2px 2px 0 0",
                  pointerEvents: "none",
                },
                "&:hover": {
                  transform: "translateY(-2px) scaleY(1.05)",
                  zIndex: 10,
                  boxShadow:
                    "0 12px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
                  border: "2px solid #ffffff",
                },
              }}
              onMouseEnter={() => onPieceHover(piece.id)}
              onMouseLeave={onPieceLeave}
            >
              {settings.showLabels && widthPercentage > 8 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
                    fontSize:
                      settings.viewMode === "compact" ? "0.7rem" : "0.75rem",
                    textAlign: "center",
                  }}
                >
                  {piece.profileType.length > 6
                    ? piece.profileType.substring(0, 6) + "..."
                    : piece.profileType}
                  {piece.quantity > 1 && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontSize: "0.6rem",
                        opacity: 0.9,
                      }}
                    >
                      {piece.quantity}×
                    </Typography>
                  )}
                </Typography>
              )}
            </Box>
          </Tooltip>
        );
      })}

      {/* Waste Area */}
      {stock.wasteLength > 0 && settings.showWaste && (
        <Box
          sx={{
            position: "absolute",
            right: 0,
            width: `${(stock.wasteLength / stock.stockLength) * 100}%`,
            height: "100%",
            background:
              "linear-gradient(135deg, #ffebee 0%, #ffcdd2 25%, #ffcdd2 50%, #ffebee 75%, #ffebee 100%)",
            border: "1px solid #f44336",
            borderRadius: "0 2px 2px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 2px 4px rgba(244,67,54,0.1)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "30%",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)",
              borderRadius: "0 2px 0 0",
              pointerEvents: "none",
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#d32f2f",
              fontWeight: 700,
              textShadow: "1px 1px 2px rgba(255,255,255,0.8)",
              fontSize: "0.75rem",
            }}
          >
            FİRE
          </Typography>
        </Box>
      )}
    </Box>

    {/* Measurements */}
    {settings.showMeasurements && (
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ mt: 2, px: 2 }}
      >
        <Box
          sx={{
            bgcolor: "#f5f5f5",
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700, fontSize: "0.7rem" }}
          >
            0mm
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: "#f5f5f5",
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700, fontSize: "0.7rem" }}
          >
            {formatLength(stock.stockLength)}
          </Typography>
        </Box>
      </Stack>
    )}
  </Box>
);

/**
 * Main Stock Visualization Component
 */
export const StockVisualization: React.FC<StockVisualizationProps> = ({
  stock,
  settings,
  selectedStock,
  hoveredPiece,
  onStockClick,
  onPieceHover,
  onPieceLeave,
}) => {
  const isSelected = selectedStock === stock.id;

  return (
    <Card
      key={stock.id}
      elevation={isSelected ? 8 : 2}
      sx={{
        mb: 3,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: isSelected ? "2px solid #1976d2" : "1px solid transparent",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-2px)",
        },
      }}
      onClick={() => onStockClick(stock.id)}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Stock Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: getEfficiencyColor(stock.efficiency),
                width: 40,
                height: 40,
              }}
            >
              <ArchitectureIcon />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1976d2" }}
              >
                {stock.cuts[0]?.profileType || "Bilinmeyen Profil"}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#d32f2f",
                  fontSize: "1.1rem",
                  mt: 1,
                  p: 1,
                  bgcolor: "#fff3e0",
                  borderRadius: 1,
                  border: "2px solid #ff9800",
                }}
              >
                Her bir parçası {formatLength(stock.cuts[0]?.length || 0)}{" "}
                olacak şekilde toplam {stock.cuts[0]?.quantity || 0} adet kadar
                kesiniz
              </Typography>
              {stock.stockCount && stock.stockCount > 1 && (
                <Typography
                  variant="caption"
                  color="info.main"
                  sx={{ display: "block", mt: 0.5 }}
                >
                  ({stock.cuts[0]?.quantity || 0} adet × {stock.stockCount}{" "}
                  çubuk = {(stock.cuts[0]?.quantity || 0) * stock.stockCount}{" "}
                  toplam)
                </Typography>
              )}
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Chip
              icon={<SpeedIcon />}
              label={`${stock.efficiency.toFixed(1)}%`}
              color={
                stock.efficiency >= 85
                  ? "success"
                  : stock.efficiency >= 70
                    ? "warning"
                    : "error"
              }
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={<EcoIcon />}
              label={`Fire: ${formatLength(stock.wasteLength)}`}
              variant="outlined"
              color={stock.wasteLength < 100 ? "success" : "warning"}
            />
          </Stack>
        </Stack>

        {/* Stock Visualization Bar */}
        <StockVisualizationBar
          stock={stock}
          settings={settings}
          hoveredPiece={hoveredPiece}
          onPieceHover={onPieceHover}
          onPieceLeave={onPieceLeave}
        />

        {/* Detailed View */}
        {isSelected && (
          <Accordion sx={{ mt: 2 }} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Parça Detayları ({stock.cuts.length} parça)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {stock.cuts.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  Bu çubukta parça bulunmuyor.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {stock.cuts.map((piece, index) => (
                    <Grid item xs={12} key={piece.id}>
                      <CuttingPieceCard piece={piece} index={index} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </AccordionDetails>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};
