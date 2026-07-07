Copy 


# Invite Users
Step 1 — User List
Admin enters the email address (with search/lookup), plus first and last name, then clicks "Add user" to queue them into a list below. Multiple users can be added before moving on — the table shows each queued entry with a delete option. Once the list is ready, the admin hits "Continue."
- If user already exits: display first name and last name
- If user not exits: input first name and last name
- disable "Continue" if no user added. 
Step 2 — Product Access
Admin configures access for the batch. Two entry points: "Add product access" or "Add group access." For product access, the admin selects a Product (e.g. Collaboration), then picks one or more Instances, and assigns a Role per instance. After saving, the configured access appears as expandable cards grouped by product — showing instance-role pairs with options to edit or delete. Multiple product access blocks can be stacked (e.g. Collaboration + Admin Center). Once all access is configured, "Continue" moves to review.

Step 3 — Review
A summary shows all invited users (email, first name, last name) in an expandable list, followed by the product access configuration beneath — grouped by product with instance/role detail. For Experimentation, there's an additional Project column with expandable rows per instance. At the bottom, two checkboxes: "Require Acceptance" (user must accept the invitation email) and "Send invitation email with password creation link." The admin clicks "Send Invite" to finalize.
Post-submit
After sending, a toast notification confirms the invitations were dispatched.
That's the three-step wizard: build the user list → assign product access → review and send.
After invite all data -> add on tab "All user"



# Admin Center — Spec for Vibe Code

## Global Nav

**Top bar:** Logo → Org Switcher (dropdown) → `/` → Product Switcher → | → "Ask Opal" (green pill) → Search → Notifications bell → Help `?` → User Avatar

**Left sidebar:**
```
Dashborad
User Management
  Users
  Virtual Teammates
  Groups
  Teams

Access Setup
  Product Access
  Roles

Settings
  Usage & Billing
  Activity Log
  Organization
  Notifications
  Authentication
  Opal AI
  Account
```

---

## 1. Dashboard 
notification card (number of noti ) -> click -> show right pannel 
Detail Noti pannel
  [header font size md] Seat limit exceeded 
  subtext 
  btn [upgrade plan] 
[divider]
  [header font size md] Renewal in 13 days - btn [view billing]
  subtext 
  btn [view billing]
[divider]...
Hover each card show close icon on the top right of card

## 9.1 Organization Overview 
 Card [Users]
 Card[Pending Invites]
 Card [Agents]
 Card [Products]
## 9.2 Subscription & Usage
 Card [Opal credits]-> click go to usage & billing 
 Card[MAU] -> click go to usage & billing 
 Card [Seats]-> click go to usage & billing 
 Card [Plan] -> click go to usage & billing 



## 2. User management
### 2.1 Users

 table [user list] 
#### 2.1.1 Invite Users flow 
Step 1 — User List
Admin enters the email address (with search/lookup), plus first and last name, then clicks "Add user" to queue them into a list below. Multiple users can be added before moving on — the table shows each queued entry with a delete option. Once the list is ready, the admin hits "Continue."
- If user already exits: display first name and last name
- If user not exits: input first name and last name
- disable "Continue" if no user added. 
Step 2 — Product Access
Admin configures access for the batch. Two entry points: "Add product access" or "Add group access." For product access, the admin selects a Product (e.g. Collaboration), then picks one or more Instances, and assigns a Role per instance. After saving, the configured access appears as expandable cards grouped by product — showing instance-role pairs with options to edit or delete. Multiple product access blocks can be stacked (e.g. Collaboration + Admin Center). Once all access is configured, "Continue" moves to review.

Step 3 — Review
A summary shows all invited users (email, first name, last name) in an expandable list, followed by the product access configuration beneath — grouped by product with instance/role detail. For Experimentation, there's an additional Project column with expandable rows per instance. At the bottom, two checkboxes: "Require Acceptance" (user must accept the invitation email) and "Send invitation email with password creation link." The admin clicks "Send Invite" to finalize.
Post-submit
After sending, a toast notification confirms the invitations were dispatched.
That's the three-step wizard: build the user list → assign product access → review and send.
After invite all data -> add on tab "All user"


