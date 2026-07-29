# Commit Skill

Create well-formatted git commits following project conventions.

## When to use this skill

Use this skill when you need to:
- Commit changes to git
- Create a clear commit message
- Prepare changes for a pull request

## How to use this skill

**Check status:**
```bash
git status
```

**Stage specific files:**
```bash
git add <file-path>
```

**Stage all changes:**
```bash
git add .
```

**Create a commit:**
```bash
git commit -m "Your descriptive commit message"
```

**View recent commits:**
```bash
git log --oneline -10
```

## Commit message guidelines

Follow these conventions for commit messages:

**Format:**
```
<type>: <description>

[optional body]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring (no functional changes)
- `style:` - UI/styling changes
- `docs:` - Documentation updates
- `chore:` - Maintenance tasks (dependencies, config)
- `perf:` - Performance improvements

**Examples:**
```
feat: add version history sidebar with filtering

fix: correct badge text color in dark mode

refactor: extract VersionCard into separate component

style: update CardHeader to use Axiom Text components
```

## Best practices

- Write clear, concise commit messages
- Focus on the "what" and "why", not the "how"
- Keep commits atomic (one logical change per commit)
- Reference issue numbers if applicable
- Review changes with `git diff` before committing

## Notes

- Don't commit sensitive files (.env, credentials)
- Run `yarn build` and `yarn lint` before committing when possible
- For deployment, contact the team first (see README Advanced section)
