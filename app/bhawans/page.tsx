import { Suspense } from "react";
import { BhawansPage } from "@/components/pages/bhawans";
import { PageHeader } from "@/components/site/bits";
import { Shell } from "@/components/site/shell";

export default function Page() {
  return (
    <Shell>
      <PageHeader
        code="03"
        title="Eleven bhawans, side by side"
        lede="Colour the hostels by what matters to you, watch them re-rank, and open one to see its complaints and how long repairs take."
      />
      <Suspense>
        <BhawansPage />
      </Suspense>
    </Shell>
  );
}
