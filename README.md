# Installation Guide for Axiom Play (VS Code/Cursor)

This guide provides step-by-step instructions for installing the axiom-play project on a new machine using VS Code or Cursor IDE.

## Design System References

- Shared data-viz palette guidance: [app/DATA_VISUALIZATION_COLORS.md](./app/DATA_VISUALIZATION_COLORS.md)
- Live data-viz reference page: `/data-viz-colors`

## Account Requirements

Before starting the installation, ensure you have the following accounts set up when needed:

---

**GitHub Account**

- Required to clone the repository from GitHub
- Sign up at [github.com](https://github.com) if you don't have an account
- **Important**: You must be invited to the GitHub repository before you can clone it
- Contact the team to request access to `https://github.com/episerver/axiom-play.git`
- Once invited, accept the invitation through your GitHub account

---

## Quick Install (Recommended)

### macOS / Linux / Windows

1. Run the installer from the project folder:

    ```bash
    ./axiomplay install
    ```

    (Windows PowerShell/CMD: `axiomplay install` or `./axiomplay install`)

2. Download and open [VS Code](https://code.visualstudio.com/download) or [Cursor](https://cursor.sh) (or see [VS Code/Cursor setup](#vs-code-or-cursor-ide) below), then open this folder to develop. The installer has already set up Node/Yarn/deps.

#### What this does

- Auto-detects your OS and forwards to `install.sh` or `install.bat`.
- Handles Node: installs LTS via nvm on macOS/Linux if missing; on Windows, prompts you to install Node LTS (e.g., `winget install OpenJS.NodeJS.LTS`) if it isn't present.
- Enables Corepack (Yarn 4) and installs dependencies.
- Prompts for `.env` secrets if missing, exports them for install, and can start the dev server.

### Requirements

- A GitHub account with access to the repo (if you haven't cloned yet).
- Your secrets for `.env`: `OPENAI_API_KEY`, `OPTIMIZELY_AUTH_IDENT`, `OPTIMIZELY_USERNAME`, `OPTIMIZELY_PASSWORD`.

---

## Manual Installation Steps

### 1. Prerequisites (All Required)

---

**Manual Installation Required** (cannot be installed via IDE agent):

**Node.js** (version 18 or higher recommended for Next.js 16)

- Install from [nodejs.org](https://nodejs.org/) or via package manager (Homebrew, Chocolatey, etc.)
- Verify installation: `node --version` in terminal

**Git**

- Usually pre-installed on macOS/Linux, or install from [git-scm.com](https://git-scm.com/)
- Verify installation: `git --version` in terminal

**VS Code or Cursor IDE**

- Required (if you're reading this, you likely already have it installed)

---

**Can Be Installed via IDE Agent/Terminal** (if Node.js is already installed):

**Yarn package manager**

- Required (project uses Yarn; `.yarnrc.yml` and `.gitignore` indicate Yarn usage)
- Install via IDE terminal: `npm install -g yarn` (npm comes with Node.js)
- Or enable via: `corepack enable` (if using Node.js 16.10+)
- Verify installation: `yarn --version` in terminal

---

### 2. Clone the Repository (Can Be Done via IDE Agent)

**Note**: Ensure you have been invited to and have accepted access to the GitHub repository before attempting to clone.

---

**Option A: Using VS Code/Cursor Command Palette**

1. Open VS Code/Cursor
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Git: Clone" and select it
4. Enter repository URL: `https://github.com/episerver/axiom-play.git`
5. Choose a location to clone the repository
6. When prompted, click "Open" to open the cloned repository

---

**Option B: Using Terminal** (Can Be Executed via IDE Agent)

1. Open integrated terminal in VS Code/Cursor (`Ctrl+`` or `View > Terminal`)
2. Run: `git clone https://github.com/episerver/axiom-play.git`
3. **Can be executed via IDE agent**: Ask the AI assistant to clone the repository
4. Open the folder: `File > Open Folder...` and select the `axiom-play` directory

---

**Option C: Via IDE Agent**

1. Ask the AI assistant: "Clone the repository https://github.com/episerver/axiom-play.git"
2. The agent can execute the git clone command for you

---

### 3. Install VS Code/Cursor Extensions (Can Be Installed via IDE Agent)

**Installation Methods**:

---

**Method 1: Via Command Palette**

- Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
- Type "Extensions: Install Extensions"
- Search for extension name and install

---

**Method 2: Via IDE Agent**

- Ask the AI assistant to install extensions by name
- Example: "Install the Claude Code extension"

---

**Method 3: Via Extensions Panel**

- Click Extensions icon in sidebar (`Cmd+Shift+X` / `Ctrl+Shift+X`)
- Search for extension name and install

---

**Required Extensions**:

---

**Claude Code** (VS Code / Cursor)

- Search for: "Claude Code" in the Extensions marketplace, or use the [Claude Code](https://claude.ai/code) CLI
- AI coding assistant used for all development work on this project
- Includes MCP server auto-configuration — see the [Claude Code & MCP Servers](#claude-code--mcp-servers) section below
- After installation, sign in with your Anthropic account

---

**Live Preview by Microsoft** (VS Code Only)

- Extension ID: `ms-vscode.live-server`
- **Note**: You do not need to install this extension if using Cursor, as it has a built-in preview feature
- Provides a local server to preview webpages directly within VS Code
- Allows you to see live updates as you edit your code
- Can be installed via IDE agent/Command Palette

---

### 4. Install Dependencies (Required - Can Be Done via IDE Agent)

- Open the integrated terminal in VS Code/Cursor (`Ctrl+`` or `View > Terminal`)
- Run: `yarn install` (project uses Yarn; `.yarnrc.yml` and `.gitignore` indicate Yarn usage)
- **Can be executed via IDE agent**: Ask the AI assistant to run `yarn install` in the project directory
- Wait for dependencies to install

### 5. Run Development Server (Required to View the Application - Can Be Done via IDE Agent)

- In the integrated terminal, run: `yarn dev`
- **Can be executed via IDE agent**: Ask the AI assistant to start the development server
- The terminal will show the Next.js dev server starting
- The development server will be running at `http://localhost:3000`

### 6. Viewing Changes (After Project is Running)

Once the development server is running, you can view your application and see changes in real-time:

---

**Option A: Using Cursor's Built-in Browser**

- Cursor has a built-in browser preview feature
- You can open `http://localhost:3000` directly within Cursor
- Changes will automatically reload as you edit your code files

---

**Option B: Using VS Code Live Preview Extension**

- If using VS Code, use the Live Preview extension (installed in step 3)
- Open the Live Preview panel and navigate to `http://localhost:3000`
- The preview will show live updates as you edit your code

---

**Option C: Using Your Regular Browser**

- Open your preferred web browser (Chrome, Firefox, Safari, etc.)
- Navigate to `http://localhost:3000`
- The page will auto-reload when you make changes to the code

---

**Note**: You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## VS Code/Cursor Specific Tips

- **Integrated Terminal**: Use `Ctrl+`` (backtick) to toggle the terminal, or `View > Terminal`
- **Command Palette**: Use `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) for quick access to commands
- **File Explorer**: Use `Cmd+B` (Mac) or `Ctrl+B` (Windows/Linux) to toggle the sidebar
- **TypeScript Errors**: Errors will show inline with red squiggles. Check the Problems panel (`View > Problems`) for all issues
- **Code Formatting**: Prettier runs automatically on staged files via a pre-commit hook — no manual setup needed. Run `yarn format` to format everything at once
- **Git Integration**: Use the Source Control panel (`Ctrl+Shift+G`) to manage Git operations visually

## Claude Code & MCP Servers

This project ships a `.mcp.json` that auto-configures MCP servers for [Claude Code](https://claude.ai/code). Once you open the project in Claude Code, these servers connect automatically — no extra setup needed.

### Axiom MCP servers (key for UI work)

| Server     | Package               | What it provides                                                                                                           |
| ---------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `axiom`    | `@optiaxiom/mcp`      | Live Axiom **V2** component docs — valid props, token values, and usage patterns for all `app/` routes outside `app/opal/` |
| `axiom-v3` | `@optiaxiom/mcp@next` | Live Axiom **V3** component docs — same, but for `app/opal/` which uses the V3 design system                               |

Claude (and any skill that touches UI) calls these servers to validate color tokens, enum prop values, and component APIs against the live spec before writing code. Always prefer these over guessing prop values from memory.

### Other MCP servers

| Server       | What it provides                              |
| ------------ | --------------------------------------------- |
| `figma`      | Read Figma design files and component context |
| `coda`       | Access Coda docs                              |
| `optimizely` | Optimizely project data                       |
| `granola`    | Meeting transcripts                           |

---

## Summary: Required vs Optional

**Required Setup**:

---

**Manual Installation** (cannot be done via IDE agent):

- Node.js 18+ (install from nodejs.org or package manager)
- Git (usually pre-installed, or install from git-scm.com)
- VS Code/Cursor IDE (already installed if using it)

**Required Accounts**:

- GitHub account (for cloning the repository)
- Anthropic account (for Claude Code)

---

**Can Be Installed via IDE Agent/Terminal**:

- Yarn - can install via `npm install -g yarn` if Node.js is installed
- Claude Code extension - can install via Command Palette or IDE agent
- Live Preview extension (VS Code only) - can install via Command Palette or IDE agent (not needed for Cursor)

---

**Advanced (Contact the team - see Advanced section)**:

- Vercel account and deployment (see Advanced section)
- Deployment to Vercel (create branch, commit, push)

---

## Advanced: Deployment and Production Build

**Vercel Account Setup**

- Required for deployment and hosting the Next.js application
- Sign up at [vercel.com](https://vercel.com)
- You must be invited to the enterprise Vercel workspace — contact the team to request access
- Once invited, accept the invitation through your Vercel account

---

**Deployment to Vercel**

General steps for deploying to Vercel:

1. **Create a branch**
    - In the integrated terminal, run: `git checkout -b your-branch-name`
    - Or use VS Code/Cursor's Source Control panel to create a new branch
    - **Can be executed via IDE agent**: Ask the AI assistant to create a new branch

2. **Add and commit your changes**
    - Stage your changes: `git add .` (or use the Source Control panel in VS Code/Cursor)
    - Commit with a descriptive message: `git commit -m "Your commit message describing the changes"`
    - **Can be executed via IDE agent**: Ask the AI assistant to commit your changes

3. **Add notes and push your branch**
    - Ensure you've added a descriptive commit message in step 2
    - Push the branch to GitHub: `git push origin your-branch-name`
    - **Can be executed via IDE agent**: Ask the AI assistant to push your branch with notes

4. **Vercel Deployment**
    - Once your branch is pushed, Vercel will automatically detect the changes (if configured)
    - Or contact the team for manual deployment instructions
    - They will guide you through the Vercel deployment process

**Note**: Vercel auto-deploys every pushed branch as a preview URL — just push your branch and grab the preview link from the Vercel dashboard or the GitHub PR.

---

## Additional Reading and References

### Software Installation

- **Node.js**: [nodejs.org](https://nodejs.org/) - Download and install Node.js
- **Git**: [git-scm.com](https://git-scm.com/) - Download and install Git

### Account Sign-up Links

- **GitHub**: [github.com](https://github.com) - Sign up for a GitHub account
- **Anthropic**: [anthropic.com](https://anthropic.com) - Sign up for a Claude / Anthropic account
- **Vercel**: [vercel.com](https://vercel.com) - Sign up for a Vercel account

### Project Repository

- **Repository URL**: [https://github.com/episerver/axiom-play.git](https://github.com/episerver/axiom-play.git)

### Development Server

- **Local Development URL**: [http://localhost:3000](http://localhost:3000) - Access your running application

### Extensions (for VS Code and Cursor)

- **Live Preview by Microsoft**: [marketplace.visualstudio.com/items?itemName=ms-vscode.live-server](https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server) - VS Code extension for live preview (not needed for Cursor)
- **Claude Code**: [claude.ai/code](https://claude.ai/code) - AI coding assistant (VS Code extension or CLI)

### Framework and Technology Documentation

- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs) - Learn about Next.js features and API
- **Next.js Learn**: [nextjs.org/learn](https://nextjs.org/learn) - Interactive Next.js tutorial
- **Next.js GitHub Repository**: [github.com/vercel/next.js](https://github.com/vercel/next.js)

### Deployment Resources

- **Vercel Platform**: [vercel.com/new](https://vercel.com/new) - Deploy Next.js applications
