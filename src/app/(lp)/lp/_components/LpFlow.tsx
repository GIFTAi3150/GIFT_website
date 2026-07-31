import type { LpVariant } from '@/data/lp-variants';

type LpFlowProps = {
  flow: LpVariant['flow'];
};

// The last node in `lane.nodes` is always the terminal state — coloured red
// on the bad lane, LINE green on the good lane (every dot on the good lane
// is green regardless; that part is handled entirely by lp.css). See the
// LpLane doc comment in src/data/lp-variants.ts.
function FlowLane({ lane, variant }: { lane: LpVariant['flow']['bad']; variant: 'bad' | 'good' }) {
  const terminalIndex = lane.nodes.length - 1;
  const terminalClass = variant === 'bad' ? 'lp-stop' : 'lp-go';

  return (
    <div className={`lp-flow-lane lp-${variant}`}>
      <div className="lp-flow-label">
        <span>{lane.eyebrow}</span>
        <strong>{lane.label}</strong>
      </div>
      <div className="lp-flow-track">
        {lane.nodes.map((node, i) => (
          <div key={i} className={i === terminalIndex ? `lp-flow-node ${terminalClass}` : 'lp-flow-node'}>
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LpFlow({ flow }: LpFlowProps) {
  return (
    <section className="lp-section" aria-label="導入前後の比較">
      <div className="lp-inner">
        <p className="lp-eyebrow">after the video</p>
        <h2>
          {flow.heading.map((line, i) => (
            <span className="lp-line" key={i}>
              {line}
            </span>
          ))}
        </h2>
        <div className="lp-motion-story">
          <FlowLane lane={flow.bad} variant="bad" />
          <FlowLane lane={flow.good} variant="good" />
        </div>
        <p className="lp-flow-punch">{flow.punch}</p>
      </div>
    </section>
  );
}
