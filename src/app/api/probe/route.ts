import { NextResponse } from 'next/server';

/**
 * TEMPORARY DIAGNOSTIC endpoint for the iOS React #418/#422 hydration mismatch.
 * Receives the payload from HYDRATION_PROBE_JS (see hydrationProbeScript.ts) and
 * prints it to the server log — the `next dev` terminal locally, Vercel runtime
 * logs in production (Logs → search `[probe]`).
 *
 * Printed one line per finding: Vercel truncates long log lines, and an 80-item
 * mutation list serialized as a single JSON blob would be cut off exactly where
 * the interesting part is.
 *
 * Remove together with the probe script once the bug is root-caused.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ProbePayload {
  url?: string;
  ua?: string;
  lang?: string;
  langs?: string;
  viewport?: string;
  dpr?: number;
  reactMountedAt?: number | null;
  counts?: { parserAppends?: number; dropped?: number };
  fingerprints?: Record<string, Record<string, { count: number; samples: string[] }>>;
  mutations?: Array<Record<string, unknown>>;
  logs?: Array<{ t: number; level: string; text: string }>;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: ProbePayload;
  try {
    body = (await request.json()) as ProbePayload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const line = (s: string): void => console.error(`[probe] ${s}`);

  line('═══════════════════════════════════════════════════════════════');
  line(`url        ${body.url ?? '?'}`);
  line(`ua         ${body.ua ?? '?'}`);
  line(`lang       ${body.lang ?? '?'} (${body.langs ?? ''})   viewport ${body.viewport ?? '?'} @${body.dpr ?? '?'}x`);
  line(
    `react mounted at +${body.reactMountedAt ?? 'never'}ms   parser appends ignored: ${body.counts?.parserAppends ?? 0}${
      body.counts?.dropped ? `   (dropped ${body.counts.dropped} over cap)` : ''
    }`,
  );

  // The money question: who touched the DOM that wasn't the parser and wasn't us?
  const muts = body.mutations ?? [];
  const preHydration = muts.filter((m) => m.phase === 'parsing' || m.phase === 'post-dcl');
  line(
    `NON-PARSER DOM MUTATIONS: ${muts.length} total, ${preHydration.length} BEFORE React hydrated  ${
      preHydration.length ? '  ← suspect' : '  ← clean'
    }`,
  );
  for (const m of muts) {
    line(`   · [${m.phase}+${m.t}ms] ${JSON.stringify(m)}`);
  }

  const fp = body.fingerprints ?? {};
  for (const stage of Object.keys(fp)) {
    const hits = fp[stage] ?? {};
    const names = Object.keys(hits);
    if (names.length === 0) {
      line(`FINGERPRINTS @${stage}: none`);
      continue;
    }
    for (const name of names) {
      line(`FINGERPRINT @${stage}: ${name} ×${hits[name].count}`);
      for (const s of hits[name].samples ?? []) line(`      ${s}`);
    }
  }

  for (const l of body.logs ?? []) {
    line(`LOG  +${l.t}ms [${l.level}] ${l.text}`);
  }
  line('═══════════════════════════════════════════════════════════════');

  return NextResponse.json({ ok: true });
}
