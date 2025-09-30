import Calculator from "@/components/Calculator";

export default function Home() {
  return (
    <main className="container">
      <header>
        <h1>SciCalc Next</h1>
        <p>
          Evaluate square roots, factorials, natural logarithms, and power
          operations quickly.
        </p>
      </header>
      <Calculator />
    </main>
  );
}
