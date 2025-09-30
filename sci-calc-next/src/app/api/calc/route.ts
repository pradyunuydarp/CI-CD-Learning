import { NextRequest, NextResponse } from "next/server";
import { evaluate, Operation } from "@/lib/math";

type CalcRequest = {
  operation: Operation["type"];
  value?: number;
  base?: number;
  exponent?: number;
};

function toOperation(payload: CalcRequest): Operation {
  const { operation, value, base, exponent } = payload;

  switch (operation) {
    case "sqrt":
      if (value === undefined) {
        throw new Error("Missing 'value' for sqrt operation");
      }
      return { type: "sqrt", value };
    case "factorial":
      if (value === undefined) {
        throw new Error("Missing 'value' for factorial operation");
      }
      return { type: "factorial", value };
    case "ln":
      if (value === undefined) {
        throw new Error("Missing 'value' for ln operation");
      }
      return { type: "ln", value };
    case "power":
      if (base === undefined || exponent === undefined) {
        throw new Error("Missing 'base' or 'exponent' for power operation");
      }
      return { type: "power", base, exponent };
    default:
      throw new Error(`Unsupported operation '${operation}'`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CalcRequest;
    if (!payload?.operation) {
      throw new Error("Operation is required");
    }

    const result = evaluate(toOperation(payload));
    return NextResponse.json({ result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
