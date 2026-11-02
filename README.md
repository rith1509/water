# commReach · campus water survey

Next.js 16, Tailwind v4, shadcn/ui (Tabs, Select, Card), Recharts, three.js via @react-three/fiber + drei, and Motion.

## Pages

| Route | What you can do |
|---|---|
| `/` | 3D landing: five ice blocks, each with its section frozen inside. Hover to look, click to open. Rain, wet floor, camera follows the mouse. |
| `/overview` | The original dashboard: metric cards, Rainwater / Water Waste tabs, bhawan filter. |
| `/waterlogging` | Schematic campus map. Drag rainfall to grow puddles, filter by year of study, click a spot for severity, quotes and year breakdown. |
| `/harvesting` | Feasibility-vs-cost bubble chart with cost filter, catchment ranking by reason, harvest calculator with an animated tank. |
| `/bhawans` | Eleven tiles that re-rank by metric, detail panel, radar comparison of two bhawans. `?b=Govind` deep-links. |
| `/pipeline` | Simulate one leak through Gen Sec → Supervisor → Asst. Warden → Plumber vs. Channel-i SOS; tune each wait and the leak rate. |
| `/fixes` | Yes / Maybe / No bars per fix (sortable, per bhawan), and a plan builder that shows how much of the reported waste a set of fixes covers. |

Everywhere: press `⌘K` / `Ctrl K` or `/` to jump to any page, bhawan or tool. Headings decode letter by letter.

The calculator and pipeline defaults (roof areas, rainfall, step waits, leak rates) are placeholders for playing with, not measurements.

```bash
npm install
npm run dev      # http://localhost:3000
```

## Data

The five survey arrays live in `data/` as JSON. `data/surveyData.ts` imports them, types them and builds every
aggregate the charts use (waterlogging by location, grouped solutions, catchments, issues per bhawan, preferred fixes,
headline metrics). To use real responses, replace the JSON files and keep the same field names.

| File | Fields |
|---|---|
| `rainwater_problems.json` | student_id, year_of_study, observed_issue, severity (1–5), location |
| `rainwater_solutions.json` | student_id, proposed_solution, feasibility_rating (1–5), cost_estimate_category |
| `rainwater_locations.json` | student_id, suggested_building_or_ground, reasoning_category |
| `water_waste_problems_bhawan.json` | student_id, bhawan_name, primary_water_waste_issue, repair_delay_rating (1–10) |
| `water_waste_solutions.json` | student_id, bhawan_name, actionable_solution, willingness_to_implement |

Free-text answers are bucketed by keyword in `surveyData.ts` (`solutionGroup`, `issueKey`, `fixGroup`). Adjust those
if new answers fall into "Other".

## Layout

- `app/page.tsx` + `components/home.tsx` + `components/three/hero-scene.tsx`: 3D landing
- `app/*/page.tsx` + `components/pages/*`: one interactive page each
- `components/site/*`: nav, ⌘K menu, cursor ring, scramble text, panels, sliders, counters
- `app/overview/page.tsx`: header, metric cards, tabs
- `components/metrics.tsx`: the four summary cards
- `components/rainwater-tab.tsx`, `components/waste-tab.tsx`: tab bodies
- `components/charts/*`: one file per chart, plus the shared tooltip and ruled legend
- `components/ui/*`: shadcn primitives
- `lib/palette.ts`: chart colours (mirrors the CSS tokens in `app/globals.css`)
