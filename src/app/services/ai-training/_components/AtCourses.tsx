import { COURSES } from './aiTrainingContent';
import AtHead from './AtHead';

// The three course names share one sentence and differ in one word:
// 「AIを、自分専属の」+「営業 / 記録 / 数字」+「コーチにする」. Derive the slot
// from the confirmed copy; if the copy ever stops fitting the pattern, fall
// back to typesetting each full name inside its panel.
function deriveSlot() {
  const heads = new Set<string>();
  const tails = new Set<string>();
  const slots: string[] = [];
  for (const item of COURSES.items) {
    const [head, rest] = item.nameParts;
    const m = /^(.+?)(コーチにする)$/.exec(rest);
    if (!m) return null;
    heads.add(head);
    tails.add(m[2]);
    slots.push(m[1]);
  }
  if (heads.size !== 1 || tails.size !== 1) return null;
  return { head: [...heads][0], tail: [...tails][0], slots };
}

/**
 * Courses — the slot sentence. A pinned stage holds one sentence; scrolling
 * rolls the one word that changes (営業 → 記録 → 数字) while the matching
 * course panel slides in beneath (AtScroll).
 */
export default function AtCourses() {
  const slot = deriveSlot();

  return (
    <section id="courses" className="at-courses at-section--navy">
      <div className="at-courses__stick">
        <div className="at-container at-courses__inner">
          <AtHead label={COURSES.eyebrow} title={COURSES.title} lead={COURSES.note} />

          {slot ? (
            <p className="at-courses__sentence" aria-hidden>
              <span className="at-courses__line">{slot.head}</span>
              <span className="at-courses__line">
                <span className="at-courses__br">「</span>
                <span className="at-slot" data-slot>
                  <span className="at-slot__roll" data-slot-roll>
                    {slot.slots.map((w) => (
                      <span key={w} className="at-slot__w">
                        {w}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="at-courses__br">」</span>
                {slot.tail}
              </span>
            </p>
          ) : null}

          <div className="at-courses__panels" data-panels>
            {COURSES.items.map((course, i) => (
              <article key={course.nameParts.join('')} className="at-course" data-course={i}>
                <h3 className={slot ? 'sr-only' : 'at-course__name'}>
                  {course.nameParts.map((part) => (
                    <span key={part} className="at-course__name-part">
                      {part}
                    </span>
                  ))}
                </h3>
                <p className="at-course__desc">{course.description}</p>
                <ul className="at-course__modules">
                  {course.modules.map((mod) => (
                    <li key={mod.title} className="at-course__module">
                      <span className="at-course__mt">{mod.title}</span>
                      <span className="at-course__mh at-mono">{mod.hours}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
      <div className="at-courses__spacer" aria-hidden />
    </section>
  );
}
