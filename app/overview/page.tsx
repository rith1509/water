import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metrics } from "@/components/metrics";
import { RainwaterTab } from "@/components/rainwater-tab";
import { WasteTab } from "@/components/waste-tab";
import { PageHeader } from "@/components/site/bits";
import { Shell } from "@/components/site/shell";

export default function OverviewPage() {
  return (
    <Shell>
      <PageHeader
        code="00"
        title="Overview"
        lede="All five survey modules on one page. Switch between rainwater and water waste, or filter the waste charts by bhawan."
      />
      <Metrics />
      <Tabs defaultValue="rainwater" className="mt-10 gap-5">
        <TabsList>
          <TabsTrigger value="rainwater">Rainwater harvesting</TabsTrigger>
          <TabsTrigger value="waste">Water waste management</TabsTrigger>
        </TabsList>
        <TabsContent value="rainwater">
          <RainwaterTab />
        </TabsContent>
        <TabsContent value="waste">
          <WasteTab />
        </TabsContent>
      </Tabs>
    </Shell>
  );
}
