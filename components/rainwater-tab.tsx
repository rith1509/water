import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CatchmentBar } from "@/components/charts/catchment-bar";
import { ShareList } from "@/components/charts/share-list";
import { SolutionsPie } from "@/components/charts/solutions-pie";
import { WaterloggingBar } from "@/components/charts/waterlogging-bar";
import { catchmentReasons, solutionShares, topCatchments, waterloggingByLocation } from "@/data/surveyData";
import { water } from "@/lib/palette";

export function RainwaterTab() {
  const worst = waterloggingByLocation[0];
  const second = waterloggingByLocation[1];
  const topFix = solutionShares[0];
  const [c1, c2] = topCatchments;

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="lg:col-span-7">
        <CardHeader>
          <CardTitle>Where water stands after rain</CardTitle>
          <CardDescription>
            {worst.location} and {second.location} draw the most reports. Bars split by how bad students
            rated it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pt-4">
          <WaterloggingBar />
        </CardContent>
      </Card>

      <Card className="lg:col-span-5">
        <CardHeader>
          <CardTitle>What students would build</CardTitle>
          <CardDescription>
            {topFix.share}% back {topFix.name.toLowerCase()}, mostly along the SAC and LHC paths.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <SolutionsPie />
        </CardContent>
      </Card>

      <Card className="lg:col-span-7">
        <CardHeader>
          <CardTitle>Best places to catch it</CardTitle>
          <CardDescription>
            Top suggested catchments. {c1.name} and {c2.name} lead; the top three are highlighted.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <CatchmentBar />
        </CardContent>
      </Card>

      <Card className="lg:col-span-5">
        <CardHeader>
          <CardTitle>Why those spots</CardTitle>
          <CardDescription>The reason given with each catchment suggestion.</CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          <ShareList rows={catchmentReasons} colors={[water[600]]} bars />
        </CardContent>
      </Card>
    </div>
  );
}
