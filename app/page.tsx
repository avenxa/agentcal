import Link from "next/link";

import { SellScenarioApp } from "./sell-scenario-app";

export default function Home() {
  return (
    <>
      <SellScenarioApp />
      <p className="sc-caption" style={{ textAlign: "center", padding: "0 16px 24px" }}>
        <Link href="/buy" className="v2-link-button" data-testid="to-buy">
          Buying instead? BUY estimate →
        </Link>
      </p>
    </>
  );
}
