import { HarvestingPage } from "@/components/pages/harvesting";
import { PageHeader } from "@/components/site/bits";
import { Shell } from "@/components/site/shell";

export default function Page() {
  return (
    <Shell>
      <PageHeader
        code="02"
        title="Catch it before it pools"
        lede="Students proposed twelve ways to harvest rainwater and named the roofs and grounds they'd start with. Find the quick wins, then size a tank."
      />
      <HarvestingPage />
    </Shell>
  );
}