#### 2.1.2 Invite by Upload 
 Click btn "Invite users" -> select "BUlk invite users" -> open right pannel
 pannel details: 
 Step 1: Upload file excel by using template -> validate file info -> import list user from excel to system 
 -> display list user the same step 1 in Invite user flow [2.1.1 Invite Users flow]
 Step 2. Same [2.1.1 Invite Users flow] step 2
 Step 2. Same [2.1.1 Invite Users flow] step 3

#### 2.1.3 Bulk management 

Trigger
User list page → checkbox select users → bulk action bar appears above table:
[N users selected ▾]  [Edit access]  [Add access]  [Remove access]  [More actions ▾]


"More actions ▾" dropdown: Edit user info · Edit user type · Reset password · Delete selected users


##### 2.1.3.1. Edit User Info
More actions → Edit user info
Modal: "Update user info"

Table: Email (read-only) · First name (input) · Last name (input)
Pre-filled with current values per user
Footer: Cancel · Update (blue)

Flow: Edit fields → Update → toast "User info updated" → modal closes

##### 2.1.3.2. Edit User Type
More actions → Edit user type
Modal: "Update user type"

Info banner: "Changing to Local sends password setup email. SSO users can't be edited locally."
Table: Email · User type (radio: Local ○ / SSO ○) — pre-selected with current type per user
Footer: Cancel · Confirm and save (blue)

Flow: Toggle types → Confirm and save → toast "User type updated" → modal closes

##### 2.1.3.3. Reset Password
More actions → Reset password
Validation: Check if all selected users are user type = Local

If mixed (has SSO users): Error modal "Cannot reset password" — "Password reset is only available for local users. Please filter users by User type = Local and try again." → "Got it" button
If all Local: Confirmation modal "Reset password for selected users" — warns: account goes to reset state, link expires 7 days → Cancel · Reset password (blue) → toast "Password reset email sent"


##### 2.1.3. 4. Add Access
Button: Add access
Modal: "Add access" (multi-step, reuses Invite User step 2 + 3 pattern)
Step 1 — Configure access:

Info banner: "All access from current selected users cannot be added again. If you cannot find a Role, one of the selected users likely already has it."
"Access" section with: Add product access · Add group access buttons
Empty state: "No access added yet. Choose one of the options to define what this user can do"
Add product access → same flow: Product dropdown → Instance dropdown (multi) → Role per instance
Add group access → select group → inherits group's access config
Footer: Back · Continue (disabled until access added)

Step 2 — Review:

Summary: selected users table (Email · First name · Last name) + access cards (Product → Instance → Role)
Footer: Back · Confirm (blue)

Flow: Configure → Review → Confirm → toast "Access added for N users" → modal closes



5. Remove Access
Button: Remove access
Step 1 — Select what to remove:
Modal: "Remove access"

"Choose the role you want to remove and where it applies"
Dropdowns (cascading):

Product * (required) → Select product
Role to remove → Select role (populated based on product, only shows roles shared by selected users)
Apply to instances → Select instance (multi-select, populated based on product)


Footer: Cancel · Continue (disabled until all fields selected)

Step 2 — Confirm:
Modal updates to show:

Summary card: "I want to: Remove role [Role] From Product [Product] Instance [Instance(s)]"
"Apply on selected users" table: Email · First name · Last name
Footer: Cancel · Remove access (red)

Flow: Select product/role/instance → Continue → Review → Remove access → toast "Access removed for N users"

7. Delete Selected Users
More actions → Delete selected users
Modal: "Delete selected users"

Warning banner (yellow): "This action will permanently remove selected users from your organization in Opti ID, and they will lose access to all previously assigned product access."
Table: Email · First name · Last name · Activation status (Active green / N/A gray)
Footer: Cancel · Confirm and delete (red)

Flow: Review list → Confirm and delete → toast "N users deleted" → modal closes → table refreshes
##### 2.1.3.5 Edit access 
Seleced users -> click edit access 

Screen 1 — Edit Access panel
Display shared access grouped by:
Product → Instance → Project → [role groups]
Each role group shows:

Role dropdown (editable) -> select role to change - single choose
Affected user count + expandable list (email, first name, last name)


Screen 2 confirm change

Shared Patterns
All modals:

✕ close button top-right
Sticky footer (Cancel + action button)
Destructive actions = red button (Delete, Remove)
Non-destructive = blue button (Update, Confirm, Reset)

