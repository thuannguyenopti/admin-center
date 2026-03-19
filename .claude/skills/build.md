# Build Skill

Run a production build of the Next.js application and check for errors.

## When to use this skill

Use this skill when you need to:
- Create a production build
- Check for TypeScript errors across the entire codebase
- Verify that the application builds successfully
- Test optimizations and bundle size
- Prepare for deployment

## How to use this skill

**Run a production build:**
```bash
yarn build
```

This will:
- Compile TypeScript
- Check for type errors
- Build all pages and components
- Optimize bundles
- Generate static assets

**Start the production server (after building):**
```bash
yarn start
```

The production server will be available at `http://localhost:3000`.

## Common build issues

**TypeScript errors:**
- Fix type errors shown in the build output
- Check for missing imports or incorrect types

**Build failures:**
- Review the error messages carefully
- Check for syntax errors or missing dependencies
- Ensure all required environment variables are set

**Performance warnings:**
- Review bundle size warnings
- Consider code splitting or lazy loading for large bundles

## Notes

- Always run a build before creating a pull request
- The build process is stricter than the dev server
- Build errors must be fixed before deployment
- Contact the team before deploying to Vercel (see README Advanced section)
