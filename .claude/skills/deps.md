# Dependencies Skill

Manage project dependencies with Yarn.

## When to use this skill

Use this skill when you need to:
- Install new packages
- Update existing packages
- Remove unused packages
- Install all dependencies (after cloning)
- Check for outdated packages

## How to use this skill

**Install all dependencies:**
```bash
yarn install
```

**Add a new dependency:**
```bash
yarn add <package-name>
```

**Add a dev dependency:**
```bash
yarn add -D <package-name>
```

**Remove a package:**
```bash
yarn remove <package-name>
```

**Check for outdated packages:**
```bash
yarn outdated
```

**Update a specific package:**
```bash
yarn up <package-name>
```

**Update all packages (use with caution):**
```bash
yarn up
```

## Project dependencies

**Main dependencies:**
- `next` - Next.js framework (v16+)
- `react` - React library (v19+)
- `@optiaxiom/react` - Axiom design system
- `@optimizely/axiom-icons` - Axiom icons
- `tailwindcss` - Utility-first CSS framework
- `openai` - OpenAI API client
- `@xyflow/react` - Flow diagram library
- `framer-motion` - Animation library

**Dev dependencies:**
- `typescript` - TypeScript compiler
- `eslint` - Code linter
- `@types/*` - TypeScript type definitions

## Best practices

- Always use Yarn (project uses Yarn 4 with Corepack)
- Don't use npm commands in this project
- Review package.json changes before committing
- Check if similar functionality exists in Axiom before adding new UI libraries
- Update dependencies regularly but test thoroughly after updates

## Notes

- The project uses Yarn 4 with Corepack enabled
- Package manager is specified in package.json: `"packageManager": "yarn@4.12.0"`
- If Yarn is not available, run: `corepack enable`
- Dependencies are installed to `node_modules/` (gitignored)
