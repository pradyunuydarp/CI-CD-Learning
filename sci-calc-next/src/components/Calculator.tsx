"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";

type OperationType = "sqrt" | "factorial" | "ln" | "power";

type CalcResponse = {
  result?: number;
  error?: string;
};

type ParsedExpression =
  | { operation: "sqrt" | "factorial" | "ln"; value: number }
  | { operation: "power"; base: number; exponent: number };

const OPERATION_DETAILS: Record<
  OperationType,
  {
    label: string;
    glyph: string;
    description: string;
    domain: string;
    example: string;
  }
> = {
  sqrt: {
    label: "Square Root",
    glyph: "√x",
    description: "Return the principal square root of a non-negative value.",
    domain: "Input x >= 0",
    example: "√144 = 12",
  },
  factorial: {
    label: "Factorial",
    glyph: "n!",
    description:
      "Multiply a positive integer by every smaller integer down to one.",
    domain: "Integer n >= 0 (clamped at 170!)",
    example: "5! = 120",
  },
  ln: {
    label: "Natural Logarithm",
    glyph: "ln x",
    description: "Compute the natural logarithm (base e) of a positive number.",
    domain: "Input x > 0",
    example: "ln e = 1",
  },
  power: {
    label: "Exponentiation",
    glyph: "a^b",
    description: "Raise a real base to any real exponent with high precision.",
    domain: "Real base and exponent",
    example: "2^8 = 256",
  },
};

function formatResult(value?: number) {
  if (value === undefined) {
    return "";
  }
  const rounded = Number.isInteger(value) ? value : Number(value.toFixed(6));
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 6,
  }).format(rounded);
}

function parseExpression(raw: string):
  | { success: true; data: ParsedExpression }
  | { success: false; message: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { success: false, message: "Expression is empty" };
  }

  const normalized = trimmed.replace(/\s+/g, "").toLowerCase();

  if (normalized.endsWith("!")) {
    const target = normalized.slice(0, -1);
    const value = Number(target);
    if (!Number.isFinite(value)) {
      return { success: false, message: "Factorial requires a valid number" };
    }
    if (!Number.isInteger(value) || value < 0) {
      return { success: false, message: "Factorial only accepts non-negative integers" };
    }
    return { success: true, data: { operation: "factorial", value } };
  }

  if (normalized.startsWith("ln")) {
    let target = normalized.slice(2);
    if (!target) {
      return { success: false, message: "Natural log expression is incomplete" };
    }
    if (target.startsWith("(") && target.endsWith(")")) {
      target = target.slice(1, -1);
    }
    const value = Number(target);
    if (!Number.isFinite(value)) {
      return { success: false, message: "Natural log requires a numeric value" };
    }
    return { success: true, data: { operation: "ln", value } };
  }

  if (normalized.startsWith("sqrt")) {
    let target = normalized.slice(4);
    if (!target) {
      return { success: false, message: "Square root expression is incomplete" };
    }
    if (target.startsWith("(") && target.endsWith(")")) {
      target = target.slice(1, -1);
    }
    const value = Number(target);
    if (!Number.isFinite(value)) {
      return { success: false, message: "Square root requires a numeric value" };
    }
    return { success: true, data: { operation: "sqrt", value } };
  }

  if (normalized.startsWith("√")) {
    const value = Number(normalized.slice(1));
    if (!Number.isFinite(value)) {
      return { success: false, message: "Square root requires a numeric value" };
    }
    return { success: true, data: { operation: "sqrt", value } };
  }

  if (normalized.includes("^")) {
    const [base, exponent] = normalized.split("^");
    if (!base || !exponent) {
      return { success: false, message: "Power expression requires base and exponent" };
    }
    const baseNumber = Number(base);
    const exponentNumber = Number(exponent);
    if (!Number.isFinite(baseNumber) || !Number.isFinite(exponentNumber)) {
      return { success: false, message: "Power expression must contain valid numbers" };
    }
    return {
      success: true,
      data: { operation: "power", base: baseNumber, exponent: exponentNumber },
    };
  }

  const numericValue = Number(normalized);
  if (Number.isFinite(numericValue)) {
    return {
      success: true,
      data: { operation: "sqrt", value: numericValue },
    };
  }

  return { success: false, message: "Unable to parse expression" };
}

