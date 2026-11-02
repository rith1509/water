import { WaterloggingPage } from "@/components/pages/waterlogging";
import { PageHeader } from "@/components/site/bits";
import { Shell } from "@/components/site/shell";

export default function Page() {
  return (
    <Shell>
      <PageHeader
        code="01"
        title="Where water stands"
        lede="Five spots on campus collect water after rain. Push the rainfall up, filter by year of study, and click a spot to read what students reported there."
      />
      <WaterloggingPage />
    </Shell>
  );
}