Toast after every action:

Success: green left-border toast, auto-dismiss 5s
Error: red left-border toast, persists until dismissed

Table refreshes after modal closes on success (selected checkboxes cleared)

### 2.2. Virtual Teammates

**Header:** "Virtual Teammates" + ⓘ tooltip + "Learn more" link | CTA: "Invite User" (split button)

**Filter bar:** Search input | Product dropdown | Instance dropdown | Project dropdown | Role dropdown

**Table columns:** First Name · Agent (user type, thay cho Last Name) · Email · Product · Created by · Created · ⋯ menu

**⋯ menu:** View details · Edit access · Deactivate · Delete

**Row click → Side panel (slide-in right):**
- Avatar + Agent name + "Agent" badge + Status (Active/Inactive)
- Info: Email · Created by · Created · Last active
- Product Access list: Product → Instance → Role (grouped, collapsible)
- Actions: Edit Access · Deactivate · Delete

**Pagination:** numbered pages



### 2.3 Groups

### 2.4 Teams 

## 3. Access Setup

### 3.1 

## 4. Settings


## 1. Virtual Teammates

**Header:** "Virtual Teammates" + ⓘ tooltip + "Learn more" link | CTA: "Invite User" (split button)

**Filter bar:** Search input | Product dropdown | Instance dropdown | Project dropdown | Role dropdown

**Table columns:** First Name · Agent (user type, thay cho Last Name) · Email · Product · Created by · Created · ⋯ menu

**⋯ menu:** View details · Edit access · Deactivate · Delete

**Row click → Side panel (slide-in right):**
- Avatar + Agent name + "Agent" badge + Status (Active/Inactive)
- Info: Email · Created by · Created · Last active
- Product Access list: Product → Instance → Role (grouped, collapsible)
- Actions: Edit Access · Deactivate · Delete

**Pagination:** numbered pages

---

## 2. Usage & Billing

### 2.1 Summary Cards (top row)
- **Plan:** plan name · renewal date · status badge (Active/Expiring/Expired)
- **Billing Cycle:** Monthly/Annual · current period · next invoice date
- **Seats:** used/total + progress bar (green <80%, orange 80-95%, red >95%)
- **Balance:** amount · "View invoices" link

### 2.2 Usage by Product (tab bar: All · Experimentation · CMP · CMS · Collaboration · Opal)
- Usage gauge (MAU / Credits / Events) — used vs. allotted + trend %
- Seat table per product: Instance · Seats Used · Seats Allotted

### 2.3 Seat Detail Table
Columns: Product · Instance · Total Seats · Used · Available · Utilization bar

### 2.4 Invoices
Filter: date range picker · status filter (All/Paid/Pending/Overdue)
Columns: Invoice # (link) · Date · Amount · Status badge · Download PDF

### 2.5 Product Billing Detail
- **Opal:** credits gauge · daily consumption line chart · breakdown table (Feature · Credits · %)
- **Experimentation:** MAU gauge · MAU bar chart by instance · event volume
- **CMP:** seat usage per instance

---

## 3. Activity Log

**Filter bar:** Date range (presets + custom) · Actor (search) · Action type (multi-select) · Resource (search) | Export button (CSV/PDF)

**Table columns:** Timestamp · Actor · Action · Resource · Details · IP Address

**Row click → expand inline:** before/after diff · session metadata

---

## 4. Organization

### 4.1 Profile
Fields: Org Name (editable) · Org ID (read-only, copy) · Created · Primary Contact (dropdown) · Support Tier

### 4.2 Status Indicators
Rows: Account Status · Subscription Status · SSO Status · SCIM Status · MFA Status
Each: label → badge (green/orange/red/gray) → action link

### 4.3 Products
Columns: Product · Instances count · Status badge · Contract End

### 4.4 Domains
List: Domain · Verification status · Date added · ⋯ menu
CTA: "Add Domain" button

---

## 5. Notifications

### 5.1 Billing Notifications
Per product instance row:
```
[Toggle] Product - Instance Name
          Manage Recipients (N) → modal: search + add/remove recipients
```

### 5.2 System Notifications (proposed)
Categories with toggles: Security Alerts · User Provisioning · Role Changes · Seat Threshold · Certificate Expiry · Maintenance
Each: toggle + "Manage Recipients" + delivery channel (Email/In-app/Both)

