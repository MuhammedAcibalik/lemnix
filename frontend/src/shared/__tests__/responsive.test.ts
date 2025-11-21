/**
 * @fileoverview FSD Responsive System Tests
 * @module shared/__tests__/responsive
 * @description Simple validation tests for responsive system
 */

<<<<<<< HEAD
import { describe, it, expect } from "vitest";
import { breakpoints, getCurrentBreakpoint } from "../config/breakpoints";

describe("Responsive System", () => {
  describe("breakpoints", () => {
    it("should have mobile-first breakpoints", () => {
=======
import { describe, it, expect } from 'vitest';
import { breakpoints, getCurrentBreakpoint } from '../config/breakpoints';

describe('Responsive System', () => {
  describe('breakpoints', () => {
    it('should have mobile-first breakpoints', () => {
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
      expect(breakpoints.mobile).toBe(320);
      expect(breakpoints.tablet).toBe(768);
      expect(breakpoints.desktop).toBe(1024);
      expect(breakpoints.wide).toBe(1280);
<<<<<<< HEAD
      expect(breakpoints["2xl"]).toBe(1536);
    });
  });

  describe("getCurrentBreakpoint", () => {
    it("should return mobile for small widths", () => {
      expect(getCurrentBreakpoint(320)).toBe("mobile");
      expect(getCurrentBreakpoint(500)).toBe("mobile");
    });

    it("should return tablet for medium widths", () => {
      expect(getCurrentBreakpoint(768)).toBe("md");
      expect(getCurrentBreakpoint(800)).toBe("md");
    });

    it("should return desktop for large widths", () => {
      expect(getCurrentBreakpoint(1024)).toBe("lg");
      expect(getCurrentBreakpoint(1100)).toBe("lg");
    });

    it("should return wide for extra large widths", () => {
      expect(getCurrentBreakpoint(1280)).toBe("xl");
      expect(getCurrentBreakpoint(1400)).toBe("xl");
    });

    it("should return 2xl for ultra wide widths", () => {
      expect(getCurrentBreakpoint(1536)).toBe("2xl");
      expect(getCurrentBreakpoint(1920)).toBe("2xl");
=======
      expect(breakpoints['2xl']).toBe(1536);
    });
  });

  describe('getCurrentBreakpoint', () => {
    it('should return mobile for small widths', () => {
      expect(getCurrentBreakpoint(320)).toBe('mobile');
      expect(getCurrentBreakpoint(500)).toBe('mobile');
    });

    it('should return tablet for medium widths', () => {
      expect(getCurrentBreakpoint(768)).toBe('md');
      expect(getCurrentBreakpoint(800)).toBe('md');
    });

    it('should return desktop for large widths', () => {
      expect(getCurrentBreakpoint(1024)).toBe('lg');
      expect(getCurrentBreakpoint(1100)).toBe('lg');
    });

    it('should return wide for extra large widths', () => {
      expect(getCurrentBreakpoint(1280)).toBe('xl');
      expect(getCurrentBreakpoint(1400)).toBe('xl');
    });

    it('should return 2xl for ultra wide widths', () => {
      expect(getCurrentBreakpoint(1536)).toBe('2xl');
      expect(getCurrentBreakpoint(1920)).toBe('2xl');
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
    });
  });
});
