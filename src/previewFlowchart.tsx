/* Standalone harness for the end-of-part flowchart.
 *
 * Runs the real flagship story through the real gating/consequence engine to
 * produce a genuine JourneyStep[], then renders the real <Flowchart>. This
 * exists so the animation can be reviewed without replaying the whole game.
 *
 * Dev-only: not imported by the app, not part of the production bundle.
 */
import { useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { NOBODYS_WITNESS_FLAGSHIP as S } from "./data/nobodysWitnessFlagship";
import { applyConsequences, createInitialState, meetsGating } from "./logic";
import { Flowchart } from "./game/Flowchart";
import { RouteMap } from "./game/RouteMap";
import type { JourneyStep, SceneNode, Choice } from "./types";

const byId = new Map(S.scenes.map((x) => [x.id, x]));

function buildJourney(picks: Record<string, string>, qteExpire = false) {
  let st = createInitialState(S);
  let id = S.startSceneId;
  const journey: JourneyStep[] = [];

  const rec = (sc: SceneNode, choice: Choice | null, timedOut = false) => {
    const siblings = (sc.choices ?? []).filter((c) => !c.reply && c.targetSceneId);
    const options = siblings
      .filter((c) => !(c.hidden && !meetsGating(c.gating, st)))
      .map((c) => ({
        id: c.id,
        text: c.text,
        // a timed-out prompt was not chosen — the player let it lapse
        taken: !!choice && !timedOut && c.id === choice.id,
        locked: !meetsGating(c.gating, st),
        attitudeTag: c.attitudeTag,
      }));
    journey.push({
      sceneId: sc.id,
      sceneTitle: sc.title,
      choiceId: choice?.id ?? null,
      choiceText: choice?.text,
      attitudeTag: choice?.attitudeTag,
      options,
      rememberLine: choice?.rememberLine,
      timedOut: timedOut || undefined,
      trustChanges: choice?.consequences?.trustChanges,
      flagsSet: [
        ...(choice?.consequences?.setFlags ?? []),
        ...(timedOut ? (choice?.timedOutConsequences?.setFlags ?? []) : []),
      ],
    });
  };

  let ending: SceneNode | null = null;
  for (let g = 0; g < 90; g++) {
    const sc = byId.get(id);
    if (!sc) break;
    for (const a of sc.onEnterActions ?? []) if (a.consequences) st = applyConsequences(S, a.consequences, st);
    if (sc.isEnding) {
      ending = sc;
      break;
    }
    const used = new Set<string>();
    for (let r = 0; r < 40; r++) {
      const reps = (sc.choices ?? []).filter(
        (c) => (c.reply || c.targetSceneId === "") && !used.has(c.id) && (!c.gating || meetsGating(c.gating, st))
      );
      if (!reps.length) break;
      const rp = reps[0];
      used.add(rp.id);
      if (rp.consequences) st = applyConsequences(S, rp.consequences, st);
    }
    const nav = (sc.choices ?? []).filter(
      (c) => !c.reply && c.targetSceneId && (!c.gating || meetsGating(c.gating, st))
    );
    if (!nav.length) break;
    const pick = nav.find((c) => c.id === picks[sc.id]) ?? nav[0];
    if (pick.quickTime && qteExpire) {
      rec(sc, pick, true);
      if (pick.timedOutConsequences) st = applyConsequences(S, pick.timedOutConsequences, st);
      // nav is filtered on c.targetSceneId, so both fall throughs are set.
      id = pick.timedOutTargetSceneId ?? pick.targetSceneId!;
      continue;
    }
    rec(sc, pick);
    if (pick.consequences) st = applyConsequences(S, pick.consequences, st);
    id = pick.targetSceneId!;
  }
  return { journey, ending };
}

const ROUTES: { label: string; picks: Record<string, string>; qte?: boolean }[] = [
  {
    label: "Gold — asked Moe, told her",
    picks: { nw2_diner: "nw2_take", nw2_p4b_poolhall: "nw2_p4b_ask", nw2_p6_booth: "nw2_p6_tell" },
  },
  {
    label: "Gold — QTE expired",
    picks: { nw2_diner: "nw2_take", nw2_p4b_poolhall: "nw2_p4b_swing", nw2_p6_booth: "nw2_p6_tell" },
    qte: true,
  },
  {
    label: "Silver — swung at Moe",
    picks: { nw2_diner: "nw2_take", nw2_p4b_poolhall: "nw2_p4b_swing" },
  },
  {
    label: "Game over — took the four hundred",
    picks: { nw2_diner: "nw2_take", nw2_p4b_poolhall: "nw2_p4b_take" },
  },
  {
    label: "Silver — refused the case",
    picks: { nw2_diner: "nw2_refuse" },
  },
];

function App() {
  const [i, setI] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const [screen, setScreen] = useState(false);
  const [mapAct, setMapAct] = useState<string | null>(null);
  const route = ROUTES[i];
  const { journey, ending } = buildJourney(route.picks, route.qte);

  return (
    <div className="min-h-screen bg-noir-900 p-6 text-paper">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-pulp text-lg uppercase tracking-[0.2em] text-gold">
          End-of-part flowchart — preview
        </h1>
        <p className="font-type mt-1 text-xs text-paper/50">
          Real story data through the real engine. Pick a route, watch it draw.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {ROUTES.map((r, n) => (
            <button
              key={r.label}
              onClick={() => {
                setI(n);
                setRunKey((k) => k + 1);
              }}
              className={`border px-3 py-1.5 font-pulp text-[10px] uppercase tracking-[0.18em] ${
                i === n
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-paper/25 text-paper/60 hover:border-paper/60 hover:text-paper"
              }`}
            >
              {r.label}
            </button>
          ))}
          <button
            onClick={() => setRunKey((k) => k + 1)}
            className="border border-neon/50 px-3 py-1.5 font-pulp text-[10px] uppercase tracking-[0.18em] text-neon hover:bg-neon/10"
          >
            ↻ Replay animation
          </button>
          <button
            onClick={() => {
              setScreen(true);
              setRunKey((k) => k + 1);
            }}
            className="border border-cyan-neon/50 px-3 py-1.5 font-pulp text-[10px] uppercase tracking-[0.18em] text-cyan-neon hover:bg-cyan-neon/10"
          >
            ▣ Part-break screen
          </button>
          {(S.acts ?? []).map((a) => (
            <button
              key={a.id}
              onClick={() => setMapAct(a.id)}
              className="border border-gold/50 px-3 py-1.5 font-pulp text-[10px] uppercase tracking-[0.18em] text-gold hover:bg-gold/10"
            >
              ▦ {a.label} map
            </button>
          ))}
        </div>

        <Flowchart
          key={`inline-${i}-${runKey}`}
          story={S}
          journey={journey}
          endingHeadline={ending?.endingData?.headline}
          endingTier={ending?.endingData?.tier}
        />

        {mapAct && (
          <RouteMap
            story={S}
            actId={mapAct}
            journey={journey}
            onDone={() => setMapAct(null)}
          />
        )}

        {screen && (
          <Flowchart
            key={`screen-${i}-${runKey}`}
            story={S}
            journey={journey}
            title={route.label}
            variant="screen"
            onDone={() => setScreen(false)}
          />
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
