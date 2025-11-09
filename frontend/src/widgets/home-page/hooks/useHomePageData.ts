/**
 * @fileoverview Custom hook for HomePage data management
 * @module useHomePageData
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  premiumFeatures,
  performanceMetrics,
  customerTestimonials,
  algorithmCards,
  animationConstants,
} from "../constants";
import {
  UseHomePageDataReturn,
  UseHomePageNavigationReturn,
  HomePageState,
} from "../types";

/**
 * Custom hook for managing HomePage data and state
 */
export const useHomePageData = (): UseHomePageDataReturn &
  UseHomePageNavigationReturn & {
    state: HomePageState;
    actions: {
      setCurrentMetricIndex: (index: number) => void;
      setIsVisible: (visible: boolean) => void;
      setCurrentSection: (section: string) => void;
      setIsAnimating: (animating: boolean) => void;
      addLoadedSection: (section: string) => void;
    };
  } => {
  const navigate = useNavigate();

  // State management
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState("hero");
  const [isAnimating, setIsAnimating] = useState(false);
  const [loadedSections, setLoadedSections] = useState<string[]>(["hero"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize component
  useEffect(() => {
    setIsVisible(true);
    setIsLoading(false);

    // Start metrics rotation
    const interval = setInterval(() => {
      setCurrentMetricIndex((prev) => (prev + 1) % performanceMetrics.length);
    }, animationConstants.durations.slow);

    return () => clearInterval(interval);
  }, []);

  // Navigation handlers
  const onGetStarted = useCallback(() => {
    try {
      setIsAnimating(true);
      navigate("/enterprise-optimization");
    } catch (err) {
      setError("Navigation failed");
    } finally {
      setIsAnimating(false);
    }
  }, [navigate]);

  const onLearnMore = useCallback(() => {
    try {
      setIsAnimating(true);
      setCurrentSection("features");
      // Scroll to features section
      const featuresElement = document.getElementById("features-section");
      if (featuresElement) {
        featuresElement.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      setError("Scroll failed");
    } finally {
      setIsAnimating(false);
    }
  }, []);

  const onContactUs = useCallback(() => {
    try {
      setIsAnimating(true);
      navigate("/contact");
    } catch (err) {
      setError("Navigation failed");
    } finally {
      setIsAnimating(false);
    }
  }, [navigate]);

  const onScrollToSection = useCallback((sectionId: string) => {
    try {
      setIsAnimating(true);
      setCurrentSection(sectionId);

      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      setError("Scroll failed");
    } finally {
      setIsAnimating(false);
    }
  }, []);

  // Section loading management
  const addLoadedSection = useCallback((section: string) => {
    setLoadedSections((prev) =>
      prev.includes(section) ? prev : [...prev, section],
    );
  }, []);

  // Memoized data - using stable references
  const memoizedData = useMemo(
    () => ({
      features: premiumFeatures,
      metrics: performanceMetrics,
      testimonials: customerTestimonials,
      algorithms: algorithmCards,
    }),
    [],
  ); // Empty dependency array since constants are stable

  // State object
  const state: HomePageState = {
    currentSection,
    isAnimating,
    loadedSections,
  };

  // Actions object
  const actions = {
    setCurrentMetricIndex,
    setIsVisible,
    setCurrentSection,
    setIsAnimating,
    addLoadedSection,
  };

  return {
    // Data
    ...memoizedData,

    // Navigation
    onGetStarted,
    onLearnMore,
    onContactUs,
    onScrollToSection,

    // State
    isLoading,
    error,
    state,
    actions,
  };
};
