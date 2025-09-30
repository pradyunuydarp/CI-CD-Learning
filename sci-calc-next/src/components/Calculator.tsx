"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type OperationType = "sqrt" | "factorial" | "ln" | "power";

type CalcResponse = {
  result?: number;
  error?: string;
};

const OPERATION_LABELS: Record<OperationType, string> = {
  sqrt: "Square Root",
  factorial: "Factorial",
  ln: "Natural Logarithm",
  power: "Exponentiation",
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

export default function Calculator() {
  const [operation, setOperation] = useState<OperationType>("sqrt");
  const [value, setValue] = useState("0");
  const [base, setBase] = useState("2");
  const [exponent, setExponent] = useState("2");
  const [response, setResponse] = useState<CalcResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setResponse(null);

    const body = (() => {
      switch (operation) {
        case "sqrt":
        case "factorial":
        case "ln":
          return { operation, value: Number(value) };
        case "power":
          return { operation, base: Number(base), exponent: Number(exponent) };
      }
    })();

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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error occurred";
      setResponse({ error: message });
    } finally {
      setLoading(false);
    }
  };

  const renderInputs = () => {
    switch (operation) {
      case "sqrt":
        return (
          <label className="field">
            <span>Value</span>
            <input
              type="number"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              step="any"
              required
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
              onChange={(event) => setValue(event.target.value)}
              step="1"
              required
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
              onChange={(event) => setValue(event.target.value)}
              min="0"
              step="any"
              required
            />
          </label>
        );
      case "power":
        return (
          <div className="grid">
            <label className="field">
              <span>Base</span>
              <input
                type="number"
                value={base}
                onChange={(event) => setBase(event.target.value)}
                step="any"
                required
              />
            </label>
            <label className="field">
              <span>Exponent</span>
              <input
                type="number"
                value={exponent}
                onChange={(event) => setExponent(event.target.value)}
                step="any"
                required
              />
            </label>
          </div>
        );
    }
  };

  return (
    <section className="calculator">
      <h2>Scientific Calculator</h2>
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>Operation</span>
          <select
            value={operation}
            onChange={(event) => setOperation(event.target.value as OperationType)}
          >
            {Object.entries(OPERATION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {renderInputs()}
        <button type="submit" disabled={loading}>
          {loading ? "Calculating…" : "Calculate"}
        </button>
      </form>
      {response?.result !== undefined && (
        <output>
          Result: <strong>{formatResult(response.result)}</strong>
        </output>
      )}
      {response?.error && <p className="error">{response.error}</p>}
    </section>
  );
}
