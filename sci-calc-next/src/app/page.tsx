import Calculator from "@/components/Calculator";

export default function Home() {
  return (
    <main className="container" aria-labelledby="page-title">
      <header className="page-header">
        <h1 id="page-title">SciCalc Next</h1>
        <p className="page-subtitle">
          Compute square roots, factorials, natural logarithms, and power
          operations without distractions.
        </p>
      </header>
      <Calculator />
    </main>
  );
}
