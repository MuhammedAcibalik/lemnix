/**
 * @fileoverview HomePage - Lemnix Ana Sayfa
 * @description Lemnix ana sayfa kompozisyonu - Hero, Features ve CTA bölümlerini içerir
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";

// Import widget components
import HeroSection from "../../widgets/home-page/components/HeroSection";
import FeaturesSection from "../../widgets/home-page/components/FeaturesSection";
import CTASection from "../../widgets/home-page/components/CTASection";

/**
 * HomePage Component - Lemnix Ana Sayfa
 *
 * Modern, responsive ana sayfa kompozisyonu
 * Hero, Features ve CTA bölümlerini içerir
 */
const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Event handlers
  const handleDemoStart = () => {
    navigate("/optimize");
  };

  const handleExcelImport = () => {
    navigate("/optimize");
  };

  const handleFreeTrial = () => {
    navigate("/optimize");
  };

  const handleViewDemo = () => {
    navigate("/cutting-list");
  };

  return (
    <Box
      component="div"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Hero Section */}
      <HeroSection
        onDemoStart={handleDemoStart}
        onExcelImport={handleExcelImport}
      />

      {/* Features Section */}
      <FeaturesSection />

      {/* CTA Section */}
      <CTASection onFreeTrial={handleFreeTrial} onViewDemo={handleViewDemo} />
    </Box>
  );
};

export default HomePage;
