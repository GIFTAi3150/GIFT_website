// Left-aligned section heading used on the light body of /works (PickUp).
// Deliberately NOT imported from src/app/services/ai-training/_components/
// AtSectionHead.tsx (centered) or src/app/plans/_components/KhSectionHead.tsx
// — Plans.md forbids importing across page bundles, and the approved mock
// (scratchpad works-mock/BLight.dc.html) has this kicker+title pair
// left-aligned, not centered like the AI研修 page.

export default function WkSectionHead({ word, chip }: { word: string; chip: string }) {
  return (
    <header className="flex flex-col gap-2.5">
      <p className="font-display text-small font-bold uppercase tracking-widest text-[#2563EB]">
        {word}
      </p>
      <h2
        className="font-sans font-extrabold text-[#0C0E1A]"
        style={{ fontSize: 'clamp(26px, 3.4vw, 32px)', lineHeight: 1.35, textWrap: 'balance' }}
      >
        {chip}
      </h2>
    </header>
  );
}
