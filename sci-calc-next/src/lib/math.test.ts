import { describe, expect, it } from "vitest";
import { evaluate, factX, lnX, power, sqrtX } from "./math";

describe("sqrtX", () => {
  it("computes square root of positive number", () => {
    expect(sqrtX(9)).toBe(3);
  });

  it("throws on negative input", () => {
    expect(() => sqrtX(-1)).toThrow("square root");
  });
});

describe("factX", () => {
  it("returns 1 for zero", () => {
    expect(factX(0)).toBe(1);
  });

  it("returns factorial for positive integer", () => {
    expect(factX(5)).toBe(120);
  });

  it("throws on non-integer input", () => {
    expect(() => factX(2.5)).toThrow("integer");
  });
});

describe("lnX", () => {
  it("computes natural log for positive value", () => {
    expect(lnX(Math.E)).toBeCloseTo(1, 6);
  });

  it("throws on zero or negative input", () => {
    expect(() => lnX(0)).toThrow("positive numbers only");
  });
});

describe("power", () => {
  it("raises base to exponent", () => {
    expect(power(2, 3)).toBe(8);
  });

  it("throws when result not finite", () => {
    expect(() => power(Number.MAX_VALUE, 2)).toThrow("numeric limits");
  });
});

describe("evaluate", () => {
  it("delegates sqrt operation", () => {
    expect(evaluate({ type: "sqrt", value: 16 })).toBe(4);
  });

  it("delegates power operation", () => {
    expect(evaluate({ type: "power", base: 3, exponent: 3 })).toBe(27);
  });
});
