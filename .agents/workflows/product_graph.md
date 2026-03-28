---
description: "Product & Management Pipeline Graph"
---

# VCT Product Graph (O(1) Workflow)

> **Trigger:** Tasks related to PM, BA, documentation, translations (i18n), team synchronization, and Javis behavior.
> **Associated Skills:** `vct-product`, `vct-leadership`, `vct-javis`

## 1. Documentation & Story Node (Dịch thuật, Tài liệu)
- Update `<module>/README.md`.
- Keep documentation up-to-date with code.
- MFE Domain mapping: Tournament (D1), Athlete (D2), Org (D3), Admin (D4), Finance (D5), Heritage (D6), Platform (D7).

## 2. i18n Translation Node
- Ensure React `useI18n()` is used.
- Keys must be semantic: `domain.feature.key`. 
- Translate to Vietnamese (default) & English.

## 3. Team & Skill Iteration Node
- Whenever Javis is asked to update how agents work, update the underlying `vct-[skill]/SKILL.md` using JSON/YAML formatting to save LLM tokens.
- Review Javis rulebook and delegation logic.
