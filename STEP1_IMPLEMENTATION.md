# Step 1 — Information Hierarchy Rebuild

## 1. What is currently working and must be protected

- **All existing IDs** — Every `id` used by JS is unchanged: `predictions`, `predictionSummaryRow`, `predictionInterpretation`, `predictionInterpretationText`, `predictionChart`, `predictionNote`, `predictionPatterns`; `patterns`, `radarTitle`, `radarControls`, `radarModeWeekly`, `radarModeMonthly`, `radarMonthSelectWrap`, `radarMonthTrigger`, `radarSelectedMonthLabel`, `radarMonthPopover`, `radarChartContextLabel`, `radarChartEmpty`, `radarChartWrap`, `radarChart`, `distributionChart`, `distributionChartSummary`, `sleepTimelineControls`, `sleepTimelineChart`, `timeHeatmap`, `dowChart`, `dowChartInsight`; `entry`, `entryProgressBarWrap`, `entryProgressBarFill`, `entryProgressLabel`, all entry section and support-rail IDs.
- **Chart hooks** — `#predictionChart`, `#radarChart`, `#distributionChart`, `#dowChart` remain in the DOM with the same IDs; `exportChartPNG()`, `renderPredictions()`, `renderRadarChart()`, etc. are unchanged.
- **Correlations / Circadian** — Not touched; no changes in `#correlations` or `#circadian` or their rendering.
- **Data logic** — No changes to `renderPredictions()`, `renderRadarChart()`, `renderDistributionChart()`, `renderDayOfWeekChart()`, or entry save/load logic.
- **Navigation and routing** — `navigate('predictions'|'patterns'|'entry')` and bottom-nav/FAB behavior unchanged.

## 2. What is risky to touch

- **Correlations / Circadian** — Fragile rendering; do not change their HTML structure or the double-rAF chart timing in `navigate()`.
- **Prediction interpretation visibility** — JS may set `predictionInterpretation.style.display`; the element still exists with `id="predictionInterpretation"` and now has additional classes `card card--support`. If any code assumed it was the only child of a parent, verify (current code uses `getElementById`).
- **Radar controls** — The element with `id="radarControls"` now has classes `patterns-toolbar radar-controls`; event listeners are bound to the same node. Safe.
- **Support rail structure** — New wrapper divs `.support-rail-group` were added around support cards; no IDs changed, so `getElementById('supportRailDate')` etc. still work.

## 3. Exact implementation changes

### index.html

