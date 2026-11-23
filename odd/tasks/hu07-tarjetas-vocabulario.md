# HU07 — Tarjetas de vocabulario con audio y retroalimentación inmediata

## Objective

Turn the static Etapa 1 vocabulary grid into interactive cards: tapping a card plays
English audio (server TTS when available, browser SpeechSynthesis fallback) and the card
immediately reports its state (pending → listened), without leaving the stage.

## Problem

Stage 1 currently renders read-only rows. There is no audio and no feedback, so the
student cannot practice pronunciation during the guided tour.

## Scope

- In scope: TTS client helper with fallback, `VocabularioStep` component, wiring into
  `EstudianteLeccionView` stage 1, barrel export.
- Out of scope: the Express TTS endpoint (owned by Yunior, HU07), voice recognition
  (HU08), block-completion notice and next-stage gating (separate HU07 casilla),
  grading (Sprint 4).

## Constraints

- No new dependencies. lucide-react already installed.
- Copy must stay Spanish; identifiers/comments in English.
- Must not break the existing tour, progress bar, or exit confirmation.
- Audio must be triggered by a user gesture (click) so browsers allow playback.

## Tasks

- [ ] T1 — Create `src/lib/tts.ts` with `speakWord(text)`: try `/api/tts`, fall back to
      `speechSynthesis` (en-US, rate 0.85, wait for `voiceschanged` when voices are empty).
- [ ] T2 — Create `src/components/estudiante/VocabularioStep.tsx`: card grid with
      category pill, audio icon, English word, Spanish translation, pending/listened
      state and per-card label.
- [ ] T3 — Wire `VocabularioStep` into stage 1 of `EstudianteLeccionView`, replacing the
      static grid and removing now-unused imports.
- [ ] T4 — Export the new component from `src/components/estudiante/index.ts` and verify
      `pnpm lint` + `pnpm build`.

## Acceptance criteria

- Tapping a card plays English audio and marks that card as listened immediately.
- Cards that were already listened show the completed state and keep their styling.
- Spanish translation and category are visible on every card.
- Lint and build are green; no console.log in components.

## Verification

- `pnpm lint`
- `pnpm build`
- Manual: student login → active lesson → stage 1 → tap each card and confirm audio +
  state change.

## Progress

- Created during Sprint 3 implementation of HU07 (Dayvis).
- Engram mirror pending: Engram tools are not available in this runtime.
