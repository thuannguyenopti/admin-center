# Usability Testing Plan: Agent Versioning & History

## **Test Objective**
To evaluate the discoverability and ease of use of the new **Agent Versioning System**. We want to ensure users can intuitively find past versions, compare changes, and safely restore previous configurations without confusion.

---

## **Scenario 1: Discovery & Viewing**
**Goal:** specific functionality testing (Finding the entry point and entering "View Mode").

**Task:**
> "You have been editing the 'Content Localizer' agent, but you suspect you might have deleted some important instructions from the prompt earlier today.
> 
> Please **find the history of changes** for this agent and **view the details** of the previous version labeled **'V6'** to see what it looked like."

**Success Criteria:**
1. User hovers/clicks the **History (Clock)** icon in the top-right header.
2. User locates **V6** in the sidebar list.
3. User clicks the **Eye icon** or selects **"View this version"** from the ellipsis menu.
4. User notices the blue banner appearing at the top: *"You are viewing V6..."*.

---

## **Scenario 2: Identifying Changes (Comparison)**
**Goal:** specific functionality testing (Using the "Compare" feature and understanding visuals).

**Task:**
> "You are viewing V6, but it looks very similar to your current version. You need to see exactly what is different.
> 
> **Compare 'V5' against your current version** and visually identify which specific variable was removed in that older version."

**Success Criteria:**
1. User opens the ellipsis menu for **V5** (or V6 if they are still there, but task specifies V5).
2. User selects **"Compare with current"**.
3. User sees the **Comparison View** (side-by-side or stacked diffs).
4. User toggles **"Show diffs"** (if not auto-enabled) or identifies the red/green highlighting in the fields to spot the difference.

---

## **Scenario 3: Restoration**
**Goal:** specific functionality testing (Restoring a version and confirming state).

**Task:**
> "After comparing, you've decided that **V4** was actually the best version of this agent.
> 
> **Restore Version 4** so that it becomes your main, active configuration again."

**Success Criteria:**
1. User locates **V4** in the history list.
2. User selects **"Restore this version"** from the menu OR clicks **"Restore V4"** if they are currently viewing/comparing it.
3. User confirms the action (if a confirmation dialog exists) or notes the immediate update.
4. User recognizes that the UI has returned to the main edit screen and the current version fields have updated.

---

## **Scenario 4: Validation (The "Test Run" Workflow)**
**Goal:** specific functionality testing (Verifying the restored version works).

**Task:**
> "Now that you have restored the previous version, you want to make sure it still behaves as expected before saving.
> 
> **Run a quick test** using the inputs provided in the panel to generate a sample output."

**Success Criteria:**
1. User clicks the **"Test Run" (Play)** button in the header.
2. User sees the **Input/Output tray** slide out.
3. User enters sample text into the input field(s).
4. User clicks **"Run Test"** and waits for the output to appear.

---

## **Post-Test Questions**
1. Was it clear to you that you were in "History Mode" vs "Edit Mode"?
2. Did you feel confident that clicking "Restore" wouldn't accidentally delete your work?
3. How easy was it to spot the differences between the two versions?
