/** Activate a button with mouse/keyboard or an independent touch contact.
 * Browsers need not emit compatibility clicks for a second finger while the
 * captured movement contact is held. Do not require that click for phone play.
 */
export function bindButtonActivation(button, activate) {
  let pressed = null, ignoreTouchClickUntil = -1;
  button.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || button.disabled) return;
    pressed = event.pointerId;
    button.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  button.addEventListener('pointerup', event => {
    if (event.pointerType !== 'touch' || event.pointerId !== pressed) return;
    pressed = null;
    ignoreTouchClickUntil = performance.now() + 800;
    event.preventDefault();
    const b = button.getBoundingClientRect();
    if (!button.disabled && event.clientX >= b.left && event.clientX <= b.right && event.clientY >= b.top && event.clientY <= b.bottom) activate(event);
  });
  for (const name of ['pointercancel', 'lostpointercapture']) button.addEventListener(name, event => {
    if (event.pointerId === pressed) pressed = null;
  });
  button.addEventListener('click', event => {
    if (button.disabled) return;
    if (event.detail !== 0 && event.pointerType !== 'mouse' && performance.now() < ignoreTouchClickUntil) { event.preventDefault(); return; }
    activate(event);
  });
}
