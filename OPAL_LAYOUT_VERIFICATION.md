## Opal Chat Layout Verification

The following changes have been applied to fix the header and width alignment issues:

### Files Modified:
1. **OpalChatView.tsx** - Restructured layout to use flex instead of absolute positioning
2. **OpalInput.tsx** - Set maxWidth to 768px with centered margin
3. **OpalChat.tsx** - Set maxWidth to 768px with centered margin
4. **OpalMessage.tsx** - Updated user message background to use --avatar-bg-neutral
5. **opalStyles.css** - Added --avatar-bg-neutral CSS variable

### Expected Behavior:
- ✅ OpalHomeHeader should be visible at the top (not blocked by global nav)
- ✅ Chat messages container: 768px width, centered
- ✅ Chat input: 768px width, centered
- ✅ Both should be perfectly aligned

### Layout Structure:
```
┌──────────────────────────────────┐
│  OpalHomeHeader (visible)        │
├──────────────────────────────────┤
│  Scrollable Content              │
│    ┌────────────────┐            │
│    │ Messages 768px │ (centered) │
│    └────────────────┘            │
├──────────────────────────────────┤
│    ┌────────────────┐            │
│    │  Input 768px   │ (centered) │
│    └────────────────┘            │
└──────────────────────────────────┘
```

### Debugging Steps if Still Not Working:
1. Clear browser cache completely (Cmd+Shift+Delete)
2. Try in incognito/private window
3. Check browser console for any errors
4. Verify the dev server is running on port 3000