### 5.3 Preferences
Digest frequency: Real-time / Daily / Weekly (radio)
Quiet hours: toggle + time range

---

## 6. Authentication

**Tab bar:** SSO | Domains / Dynamic Provisioning | SCIM

### SSO tab
- Info banner (note about MFA for SSO)
- "Add SSO Connection" dropdown (SAML 2.0 / OIDC)
- Connections list (expandable): IDP type · Entity ID · Login URL · Cert status · Edit/Delete/Test
- **Selective Local Login:** toggle + description
- **MFA:** toggle + enforcement options (Required/Optional) + grace period dropdown

### Domains tab
- Domain list: domain · status · date · actions
- "Add Domain" button
- **Dynamic Provisioning:** toggle + default role dropdown + default group

### SCIM tab
- Toggle enable/disable
- SCIM Base URL (copy) · Bearer Token (masked, show/regenerate)
- Last sync · Sync status

---

## 7. Opal AI

### 7.1 Enable Opal (master toggle)
Toggle On/Off — Off cần confirmation modal
Description thay đổi theo state

### 7.2 Feature Controls (proposed)
Toggles: Opal Chat · Virtual Teammates · Content Generation · Experiment Suggestions · Smart Recommendations
Disabled khi master toggle = Off

### 7.3 Data & Privacy (proposed)
- AI Training Opt-out toggle
- Data Retention dropdown (30d / 90d / 1y / No retain)
- Content Guardrails toggle

---

## 8. Account

**Access:** Avatar click → dropdown: My Profile · Preferences · Sign Out

### 8.1 Profile
Avatar (upload) + fields: First Name · Last Name · Email (read-only) · Job Title · Department · Phone · Timezone · Language · User Type (badge) · Auth Type (badge) · Last Login

"Edit Profile" → toggle edit mode → Save/Cancel

### 8.2 My Product Access (read-only)
Collapsible cards per product:
- Standard: Instance → Role
- Experimentation: Instance → Project → Role (nested expandable)

### 8.3 Groups & Teams
List: icon · Name · Member count · Role

### 8.4 Security
- Change Password (local login only) → modal
- MFA status + setup/manage
- Active Sessions: Device · Browser · Location · Last active · Revoke

---

## Shared Patterns

**Toast:** top-right, auto-dismiss 5s, types: success/error/warning/info
**Confirmation modal:** title + description + Cancel + Action button (red for destructive)
**Loading:** skeleton loaders for tables/cards
**Empty state:** illustration + text + CTA
**Toggles:** optimistic save, destructive toggles cần confirmation
**Editable fields:** hover show pencil icon → inline edit → ✓/✕
**Badges:** green (active/on) · orange (warning) · red (error/expired) · gray (inactive/off)

# Support > Settings Tab — Developer Access Governance

## Context

New tab under Support page (alongside Access, Account Activation, User Home Organization, View User Permissions, Usage & Billing). This tab centralizes org-level governance settings for supporters. First section: Developer Access.

---

## Page Structure

**Tab label:** `Settings`

**Page layout:**
- Search bar: "Search organizations by name..." (same pattern as Access tab)
- Org list: flat list of all organizations the supporter has access to
- Each org card contains: org name, developer access toggle, vendor info (when enabled)

---

## Org Card — Default State (Dev Mode OFF)

```
┌─────────────────────────────────────────────────┐
│ Admin Center Cypress Testing                    │
│                                                 │
│ ○ Enable OCP Developer Access  ⓘ               │
│   Status: Inactive                              │
└─────────────────────────────────────────────────┘
```

**Components:**
- Org name: text, bold, 16px
- Toggle: off state, label "Enable OCP Developer Access"
- Info icon (ⓘ): tooltip → "Allow this organization to build apps in OCP through approved developer access."
- Status badge: `Inactive` (grey)

---

## Interaction: Enable Dev Mode

**Trigger:** Supporter clicks toggle ON

**Step 1 — Vendor Name Dialog**

