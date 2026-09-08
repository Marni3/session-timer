---
name: minimalist-software-standards
description: Mandatory development baseline for Sessio. Enforces extreme minimalism, anti-scope-creep, client-side local-first storage, TypeScript strictness, and zero-cloud architecture.
---

# Minimalist Software Standards

## 1. The Anti-Scope-Creep Law
Before adding any new feature, field, setting, or dependency, ask:
*Does this directly help the user focus on and finish their current work session right now?*

- If the answer is "this would be nice for project organization", **REJECT IT**.
- If the answer is "users might want cloud sync or accounts", **REJECT IT**.
- If the answer is "we could add AI estimation or subtasks", **REJECT IT**.

Sessio's value comes entirely from what it refuses to include.

## 2. Typing & Data Boundaries
- Strict TypeScript: No `any` under any circumstances.
- All domain interfaces (`Task`, `SessionState`, `TimerState`) live in `src/types.ts`.
- Prefer explicit Discriminated Unions for timer states (`'idle' | 'running' | 'paused'`).

## 3. Storage Hygiene (Local-First)
- All user state is stored in `localStorage` under `sessio_v1_state`.
- Always wrap `localStorage.getItem` and `localStorage.setItem` in defensive `try/catch` to gracefully handle private browsing quota limitations or corrupt JSON.
- Provide sensible, welcoming default tasks if the storage is empty so a first-time user can immediately press play.

## 4. Error Handling & User Respect
- Never fail silently with an empty `catch` block.
- Destructive actions (like clearing all tasks) MUST require an explicit confirmation modal.
- Input validation: task duration must be a positive number ($1\le \text{minutes} \le 720$). Titles must be trimmed and non-empty.

## 5. Review Checklist for Every Change
- [ ] No external backend or auth calls added.
- [ ] No new third-party npm package added unless strictly unavoidable.
- [ ] Types are strict and exported from `src/types.ts`.
- [ ] State changes persist to `localStorage` cleanly.
- [ ] Unit tests updated for any new utility or state logic.
