# Angular Modular Domain Architecture & Clean Code Standards

This document defines the project's directory structure, naming conventions, and core engineering principles for the `igo2-lib` Angular library to ensure a maintainable and scalable codebase.

## 1. Clean Code & TypeScript Principles

### SOLID Principles

- **Single Responsibility (SRP)**: Each class (Component, Service, Module) should have one reason to change.
- **Open-Closed (OCP)**: Design components and services to be extensible without modifying their source code (e.g., using dependency injection or configuration objects).
- **Liskov Substitution (LSP)**: Ensure subclasses or implementations of interfaces are interchangeable.
- **Interface Segregation (ISP)**: Create small, specific TypeScript interfaces rather than large, general-purpose ones.
- **Dependency Inversion (DIP)**: Depend on abstractions (Interfaces/Tokens) rather than concrete implementations. Use Angular's Dependency Injection system effectively.

### TypeScript Best Practices

- **Strict Typing**: Always define types for function parameters, return values, and variables. Avoid `any` at all costs.
- **Meaningful Naming**: Use descriptive, intent-revealing names. Use `PascalCase` for classes and `camelCase` for variables and functions.
- **Immutability**: Prefer `readonly` for properties that shouldn't change and use immutable data patterns when possible.

## 2. Angular Directory Structure & Naming

Each package or domain in `packages/` should follow a consistent structure.

### Search-First Naming (Singular Prefix)

Always prefix files with their **domain name (singular)** for better IDE searchability:

- **Modules**: `[domain].module.ts` (e.g., `config.module.ts`)
- **Services**: `[domain].service.ts` (e.g., `config.service.ts`)
- **Components**: `[domain].component.ts` (e.g., `map.component.ts`)
- **Interfaces**: `[domain].interface.ts` (e.g., `config.interface.ts`)
- **Testing**: `[domain].spec.ts` or `[domain].service.spec.ts`

### Recommended Folder Layout

```text
packages/[package]/
  src/
    lib/
      [domain]/
        [domain].module.ts
        [domain].service.ts
        [domain].component.ts
        [domain].interface.ts
        [domain].service.spec.ts
```

## 3. Layer Responsibilities

- **Standalone Components (Recommended)**: Prefer Standalone Components, Directives, and Pipes to reduce boilerplate and improve tree-shaking.
- **Modules (Legacy)**: While not deprecated, the use of `NgModule` is discouraged for new features. Use them primarily for grouping legacy components or third-party integrations that require them.
- **Services**: Contain business logic, data fetching, and state management. Agnostic of the UI.
- **Components**: Handle UI logic, template rendering, and user interaction. Keep them thin by delegating complex logic to Services.
- **Interfaces/Models**: Define clear contracts and data structures.

## 4. Documentation & Standards

- **DRY (Don't Repeat Yourself)**: Extract common utility functions or shared components into `common` or `utils` packages.
- **Readable Over Clever**: Prioritize code clarity and maintainability over complex TypeScript "tricks".
