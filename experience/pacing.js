/** Pause-aware story time and bounded simulation steps are deliberately separate. */
export function frameDelta(now, previous, active) {
  const wall = Math.max(0, (now - previous) / 1000);
  return {
    story: active ? wall : 0,
    animation: active ? Math.min(wall, 0.15) : 0,
    // Hidden tabs pause independently. Bound exceptional foreground stalls, but
    // ordinary low frame rates (including 1 fps) retain the intended walk speed.
    movement: active ? Math.min(wall, 2) : 0,
  };
}
export function briskTransition(seconds) {
  const t = Math.max(0, seconds);
  const fade = t < 0.9 ? 0 : t < 1.4 ? (t - 0.9) / 0.5 : t < 1.75 ? 1 : t < 2.35 ? 1 - (t - 1.75) / 0.6 : 0;
  return { fade: Math.max(0, Math.min(1, fade)), jump: t >= 1.4, complete: t >= 3.4 };
}
export function travelSpeed(chapter) {
  return chapter >= 8 ? 0.75 : chapter >= 5 ? 2.6 : 2.1;
}