**Forecast (#predictions)**  
- Wrapped title and subtitle in `<header class="page-hero forecast-hero">`; subtitle class changed from `page-subtitle` to `page-hero-subtitle`.  
- Wrapped summary row + main chart in `<section class="forecast-chart-section">`.  
- Replaced the single “Next 7 days” card with:  
  - `<div class="card card--chart forecast-chart-card">` → `<div class="forecast-chart-inner">` → `<div class="forecast-chart-canvas-wrap">` containing `#predictionChart`, then legend, `#predictionNote`, export button.  
- Kept the short helper paragraph (“The line is your forecast…”) inside the chart card with class `forecast-chart-helper`.  
- Moved interpretation and “What your data says” into `<div class="forecast-support-cards">`; both are `<div class="card card--support">` with `<h3 class="card--support-heading">`; `#predictionInterpretation` and `#predictionPatterns` unchanged.

**Patterns (#patterns)**  
- Wrapped title and subtitle in `<header class="page-hero patterns-hero">`; subtitle class `page-hero-subtitle`.  
- Radar block moved into `<section class="patterns-hero-chart">` and `<div class="card card--chart patterns-radar-card">`.  
- Controls wrapper given `patterns-toolbar radar-controls` and kept `id="radarControls"`; added `<h3 id="radarTitle" class="patterns-hero-chart-title">` before context label.  
- Added `<div class="patterns-explainer">` with a short explanatory sentence.  
- Wrapped Distribution + Sleep Timeline + Time of Day + Weekly Rhythm in `<section class="patterns-secondary">`; each of those cards given `card--secondary`.  
- `dashboard-grid` now only wraps the Distribution card (and any future grid items); other cards are full-width below.

**Daily Check-In (#entry)**  
- Wrapped title in `<header class="page-hero entry-page-header">` and added `<p class="page-hero-subtitle">` with intro copy.  
- Wrapped progress bar and label in `<div class="entry-progress-block">`.  
- Wrapped each logical group of support cards in `<div class="support-rail-group">` (status card; snapshot card; cue card).

### css/layout.css

- Added `.page-hero`, `.page-hero h1`, `.page-hero-subtitle`.  
- Added Forecast: `.forecast-hero`, `.forecast-chart-section`, `.forecast-support-cards`.  
- Added Patterns: `.patterns-hero`, `.patterns-hero-chart`, `.patterns-explainer`, `.patterns-explainer-text`, `.patterns-secondary`.  
- Added Entry: `.entry-page-header`, `.entry-progress-block`, `.support-rail-group`, `.support-rail-group + .support-rail-group`.  
- Added a small mobile override for hero subtitle and explainer.

### css/components.css

- Added card hierarchy: `.card--chart`, `.card--support`, `.card--support-heading`, `.card--secondary` (with smaller h3 and desc).  
- Removed `margin-bottom` from `.prediction-interpretation` (spacing from `.forecast-support-cards` gap).

### css/charts.css

- Added `.forecast-chart-canvas-wrap` with fixed height (320px default, 380px desktop, 260px mobile) and canvas fill.  
- Added `.patterns-toolbar`, `.patterns-hero-chart-title`, `.patterns-radar-card .radar-context-label` for Patterns hero and toolbar.

---

## 4. Before/after code blocks

### index.html — Forecast (summary)

**BEFORE**  
- `<h1>`, `<p class="page-subtitle">`  
- `#predictionSummaryRow`, `#predictionInterpretation`  
- One card with “Next 7 days”, paragraph, div with height 280px, `#predictionChart`, legend, note, export  
- One card “What your data says” with `#predictionPatterns`

**AFTER**  
- `<header class="page-hero forecast-hero">` with `<h1>`, `<p class="page-hero-subtitle">`  
- `<section class="forecast-chart-section">` with `#predictionSummaryRow`, then `<div class="card card--chart forecast-chart-card">` → `forecast-chart-inner` → helper `<p>`, `forecast-chart-canvas-wrap` with `#predictionChart`, legend, `#predictionNote`, export  
- `<div class="forecast-support-cards">` with two `card card--support` divs: one `#predictionInterpretation` (“Interpretation”), one “What your data says” with `#predictionPatterns`

### index.html — Patterns (summary)

**BEFORE**  
- `<h1>`, `<p class="page-subtitle">`  
- `dashboard-grid` with two cards: first card had radar (title, desc, radar-controls, context label, empty msg, chart wrap, export); second card Distribution  
- Then three more cards: Sleep Timeline, Mood by Time of Day, Weekly Rhythm

**AFTER**  
- `<header class="page-hero patterns-hero">` with `<h1>`, `<p class="page-hero-subtitle">`  
- `<section class="patterns-hero-chart">` with `<div class="card card--chart patterns-radar-card">`: `patterns-toolbar radar-controls` (id="radarControls"), `h3#radarTitle`, context label, empty msg, chart wrap, export  
- `<div class="patterns-explainer">` with one `<p>`  
- `<section class="patterns-secondary">` with `dashboard-grid` (Distribution card with `card--secondary`), then Sleep Timeline, Mood by Time of Day, Weekly Rhythm cards each with `card--secondary`

### index.html — Daily Check-In (summary)

**BEFORE**  
- `<h1>Daily Check-In</h1>`  
- `checkin-form-wrap` → `checkin-desktop-layout` → `checkin-form` with progress wrap, sections, actions; `checkin-support-rail` with three `support-card` divs

**AFTER**  
- `<header class="page-hero entry-page-header">` with `<h1>`, `<p class="page-hero-subtitle">`  
- Same wrap/layout; progress wrap wrapped in `<div class="entry-progress-block">`  
- Support rail: each of the three support cards wrapped in `<div class="support-rail-group">`

### layout.css

**ADDED** (after `.page-subtitle`)  
- `.page-hero`, `.page-hero h1`, `.page-hero-subtitle`  
- `.forecast-hero`, `.forecast-chart-section`, `.forecast-support-cards`  
- `.patterns-hero`, `.patterns-hero-chart`, `.patterns-explainer`, `.patterns-explainer-text`, `.patterns-secondary`  
- `.entry-page-header`, `.entry-progress-block`, `.support-rail-group`, `.support-rail-group + .support-rail-group`  
- Mobile overrides for hero subtitle and explainer

### components.css

**ADDED** (after `.card h3`)  
- `.card--chart`, `.card--support`, `.card--support-heading`, `.card--secondary` (and child overrides for h3 / patterns-card-desc)  
- `.prediction-interpretation`: removed `margin-bottom`

### charts.css

**ADDED** (after the patterns/seasonal media block)  
- `.forecast-chart-canvas-wrap` (height 320/380/260) and canvas fill  
- `.patterns-toolbar`, `.patterns-hero-chart-title`, `.patterns-radar-card .radar-context-label`

---

## 5. Manual QA checklist

- [ ] **Forecast**  
  - [ ] Page opens from sidebar/bottom nav.  
  - [ ] Hero shows “Mood Forecast” and subtitle.  
  - [ ] Summary chips (Days of data, Recent avg, etc.) appear when data exists.  
  - [ ] Main chart renders in the center card without distortion; export works.  
  - [ ] When present, Interpretation card appears below with “Interpretation” heading.  
  - [ ] “What your data says” card shows pattern text.  
  - [ ] With &lt;7 days of data, note message shows; no JS errors.

- [ ] **Patterns**  
  - [ ] Page opens; hero shows “Patterns & Rhythms” and subtitle.  
  - [ ] Radar chart is the first large card; toolbar (Last 7 Days / Monthly) works; month picker works in monthly mode.  
  - [ ] Explainer text appears below radar card.  
  - [ ] Mood Distribution, Sleep Timeline, Mood by Time of Day, Weekly Rhythm render and look visually secondary (slightly smaller/demoted).  
  - [ ] Export for radar and distribution charts works.  
  - [ ] Sleep timeline range buttons and heatmap work.

- [ ] **Daily Check-In**  
  - [ ] Page opens; header shows “Daily Check-In” and new subtitle.  
  - [ ] Progress block (bar + label) appears and updates as sections are filled.  
  - [ ] All four sections (Date, Mood & Energy, Sleep, Activities & Tags, Journal) open/close and save.  
  - [ ] On desktop, support rail shows with status, snapshot, and reflection cue; grouping/spacing looks intentional.  
  - [ ] Save Entry works; support rail snapshot and date/draft update.

- [ ] **Cross-page**  
  - [ ] No console errors on load or when switching between Forecast, Patterns, Entry.  
  - [ ] Correlations and Circadian pages unchanged and still render correctly.  
  - [ ] Mobile: Forecast and Patterns hero/chart and Entry header/progress look correct; support rail hidden on small screens.
