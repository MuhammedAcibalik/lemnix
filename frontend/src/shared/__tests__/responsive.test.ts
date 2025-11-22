/**
 * @fileoverview FSD Responsive System Tests
 * @module shared/__tests__/responsive
 * @description Simple validation tests for responsive system
 */

import { describe, it, expect } from "vitest";
import { breakpoints, getCurrentBreakpoint } from "../config/breakpoints";

describe("Responsive System", () => {
  describe("breakpoints", () => {
    it("should have mobile-first breakpoints aligned with Design System v3", () => {
      expect(breakpoints.mobile).toBe(320); // Maps to DS xs
      expect(breakpoints.sm).toBe(480); // Maps to DS sm
      expect(breakpoints.tablet).toBe(768); // Maps to DS md
      expect(breakpoints.desktop).toBe(1024); // Maps to DS lg
      expect(breakpoints.wide).toBe(1366); // Maps to DS xl (updated from 1280)
      expect(breakpoints["2xl"]).toBe(1920); // Maps to DS xxl (updated from 1536)
    });
  });

  describe("getCurrentBreakpoint", () => {
    it("should return mobile for small widths (320-479px)", () => {
      expect(getCurrentBreakpoint(320)).toBe("mobile");
      expect(getCurrentBreakpoint(400)).toBe("mobile");
      expect(getCurrentBreakpoint(479)).toBe("mobile");
    });

    it("should return sm for small tablet widths (480-767px)", () => {
      expect(getCurrentBreakpoint(480)).toBe("sm");
      expect(getCurrentBreakpoint(600)).toBe("sm");
      expect(getCurrentBreakpoint(767)).toBe("sm");
    });

    it("should return tablet/md for medium widths (768-1023px)", () => {
      expect(getCurrentBreakpoint(768)).toBe("md");
      expect(getCurrentBreakpoint(800)).toBe("md");
      expect(getCurrentBreakpoint(1023)).toBe("md");
    });

    it("should return desktop/lg for large widths (1024-1365px)", () => {
      expect(getCurrentBreakpoint(1024)).toBe("lg");
      expect(getCurrentBreakpoint(1100)).toBe("lg");
      expect(getCurrentBreakpoint(1365)).toBe("lg");
    });

    it("should return wide/xl for extra large widths (1366-1919px)", () => {
      expect(getCurrentBreakpoint(1366)).toBe("xl");
      expect(getCurrentBreakpoint(1400)).toBe("xl");
      expect(getCurrentBreakpoint(1919)).toBe("xl");
    });

    it("should return 2xl for ultra wide widths (1920px+)", () => {
      expect(getCurrentBreakpoint(1920)).toBe("2xl");
      expect(getCurrentBreakpoint(2560)).toBe("2xl");
    });
  });
});
