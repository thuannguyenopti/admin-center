# Lint Skill

Run ESLint to check code quality and style.

## When to use this skill

Use this skill when you need to:
- Check for code style issues
- Find potential bugs
- Ensure code follows Next.js best practices
- Verify code quality before committing

## How to use this skill

**Run linter:**
```bash
yarn lint
```

This will check all files for:
- ESLint rule violations
- Next.js specific issues
- React best practices
- Accessibility issues

## Common lint issues

**Unused variables:**
- Remove unused imports and variables
- Or prefix with underscore if intentionally unused: `_unusedVar`

**Missing dependencies in useEffect:**
- Add all dependencies to the dependency array
- Or use ESLint disable comment if intentionally excluded

**Accessibility issues:**
- Add proper ARIA labels
- Ensure interactive elements are keyboard accessible

## Notes

- ESLint is configured for Next.js via `eslint-config-next`
- Fix lint errors before committing code
- Some rules can be auto-fixed with `yarn lint --fix` (use with caution)
