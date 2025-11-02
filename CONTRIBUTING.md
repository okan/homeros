# Contributing to Homeros

Thanks for your interest in contributing! This guide explains how to propose changes and get them merged smoothly.

## Ground Rules

- Be respectful and constructive.
- By contributing, you agree your contributions are licensed under the project license (MIT).

## Getting Started

1. Fork the repo and create a branch:
   - Branch name format: `feature/short-title`, `fix/short-title`, or `chore/short-title`
2. Setup:
   ```bash
   npm install
   npm run dev
   ```
3. Useful scripts:
   - Type check: `npm run type-check`
   - Lint: `npm run lint`
   - Format: `npm run format`
   - Build: `npm run build`

## Code Style

- TypeScript, React 18, Vite 5
- ESLint + Prettier are enforced
- Pre-commit runs `lint-staged` (ESLint/Prettier). Please keep the repo formatted.

## Making Changes

- Keep PRs focused and small when possible.
- Add or update tests if/when a test setup is added in the future.
- Chrome Extension specifics:
  - Manifest is generated from `manifest.ts` (version comes from `package.json`).
  - Use the `storage` API responsibly; no external analytics or tracking.

## Commit Messages

- Prefer Conventional Commits style:
  - `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`, `refactor: ...`, `build: ...`, `ci: ...`

## Pull Requests

- Target branch: `main`
- Ensure CI passes (type-check, lint, build)
- Include a clear description of the change and rationale
- If visual changes, include screenshots or a short clip when possible

## Reporting Issues

- Use GitHub Issues
- Include steps to reproduce, expected vs actual behavior, and environment details

## Release Process (Maintainers)

- Tag a new version: `git tag vX.Y.Z && git push origin vX.Y.Z`
- GitHub Actions will build and attach `homeros.zip` to the Release

## Questions

Open an issue or start a discussion on the repository.
