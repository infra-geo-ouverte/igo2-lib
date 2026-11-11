---
name: modular-architecture
description: Enforces modular domain architecture and clean code standards. Use when creating or refactoring packages, domains, components, services, models, and tests in packages/*.
---

# Modular Domain Architecture Standards

This skill defines enforceable architecture and coding rules for Angular libraries to keep the codebase maintainable, scalable, and predictable.

## 1. Scope

Apply this skill to changes in:

- `packages/*/src/lib/**`
- Domain-level TypeScript implementation and tests (`*.ts`)
- Architecture decisions about component/service/model boundaries

Do not apply this skill to generated artifacts, coverage output, or unrelated tooling files.

## 2. Rule Priority and Conflict Resolution

When rules conflict, apply this order:

1. Correctness and build/test stability
2. Public API compatibility (unless migration is explicitly requested)
3. Architecture boundaries (layer responsibilities and dependency direction)
4. Naming and folder conventions
5. Style preferences

If a lower-priority rule conflicts with a higher-priority rule, follow the higher-priority rule and note the exception in your response.

## 3. Mandatory Rules

### 3.1 Layer Responsibilities

- Components: UI rendering and interaction orchestration only.
- Services: business logic, data access orchestration, domain operations.
- Models/Interfaces: domain contracts and typed data shapes.
- Utilities: pure reusable helpers with no UI coupling.

Components must not contain complex business logic if that logic can live in a service.

### 3.2 Dependency Direction

- UI layer can depend on services and models.
- Services can depend on models and utilities.
- Services must not depend on component classes.
- Avoid circular dependencies across domains.

### 3.3 Type Safety

- Explicitly type function inputs and outputs for exported APIs.
- Do not introduce `any` in new code. If unavoidable for external APIs, use `unknown` and narrow.
- Use `readonly` for immutable class members and object properties when mutation is not needed.

### 3.4 Naming and Searchability

Use singular domain-prefixed filenames:

- `[domain].service.ts`
- `[domain].component.ts`
- `[domain].model.ts` or `[domain].interface.ts`
- `[domain].spec.ts` or `[domain].service.spec.ts`

Keep names intent-revealing and consistent with existing package terminology.

## 4. Preferred Patterns

- Prefer standalone components/directives/pipes for new UI features.
- Use `NgModule` only for legacy integration points or third-party requirements.
- Keep components thin by delegating non-UI logic to services.
- Prefer composition and dependency injection over inheritance-heavy designs.

## 5. Decision Rules (If-Then)

1. If creating a new UI feature in a domain, use a standalone component by default.
2. If feature logic spans multiple components, create or extend a domain service.
3. If shared logic is domain-agnostic and pure, move it to a utility in a shared package.
4. If an interface exceeds one responsibility, split it into smaller focused interfaces.
5. If a change risks breaking public exports, preserve the existing API or provide a migration path.

## 6. Exceptions Policy

Allowed exceptions:

- Legacy module-based areas that are already module-centric.
- Third-party integration constraints requiring module registration.
- Transitional refactors where a follow-up task is required.

For every exception, document briefly:

1. Which rule was bypassed
2. Why it was necessary
3. Recommended follow-up action

## 7. Anti-Patterns to Avoid

- Fat components containing domain/business logic.
- Services returning untyped `any` payloads without narrowing.
- Domain code coupled to UI framework details when a service abstraction is possible.
- New files that ignore the domain-prefix naming convention.
- Copy-paste logic that should be extracted to `common` or `utils` packages.

## 8. Minimal Domain Layout

```text
packages/[package]/
  src/
    lib/
      [domain]/
        [domain].component.ts
        [domain].service.ts
        [domain].model.ts
        [domain].interface.ts
        [domain].spec.ts
```

Adjust file set per feature needs, but preserve domain-prefix naming and layer boundaries.

## 9. Pre-Response Self-Checklist

Before finalizing a change, verify:

1. Are responsibilities split correctly between component/service/model?
2. Are dependency directions valid and non-circular?
3. Was `any` avoided in new code?
4. Do new files follow domain-prefix naming?
5. Is duplicated logic extracted where practical?
6. Are tests added or updated for behavior changes?
7. Were exceptions documented when standards could not be followed?
