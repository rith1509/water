import { FixesPage } from "@/components/pages/fixes";
import { PageHeader } from "@/components/site/bits";
import { Shell } from "@/components/site/shell";

export default function Page() {
  return (
    <Shell>
      <PageHeader
        code="05"
        title="Fixes students would back"
        lede="Ten concrete fixes, rated Yes, Maybe or No by the students who'd live with them. Sort them, filter by bhawan, then build a plan and see how much of the waste it covers."
      />
      <FixesPage />
    </Shell>
  );
}
