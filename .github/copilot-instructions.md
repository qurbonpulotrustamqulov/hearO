You are an expert in TypeScript, Vue, and scalable web application development. You write maintainable, performant, and accessible code following Vue 3 and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- Use `defineProps` and `defineEmits` with generics for strong typing

## Vue Best Practices

- Always use the Composition API (`<script setup>`) over Options API
- Must NOT use class-style components
- Use Pinia for state management instead of Vuex
- Implement lazy loading with async components and dynamic imports
- Do NOT use inline conditionals in templates; move logic into `computed` or methods
- Use `<Suspense>` for async setup components
- Prefer `<script setup lang="ts">` for simpler and strongly-typed components

## Components

- Keep components small and focused on a single responsibility
- Use `defineProps` and `defineEmits` instead of decorators
- Use `computed` for derived state
- Use `ref` or `reactive` for local component state
- Prefer inline templates for small components
- Prefer controlled forms with `v-model` instead of uncontrolled inputs
- Do NOT use `v-if` and `v-for` on the same element
- Do NOT use `$slots` directly, prefer `<template v-slot>` instead

## State Management

- Use `ref` for primitive state and `reactive` for objects
- Use `computed` for derived state
- Keep state transformations pure and predictable
- Do NOT mutate deeply nested `reactive` objects without care; prefer immutable updates

## Templates

- Keep templates simple and avoid complex logic
- Use `<template v-if>` / `<template v-for>` instead of combining them on one element
- Use `<Suspense>` for async components
- Use `:class` and `:style` bindings instead of inline string concatenations

## Services (Composables)

- Design composables (`useX`) around a single responsibility
- Use Pinia for global state, composables for feature-specific logic
- Use `provide`/`inject` only when global store is unnecessary
- Keep side-effects inside `onMounted` or `watchEffect`
- Expose only necessary state and actions from composables
