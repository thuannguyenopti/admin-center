# Opal Multi-Agent Chat Prototype

An interactive prototype demonstrating multi-agent collaboration within a single thread, with task continuation/forking capabilities.

## Key Features

### 1. **Multi-Agent Collaboration**
Three specialized agents working together in one thread:
- **Content Agent** (Purple) - Analyzes messaging and value proposition
- **Data Agent** (Cyan) - Reviews metrics and experiment data
- **Design Agent** (Orange) - Provides UX/UI recommendations

### 2. **Task Continuation Pattern**
When a user invokes an agent again within the same thread, a choice bar appears above the input:
- **Default action**: Continue working on the current task
- **Secondary action**: Start a new task within the same thread

### 3. **Visual Design**
- Based on Optimizely's Axiom design system
- Matches existing Opal interface patterns
- Purple accent color (#7c3aed) for brand consistency

## Demo Interaction

1. **Initial state**: Shows a completed multi-agent conversation about product page optimization
2. **Click "Demo: Ask Again"**: Triggers the task continuation UI
3. **Choose an option**:
   - **Continue: Product page optimization** - Agents reference previous work
   - **Start new** - Fresh start with visual task separator

## UX Pattern Details

### Task Continuation Bar
- **Location**: Above input area (where current agent bar exists)
- **Background**: Purple tint (#ede9fe) for visual continuity
- **Default action**: Emphasized with stronger border (continue task)
- **Secondary action**: Lighter border (start new)

### Thread Organization
- Tasks within the same thread are visually separated when starting new
- Previous work remains accessible via scroll
- Clear context handoffs between agents

## Files

- `index.html` - Standalone interactive prototype (open in browser)
- `MultiAgentChat.jsx` - React component source
- `README.md` - This documentation

## Usage

Open `index.html` in any modern web browser to interact with the prototype.
