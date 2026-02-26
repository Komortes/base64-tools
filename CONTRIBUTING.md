# Contributing

Thanks for contributing to Base64 Tools.

## Prerequisites

- Node `20.x` or `22.x` (use `.nvmrc`)
- npm

## Local Setup

```bash
nvm use
npm install
npm run dev
```

## Quality Gates

Before opening a pull request, run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Branch Naming

- Use short, descriptive branch names.
- Recommended format: `feat/<topic>`, `fix/<topic>`, `chore/<topic>`.

## Pull Requests

- Keep PRs focused (one change-set per PR).
- Include a short problem statement and solution summary.
- Link related issues (`Closes #123`) when applicable.
- Add screenshots/GIFs for UI changes.

## Scope

- Keep processing local-first and browser-first.
- Do not add server-side payload processing.
- Avoid introducing external network dependencies without clear justification.