export default function Calculator() {
  const [operation, setOperation] = useState<OperationType>("sqrt");
  const [expression, setExpression] = useState("");
  const [value, setValue] = useState("0");
  const [base, setBase] = useState("2");
  const [exponent, setExponent] = useState("2");
  const [response, setResponse] = useState<CalcResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const copyTimeoutRef = useRef<number | null>(null);

  const activeMeta = OPERATION_DETAILS[operation];
  const expressionIsActive = expression.trim().length > 0;
  const hasResult = response?.result !== undefined;

  const resetCopyState = () => {
    if (copyTimeoutRef.current !== null) {
      if (typeof window !== "undefined") {
        window.clearTimeout(copyTimeoutRef.current);
      } else {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = null;
    }
    setCopyState("idle");
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        if (typeof window !== "undefined") {
          window.clearTimeout(copyTimeoutRef.current);
        } else {
          clearTimeout(copyTimeoutRef.current);
        }
      }
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setResponse(null);
    resetCopyState();

    let body:
      | { operation: OperationType; value: number }
      | { operation: OperationType; base: number; exponent: number };

    if (expression.trim()) {
      const parsed = parseExpression(expression);
      if (!parsed.success) {
        setResponse({ error: parsed.message });
        resetCopyState();
        setLoading(false);
        return;
      }

      const { data } = parsed;
      switch (data.operation) {
        case "sqrt":
        case "factorial":
        case "ln":
          body = { operation: data.operation, value: data.value };
          setValue(String(data.value));
          setOperation(data.operation);
          break;
        case "power":
          body = {
            operation: data.operation,
            base: data.base,
            exponent: data.exponent,
          };
          setOperation(data.operation);
          setBase(String(data.base));
          setExponent(String(data.exponent));
          break;
      }
    } else {
      switch (operation) {
        case "sqrt":
        case "factorial":
        case "ln":
          body = { operation, value: Number(value) };
          break;
        case "power":
          body = { operation, base: Number(base), exponent: Number(exponent) };
          break;
      }
    }

    try {
      const res = await fetch("/api/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as CalcResponse;
      if (!res.ok) {
        throw new Error(json.error ?? "Calculation failed");
      }
      setResponse(json);
      resetCopyState();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error occurred";
      setResponse({ error: message });
      resetCopyState();
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!hasResult || response?.error) {
      return;
    }
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyState("failed");
      return;
    }
    const valueToCopy = String(response.result ?? "");
    try {
      await navigator.clipboard.writeText(valueToCopy);
      setCopyState("copied");
      if (copyTimeoutRef.current !== null) {
        if (typeof window !== "undefined") {
          window.clearTimeout(copyTimeoutRef.current);
        } else {
          clearTimeout(copyTimeoutRef.current);
        }
      }
      if (typeof window !== "undefined") {
        copyTimeoutRef.current = window.setTimeout(() => {
          setCopyState("idle");
          copyTimeoutRef.current = null;
        }, 2000);
      }
    } catch {
      setCopyState("failed");
    }
  };

  const renderInputs = (): ReactNode => {
    switch (operation) {
      case "sqrt":
        return (
          <label className="field">
            <span>Value</span>
            <input
              type="number"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setResponse(null);
                resetCopyState();
              }}
              step="any"
              placeholder="Enter a non-negative number"
              required={!expressionIsActive}
            />
          </label>
        );
      case "factorial":
        return (
          <label className="field">
            <span>Integer</span>
            <input
              type="number"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setResponse(null);
                resetCopyState();
              }}
              step="1"
              min="0"
              placeholder="Enter a whole number"
              required={!expressionIsActive}
            />
          </label>
        );
      case "ln":
        return (
          <label className="field">
            <span>Positive Value</span>
            <input
              type="number"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setResponse(null);
                resetCopyState();
              }}
              min="0"
              step="any"
              placeholder="Enter a positive number"
              required={!expressionIsActive}
            />
          </label>
        );
      case "power":
        return (
          <>
            <label className="field">
              <span>Base</span>
              <input
                type="number"
                value={base}
                onChange={(event) => {
                  setBase(event.target.value);
                  setResponse(null);
                  resetCopyState();
                }}
                step="any"
                placeholder="e.g. 2"
                required={!expressionIsActive}
              />
            </label>
            <label className="field">
              <span>Exponent</span>
              <input
                type="number"
                value={exponent}
                onChange={(event) => {
                  setExponent(event.target.value);
                  setResponse(null);
                  resetCopyState();
                }}
                step="any"
                placeholder="e.g. 8"
                required={!expressionIsActive}
              />
            </label>
          </>
        );
    }
  };

  const inputsClassName =
    "calculator__inputs" +
    (operation === "power" ? " calculator__inputs--split" : "");

  return (
    <section className="calculator" aria-labelledby="calculator-heading">
      <div className="calculator__panel">
        <header className="calculator__panel-header">
          <span className="calculator__eyebrow">Interactive workspace</span>
          <h2 id="calculator-heading">Scientific Calculator</h2>
          <p>
            Choose an operation, type an expression, or use structured inputs to
            run quick calculations.
          </p>
        </header>

        <form className="calculator__form" onSubmit={handleSubmit}>
          <div className="calculator__actions" role="group" aria-label="Quick operations">
            {Object.entries(OPERATION_DETAILS).map(([key, meta]) => {
              const opKey = key as OperationType;
              const isActive = opKey === operation;
              const buttonClassName =
                "calculator__quick-button" +
                (isActive ? " calculator__quick-button--active" : "");
              return (
                <button
                  key={key}
                  type="button"
                  className={buttonClassName}
                  aria-pressed={isActive}
                  onClick={() => {
                    setOperation(opKey);
                    setExpression("");
                    setResponse(null);
                    resetCopyState();
                    if (opKey !== "power") {
                      setBase("2");
                      setExponent("2");
                    }
                  }}
                >
                  <span aria-hidden="true">{meta.glyph}</span>
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>

          <label className="field">
            <span>Expression (optional)</span>
            <input
              type="text"
              value={expression}
              onChange={(event) => {
                const next = event.target.value;
                setExpression(next);
                setResponse(null);
                resetCopyState();
                if (!next.trim()) {
                  return;
                }
                const parsed = parseExpression(next);
                if (parsed.success) {
                  const { data } = parsed;
                  switch (data.operation) {
                    case "sqrt":
                    case "factorial":
                    case "ln":
                      setOperation(data.operation);
                      setValue(String(data.value));
                      break;
                    case "power":
                      setOperation("power");
                      setBase(String(data.base));
                      setExponent(String(data.exponent));
                      break;
                  }
                }
              }}
              placeholder="Try 2^8, 5!, ln(10), or √144"
            />
          </label>

          <label className="field">
            <span>Operation</span>
            <select
              value={operation}
              onChange={(event) => {
                setOperation(event.target.value as OperationType);
                setExpression("");
                setResponse(null);
                resetCopyState();
              }}
            >
              {Object.entries(OPERATION_DETAILS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </label>

          <div className={inputsClassName}>{renderInputs()}</div>

          <button type="submit" disabled={loading}>
            {loading ? "Calculating…" : `Calculate ${activeMeta.label}`}
          </button>
        </form>

        <p className="calculator__fineprint">
          All calculations run locally with precision-handled floating point
          utilities and safeguards for factorial growth.
        </p>
      </div>

      <aside className="calculator__sidebar" aria-live="polite">
        <div className="calculator__result">
          <div className="calculator__result-header">
            <span className="calculator__eyebrow">Result preview</span>
            {copyState === "copied" ? (
              <span className="calculator__copy-status">Copied!</span>
            ) : null}
            {copyState === "failed" ? (
              <span className="calculator__copy-status calculator__copy-status--error">
                Copy unavailable
              </span>
            ) : null}
          </div>
          {hasResult && !response?.error ? (
            <button
              type="button"
              className="calculator__result-button"
              onClick={handleCopy}
              aria-label={`Copy result ${formatResult(response?.result)}`}
            >
              <div className="calculator__result-scroller" role="presentation">
                <span className="calculator__result-value">
                  {formatResult(response?.result)}
                </span>
              </div>
              <span className="calculator__result-copy-hint">
                {copyState === "copied"
                  ? "Copied to clipboard"
                  : copyState === "failed"
                  ? "Copy not supported"
                  : "Tap to copy"}
              </span>
            </button>
          ) : null}
          {response?.error ? (
            <p className="calculator__result-error">{response.error}</p>
          ) : null}
          {!hasResult && !response?.error ? (
            <p className="calculator__result-placeholder">
              Provide your inputs and run the calculation to see the answer here.
            </p>
          ) : null}
        </div>

        <ul className="calculator__operations" role="list">
          {Object.entries(OPERATION_DETAILS).map(([key, meta]) => {
            const isActive = operation === key;
            const itemClassName =
              "calculator__operation" +
              (isActive ? " calculator__operation--active" : "");
            return (
              <li key={key} className={itemClassName} role="listitem">
                <span className="calculator__operation-glyph" aria-hidden="true">
                  {meta.glyph}
                </span>
                <div className="calculator__operation-details">
                  <span className="calculator__operation-label">{meta.label}</span>
                  <span className="calculator__operation-domain">{meta.domain}</span>
                </div>
              </li>
            );
          })}
        </ul>

        <article className="calculator__meta" aria-label="Operation guidance">
          <h3>{activeMeta.label}</h3>
          <p>{activeMeta.description}</p>
          <dl>
            <div>
              <dt>Inputs</dt>
              <dd>{activeMeta.domain}</dd>
            </div>
            <div>
              <dt>Example</dt>
              <dd>{activeMeta.example}</dd>
            </div>
          </dl>
        </article>
      </aside>
    </section>
  );
}
