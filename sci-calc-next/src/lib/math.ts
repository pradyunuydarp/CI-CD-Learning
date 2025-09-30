export function sqrtX(value: number): number {
  if (Number.isNaN(value)) {
    throw new TypeError("Value must be a finite number");
  }
  if (value < 0) {
    throw new RangeError("Cannot take square root of a negative number");
  }
  return Math.sqrt(value);
}

export function factX(value: number): number {
  if (!Number.isInteger(value)) {
    throw new TypeError("Factorial requires an integer input");
  }
  if (value < 0) {
    throw new RangeError("Cannot take factorial of a negative number");
  }
  if (value === 0 || value === 1) {
    return 1;
  }

  let result = 1;
  for (let i = 2; i <= value; i += 1) {
    result *= i;
  }

  if (!Number.isFinite(result)) {
    throw new RangeError("Factorial result exceeds numeric limits");
  }

  return result;
}

export function lnX(value: number): number {
  if (Number.isNaN(value)) {
    throw new TypeError("Value must be a finite number");
  }
  if (value <= 0) {
    throw new RangeError("Natural log defined for positive numbers only");
  }
  return Math.log(value);
}

export function power(base: number, exponent: number): number {
  if ([base, exponent].some((entry) => Number.isNaN(entry))) {
    throw new TypeError("Base and exponent must be finite numbers");
  }

  const result = base ** exponent;
  if (!Number.isFinite(result)) {
    throw new RangeError("Result exceeds numeric limits");
  }

  return result;
}

export type Operation =
  | { type: "sqrt"; value: number }
  | { type: "factorial"; value: number }
  | { type: "ln"; value: number }
  | { type: "power"; base: number; exponent: number };

export function evaluate(operation: Operation): number {
  switch (operation.type) {
    case "sqrt":
      return sqrtX(operation.value);
    case "factorial":
      return factX(operation.value);
    case "ln":
      return lnX(operation.value);
    case "power":
      return power(operation.base, operation.exponent);
    default: {
      const exhaustiveCheck: never = operation;
      throw new Error(`Unsupported operation: ${exhaustiveCheck}`);
    }
  }
}
