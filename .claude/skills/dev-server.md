# Dev Server Skill

Start, stop, or check the Next.js development server.

## When to use this skill

Use this skill when you need to:
- Start the Next.js development server
- Check if the dev server is running
- Stop the dev server
- Restart the dev server

## How to use this skill

**Start the dev server:**
```bash
yarn dev
```

The server will be available at `http://localhost:3000`.

**Check if dev server is running:**
```bash
lsof -i :3000
```

**Stop the dev server:**
If running in the current terminal, press `Ctrl+C`.

If running in background:
```bash
lsof -ti :3000 | xargs kill -9
```

**Restart the dev server:**
Stop the existing server and start it again:
```bash
lsof -ti :3000 | xargs kill -9 && yarn dev
```

## Notes

- The dev server supports hot module replacement (HMR) - changes to files will automatically reload
- TypeScript errors will show in the terminal
- The server must be running to preview changes in the browser
- For production builds, use the `build` skill instead