```
┌──────────────────────────────────────────┐
│  Enable Developer Access                 │
│                                          │
│  Vendor name is required to identify     │
│  this organization in OCP developer      │
│  access and app ownership.               │
│                                          │
│  Vendor name                             │
│  ┌──────────────────────────────────┐    │
│  │ Enter vendor name                │    │
│  └──────────────────────────────────┘    │
│  ⚠ Vendor name is required.             │
│                                          │
│            [Cancel]  [Enable]            │
└──────────────────────────────────────────┘
```

**Dialog components:**
- Type: center modal (not slide-in panel — this is a confirmation-level action)
- Title: "Enable Developer Access"
- Description: explains vendor name purpose
- Input field: "Vendor name" label, placeholder "Enter vendor name"
- Validation: required field, show inline error if empty on submit
- Actions: `Cancel` (secondary) / `Enable` (primary, disabled until input is valid)

**Step 2 — Confirm**

On "Enable" click:
- API call to enable dev mode + save vendor name
- Dialog closes
- Toggle animates to ON
- Org card updates to enabled state
- Success toast: "Developer access enabled for [Org Name]"

---

## Org Card — Enabled State (Dev Mode ON)

```
┌─────────────────────────────────────────────────┐
│ Optimizely Organization                         │
│                                                 │
│ ● Enable OCP Developer Access  ⓘ               │
│   Status: Active                                │
│   Vendor: TECHNOLOGY_ABC  [Edit]                │
└─────────────────────────────────────────────────┘
```

**Components:**
- Toggle: on state (green)
- Status badge: `Active` (green)
- Vendor name: display text + `Edit` button
- Edit button opens same dialog pre-filled with current vendor name, title changes to "Edit Vendor Name", primary button changes to "Save"

---

## Interaction: Disable Dev Mode

**Trigger:** Supporter clicks toggle OFF on an enabled org

**Confirmation dialog:**

```
┌──────────────────────────────────────────┐
│  Disable Developer Access                │
│                                          │
│  This will revoke developer access for   │
│  [Org Name]. Users with the OCP          │
│  Developer role will lose access to OCP. │
│                                          │
│  This action cannot be undone without    │
│  re-enabling and reconfiguring.          │
│                                          │
│            [Cancel]  [Disable]           │
└──────────────────────────────────────────┘
```

**Dialog components:**
- Type: center modal (destructive confirmation)
- Title: "Disable Developer Access"
- Description: warns about impact
- Actions: `Cancel` (secondary) / `Disable` (destructive/red)

**On confirm:**
- API call to disable dev mode
- Toggle animates to OFF
- Vendor name hidden
- Status reverts to `Inactive`
- Toast: "Developer access disabled for [Org Name]"

---

## Edit Vendor Name

**Trigger:** Click `Edit` on enabled org card

**Dialog:** Same as enable dialog but:
- Title: "Edit Vendor Name"
- Input pre-filled with current vendor name
- Actions: `Cancel` / `Save`
- Toast on save: "Vendor name updated for [Org Name]"

---

## States Summary

| State | Toggle | Status Badge | Vendor | Edit Button |
|-------|--------|-------------|--------|-------------|
| Disabled | OFF | Inactive (grey) | Hidden | Hidden |
| Enabled | ON | Active (green) | Shown | Shown |
| Loading | Disabled | Spinner | — | Disabled |
| Error | Reverts | Error toast | — | — |

---

## Error Handling

- **Enable fails:** Toggle reverts to OFF, error toast "Failed to enable developer access. Please try again."
- **Disable fails:** Toggle stays ON, error toast "Failed to disable developer access. Please try again."
- **Edit vendor fails:** Dialog stays open, inline error "Failed to update vendor name. Please try again."
- **Empty vendor name on enable:** Inline validation "Vendor name is required to enable developer access."

---

## API Calls (for dev reference)

- `POST /org/{orgId}/developer-access/enable` — body: `{ vendorName: string }`
- `POST /org/{orgId}/developer-access/disable`
- `PUT /org/{orgId}/developer-access/vendor` — body: `{ vendorName: string }`
- `GET /org/{orgId}/developer-access/status` — returns: `{ enabled: boolean, vendorName: string | null }`

---

## Notes

- This tab only appears for supporters (permission-gated)
- Org list uses same data source as Access tab org list
- Developer Access is the first section — future sections (AI/Opal config, API settings) will follow the same card pattern per org
- Toggle action does NOT create entries in the Access tab — developer role provisioning is a backend concern, not a supporter entitlement
