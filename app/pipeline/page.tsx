import { PipelinePage } from "@/components/pages/pipeline";
import { PageHeader } from "@/components/site/bits";
import { Shell } from "@/components/site/shell";

export default function Page() {
  return (
    <Shell>
      <PageHeader
        code="04"
        title="Why a tap runs for a week"
        lede="Today a leak goes Gen Sec → Supervisor → Assistant Warden → Plumber. Send one through that chain and through a direct Channel-i ticket, and count the water."
      />
      <PipelinePage />
    </Shell>
  );
}
