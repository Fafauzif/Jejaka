> Continuation authority: `handoff/01_LOCKED_USER_DIRECTION.md` and `handoff/03_REFERENCE_GUIDE.md` record the latest user decisions. Preserve useful tokens below, but revise the experience around approximately three minutes, Indonesian-first presentation, essential phone support, dense civilians, original lower-poly cinematic art, Cloverfield atmosphere and Expedition33-inspired palette/composition. These are requirements for the next run, not proof of current completion.

# Jejaka: interface direction

The active experience is a desktop-first, first-person historical-fiction game. Its interface should feel like a journalist's printed field account set against a living street. The contemporary interface supports movement and observation without resembling a military dashboard. All rendered damage, characters and conversations remain fiction; the historical record lives in the separate context panel.

## Visual system

- Background ink: `#171c19`; deep ink: `#101512`.
- Main type and rule color: warm paper `#ede5d2`.
- Secondary text: `#b8b8a7`.
- Accent: vermilion `#c35a43`; hover `#e97558`.
- Keyboard focus: warm gold `#f3c486` with a two-pixel outline and five-pixel offset.
- Typography: locally packaged JejakaSerif for titles and notebook prose; locally packaged JejakaSans for interface labels. No network font dependency.
- Geometry: square corners, hairline rules, restrained optical marks; rounded geometry only where function explains it, such as the camera shutter.
- Density: generous title and context reading space; compact, peripheral game controls.
- Motion: a live 3D street, short transitions, no animated title text. System reduced-motion preference disables interface transitions and grain.

Runtime tokens live in `experience/game.css` under `:root`. Components consume these variables rather than defining separate visual systems. The active HTML is `experience/index.html`; the active app module is `experience/game/app.js`.

## Screen contracts

The title is left-weighted editorial typography. The right side belongs to the live world. Its primary action enters the city, its secondary action continues an existing account. The title supplies content expectations and an unobtrusive history/fiction entry before play.

The HUD keeps objectives in the upper left, tools in the upper right, heading at the top center, a small reticle at eye level, and player state at the lower left. Captions sit above the controls with a dark reading surface. Interaction prompts appear only for available actions. A toast acknowledges a result; the notebook or objective retains durable information.

All notebook, settings, history, interaction-choice and ending content uses the same native `dialog#panel`, header, close button, typography and footer. The app must use `showModal()` and `close()` to preserve browser focus trapping and Escape behavior. The close button is always keyboard accessible. Use `.panel-actions`, `.primary-button`, `.quiet-button`, `.choice-button`, `.settings-row`, `.notebook-entry` and `.evidence-tag` for generated content.

The pause screen freezes gameplay and offers resume, settings, history, title, and restart. The camera uses an optical frame without altering scene layout. Its shutter and lower-camera controls have direct pointer and keyboard equivalents.

## Behavior and resilience

- Buttons are real buttons with hover, focus, pressed and disabled states. Navigation is an anchor.
- Game canvases and their overlays never reflow during feedback.
- `[hidden]` always overrides component display declarations.
- All content-owning scroll surfaces inherit a visible scrollbar baseline.
- Names, speech, objectives and evidence may be English or Indonesian. Avoid concatenating localized fragments. Language should update accessible names together with visible text.
- A failed WebGL launch gets a readable error and retry action rather than an empty canvas.
- Settings and histories use natural document reading order inside the dialog.
- Runtime settings should honor reduced motion, audio level, camera sensitivity and display quality, and explain any saved-data limitation.
- A destructive restart should use the shared dialog with a clear consequence and a safe cancel action.
- Small screens simplify the HUD and add explicit touch movement/interact controls. Desktop remains the intended presentation format.

## Verification boundaries

The authoring pass has checked HTML IDs, semantic controls, local paths, CSS responsive rules, hidden-state precedence, reduced-motion rules and focus styling. Actual runtime camera composition, control lifecycle, caption timing, dialog wiring and viewport captures require the integrated browser checks. No performance or full accessibility certification is implied by these design notes.
