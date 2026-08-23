'use client'

import { MotionConfig } from 'motion/react'

/* ============================================================
   GLOBAL MOTION CONFIGURATION

   `reducedMotion="user"` makes Motion honour the system
   preference on its own: when it is enabled, transform and
   layout animations (translations, scales, rotations) are
   disabled and only opacity and colour get through.

   This replaces the `variants={reduce ? still : fadeUp}`
   pattern, which looked equivalent but had a real bug: the
   preference hook can only give the correct value AFTER mounting
   —if it gives it earlier, server and client markup disagree and
   React re-renders the page— and that mid-flight change swapped
   one variants object for another, which left orchestrated
   children frozen in their "hidden" state: whole sections
   invisible to anyone with the preference turned on.

   With MotionConfig the decision is taken at animation time, not
   at render time. The markup is always identical.
   ============================================================ */

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
