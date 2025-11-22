/**
 * @fileoverview HomePage - Lemnix Ana Sayfa
 * @description Lemnix ana sayfa kompozisyonu - Hero, Features ve CTA bölümlerini içerir
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";

// Import route constants
// Using shared config for consistency
import { routes } from "@/shared/config";

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

  // Event handlers - Using route constants for type safety
  const handleDemoStart = () => {
    navigate(routes.enterpriseOptimization);
  };

  const handleExcelImport = () => {
    navigate(routes.enterpriseOptimization);
  };

  const handleFreeTrial = () => {
    navigate(routes.enterpriseOptimization);
  };

  const handleViewDemo = () => {
    navigate(routes.cuttingList);
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
