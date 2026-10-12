// PSA charts on AG Charts (community, MIT): https://www.ag-grid.com/charts/
// Every element with data-chart='{"type": ..., ...}' is drawn here; PSA.chart(el, spec) draws one from page code.
// Types: "psi" (PSI by outing), "curve" (part score against d), "workload" (pitches per game day, one tournament).
(() => {
  const C = { ink: "#e4e9f0", ink2: "#98a4b5", muted: "#7a8699", grid: "#1f2a3d", line: "#24304a",
              blue: "#6f9ee8", amber: "#f2b84b", bad: "#e5484d", soft: "rgba(242,184,75,0.12)" };
  const mono = "JetBrains Mono, ui-monospace, monospace", sans = "Inter, 'Noto Sans TC', sans-serif";
  const tick = { color: C.muted, fontFamily: mono, fontSize: 11 };
  const base = (el, spec) => ({
    container: el, background: { visible: false }, padding: { top: 12, right: 12, bottom: 4, left: 4 },
    legend: { enabled: false }, animation: { enabled: false }, theme: "ag-default-dark", data: spec.data,
  });
  const yAxis = (min, max, values, extra = {}) => ({
    type: "number", position: "left", min, max, interval: { values },
    label: tick, line: { enabled: false }, gridLine: { style: [{ stroke: C.grid, lineDash: [] }] }, ...extra,
  });
  const xCat = (extra = {}) => ({ type: "category", position: "bottom", label: { ...tick, autoRotate: false },
                                  line: { stroke: C.line }, gridLine: { enabled: false }, paddingInner: 0.35, ...extra });

  const types = {
    // PSI by outing: blue line, the lowest outing in amber with its date and value.
    psi(el, spec) {
      const low = spec.data.reduce((a, b) => (b.psi < a.psi ? b : a));
      return { ...base(el, spec),
        series: [{ type: "line", xKey: "date", yKey: "psi", stroke: C.blue, strokeWidth: 2,
          marker: { size: 8, fill: C.blue, stroke: "#0f1828", strokeWidth: 2,
                    itemStyler: ({ datum }) => (datum === low ? { fill: C.amber, size: 11 } : {}) },
          label: { enabled: true, color: C.ink, fontFamily: sans, fontSize: 12,
                   formatter: ({ datum }) => (datum === low ? `${datum.date} · ${datum.psi}` : "") },
          tooltip: { renderer: ({ datum }) => ({ heading: datum.date, data: [{ label: "PSI", value: String(datum.psi) }] }) } }],
        axes: { x: xCat({ label: { ...tick, autoRotate: false, avoidCollisions: true } }), y: yAxis(0, 100, [0, 50, 100]) } };
    },
    // Part score = 100·e^(−d²/4) for d in 0..3, with the threshold (d = 1) and twice it (d = 2) marked.
    curve(el, spec) {
      const data = Array.from({ length: 61 }, (_, i) => ({ d: i / 20, s: 100 * Math.exp(-((i / 20) ** 2) / 4) }));
      const marks = [{ d: 1, s: 100 * Math.exp(-0.25), t: spec.labels?.[0] ?? "78 at the threshold", c: C.blue },
                     { d: 2, s: 100 * Math.exp(-1), t: spec.labels?.[1] ?? "37 at twice it", c: C.amber }];
      return { ...base(el, { data }), padding: { top: 8, right: 16, bottom: 0, left: 0 },
        series: [{ type: "line", xKey: "d", yKey: "s", stroke: C.blue, strokeWidth: 2, marker: { enabled: false },
                   tooltip: { renderer: ({ datum }) => ({ heading: `d = ${datum.d.toFixed(2)}`, data: [{ label: "score", value: datum.s.toFixed(0) }] }) } },
                 { type: "scatter", data: marks, xKey: "d", yKey: "s", size: 9,
                   itemStyler: ({ datum }) => ({ fill: datum.c, stroke: "#0f1828", strokeWidth: 2 }),
                   label: { enabled: true, color: C.ink, fontFamily: sans, fontSize: 11, placement: "right", formatter: ({ datum }) => datum.t },
                   tooltip: { enabled: false } }],
        axes: { x: { type: "number", position: "bottom", min: 0, max: 3, interval: { values: [0, 1, 2, 3] },
                 label: { ...tick, formatter: ({ value }) => (value === 3 ? "d = 3" : String(value)) }, line: { stroke: C.line }, gridLine: { enabled: false } },
               y: yAxis(0, 100, [0, 50, 100]) } };
    },
    // One tournament's game days: pitches per outing (amber; red when a rule was broken), the daily cap as a dashed
    // line, and the required rest in the label and tooltip. Only game days are on the axis.
    workload(el, spec) {
      return { ...base(el, spec), padding: { top: 18, right: 12, bottom: 4, left: 4 },
        title: spec.title ? { text: spec.title, color: C.ink, fontFamily: sans, fontSize: 13, fontWeight: 500, textAlign: "left" } : undefined,
        series: [{ type: "bar", xKey: "day", yKey: "pitches", cornerRadius: 3,
          itemStyler: ({ datum }) => ({ fill: datum.ok ? C.amber : C.bad, stroke: datum.ok ? C.amber : C.bad }),
          label: { enabled: true, placement: "outside-end", color: C.ink, fontFamily: mono, fontSize: 11 },
          tooltip: { renderer: ({ datum }) => ({ heading: `${datum.date} · ${datum.round}`, data: [
            { label: "pitches", value: String(datum.pitches) },
            { label: "rest required", value: `${datum.rest} day${datum.rest === 1 ? "" : "s"}` },
            { label: "next eligible", value: datum.eligible ?? "–" },
            { label: "rule check", value: datum.notes } ] }) } }],
        axes: { x: xCat(), y: yAxis(0, 120, [0, spec.cap ?? 105],
          { crossLines: [{ type: "line", value: spec.cap ?? 105, stroke: C.muted, lineDash: [4, 4], strokeWidth: 1 }] }) } };
    },
  };

  const draw = (el, spec) => {
    if (!window.agCharts || !types[spec.type]) return null;
    el.replaceChildren();
    return agCharts.AgCharts.create(types[spec.type](el, spec));
  };
  window.PSA = { ...(window.PSA || {}), chart: draw };
  const all = () => document.querySelectorAll("[data-chart]").forEach(el => {
    // Chart text lives in the page as <span data-label> children (translated with the page), read before drawing.
    const labels = [...el.querySelectorAll("[data-label]")].map(x => x.textContent.trim());
    try { draw(el, { ...JSON.parse(el.dataset.chart), ...(labels.length ? { labels } : {}) }); } catch (e) { console.warn("PSA chart", e); }
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", all); else all();
})();
