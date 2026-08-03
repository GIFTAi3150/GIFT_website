import type { LpVariant } from '@/data/lp-variants';

// Step-by-step timeline, ported from the Osmo component the client supplied as
// a reference (osmo.supply/resource/step-by-step-timeline). Spec, including the
// three earlier designs this replaces and why each was rejected:
// docs/aiops-lp-timeline-spec.md.
//
// Four steps, not eight: two 「now」 then two 「with gift」, at the client's
// direction. That turns the side-by-side comparison into a narrative arc —
// problem, turn, resolution — which is the shape a timeline actually wants, and
// it lets the rail change colour at the midpoint so the turn is a visible event.
//
// ⚠️ Renders complete and static without JS. Every dimmed/animated rule is
// scoped under `.lp-tl-live`, which LpMotion adds on mount, after its
// reduced-motion bail. Do not move any of it into the base classes.
type Step = {
  text: string;
  phase: 'now' | 'gift';
  /** First step of its phase — the one that carries the phase header. */
  head?: { eyebrow: string; name: string };
};

export default function LpFlow({ flow }: { flow: LpVariant['flow'] }) {
  // Steps 3 and 4 of each lane: they carry the consequence, where 1 and 2 are
  // setup. NOT 1 and 4 — on variant B both lanes open on 「問い合わせ」, so that
  // selection would render one phrase as two different steps of a single
  // timeline and read as a bug.
  //
  // The other four strings stay in lp-variants.ts untouched; this is a display
  // choice, not a copy edit.
  const steps: Step[] = [
    ...flow.bad.nodes.slice(2).map((text, i) => ({
      text,
      phase: 'now' as const,
      ...(i === 0 ? { head: { eyebrow: flow.bad.eyebrow, name: flow.bad.label } } : {}),
    })),
    ...flow.good.nodes.slice(2).map((text, i) => ({
      text,
      phase: 'gift' as const,
      ...(i === 0 ? { head: { eyebrow: flow.good.eyebrow, name: flow.good.label } } : {}),
    })),
  ];

  return (
    <section className="lp-section lp-tl" aria-label="導入前後の比較">
      <div className="lp-inner">
        <p className="lp-eyebrow">before / after</p>
        <h2>
          {flow.heading.map((line, i) => (
            <span className="lp-line" key={i}>
              {line}
            </span>
          ))}
        </h2>

        {/* The rail is a sibling of the list, not a child of it: <ol> permits
            only <li>. .lp-tl-list is the positioning context both share, and it
            is also what LpMotion scrubs against — its height is the list's. */}
        <div className="lp-tl-list">
          <span className="lp-tl-rail" aria-hidden="true">
            {/* Faint track plus two fills — ink for the `now` half, green for
                the `with gift` half — each scaled from the top by the scrubbed
                timeline in LpMotion. Two bars rather than one gradient on
                purpose; see the spec. */}
            <i className="lp-tl-fill lp-tl-fill-now" />
            <i className="lp-tl-fill lp-tl-fill-gift" />
          </span>

          <ol className="lp-tl-steps">
            {steps.map((step, i) => (
              <li className={`lp-tl-step lp-tl-${step.phase}`} key={i}>
                <span className="lp-tl-node" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="lp-tl-body">
                  {step.head && (
                    <span className="lp-tl-phase">
                      <span className="lp-tl-phase-eyebrow">{step.head.eyebrow}</span>
                      <span className="lp-tl-phase-name">{step.head.name}</span>
                    </span>
                  )}
                  <p className="lp-tl-text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>{/* /.lp-inner */}

      {/* Weight-shift marquee (reference: madewithgsap effect079 — see
          docs/aiops-lp-punch-marquee-spec.md). The bold zone is anchored to the
          centre of the SCREEN and the sentence travels through it, which is why
          the line is split per character below.

          The track sits OUTSIDE .lp-inner so the line can travel the section's
          full width rather than the 1120px measure. It is inset only by
          .lp-section's own horizontal padding, which keeps the clipping edges
          aligned with the content above. */}
      <div className="lp-punch">
        <div className="lp-punch-pane">
          {/* Split per character because the weight wave is anchored to the
              SCREEN, not to the sentence: each character is heavy only while it
              is passing the centre of the viewport, so every character needs its
              own weight. See docs/aiops-lp-punch-marquee-spec.md.

              Plain inline spans — weight needs no transform, so no inline-block.
              That keeps the static fallback a normally-wrapping Japanese
              paragraph; per-character inline-BLOCK would break kinsoku and make
              it unwrappable. Safe to split here only because the live marquee is
              nowrap on one line. */}
          <p className="lp-flow-punch">
            {Array.from(flow.punch).map((ch, i) => (
              <span className="lp-punch-char" key={i}>
                {ch}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
