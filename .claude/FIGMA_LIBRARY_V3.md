# Axiom V3 Figma Library Reference

**Purpose:** Authoritative reference for every Figma build agent. Missing keys = wrong output. Always use this file before writing any Figma design code. If a component is not listed here, run `search_design_system` at build time before guessing.

**V3 library fileKey:** `qs72V79n1s9wYOcZ1TzBwM`

---

## Library Keys

| Library | libraryKey |
|---------|-----------|
| Axiom Design System (V3, canonical) | `lk-d7174ce160e385d2e236c46ac815460e3111dd378e6c26dfa34198e3901b57863dea7e88038763206cbba3b7029f8cb87e136c96694a6ee84036a4cebf6eaab7` |
| Axiom Icons | `lk-672f9e4dbac68525814765e8d1b6dfb951c67ecbb58a69f2a57a4b640ec35379558b8110c14682d16409ec6860c173101bd3e4de993e548974f8d8159c613396` |
| Opal Components | `lk-54eb86eabc82c421a6439074f1b99c0fe5d884475ee59279d0120989bdc9b03376fdbaa7a278c1178668776eee2f37e5b855d9ab2070fa93cf9c212b42f268de` |

**Branch rule:** V3 is the default branch. Use V2 (main branch) only when explicitly targeting the main branch.

---

## Components — Axiom Design System (V3)

All `componentKey` values are for use with `importComponentByKeyAsync`. `component_set` means it contains variants; use the property table to pick the right one.

### Interactive Controls

| Component | assetType | componentKey | Key variants / notes |
|-----------|-----------|-------------|----------------------|
| Button | component_set | `8bb2661a46f1bb6c35f928e12b5ac0b950eda634` | Updated 2026-06-19 |
| Toggle Button | component_set | `6515d66781a16aa9046b018f90dba6276472a513` | |
| Menu Label Button | component_set | `bed4de19dc3b95439bd0beba3f4a69599ff8eaef` | |
| Add Button | component_set | `4c52744eec83189c194e8a77d14afb3476217241` | |
| Checkbox | component_set | `1b51f2a59548085582454116eecc3835d2d5dbc0` | Use this (updated 2026-06-19); older key: `96ff43a8baf590d1c8bfb4ea84c94475e9058ec9` |
| Toggle | component_set | `874be68474689cf5f96831d5029bf55258651f37` | |

### Feedback & Status

| Component | assetType | componentKey | Key variants / notes |
|-----------|-----------|-------------|----------------------|
| Alert | component_set | `03d2f87e47aab9cca1cf94969454df6a6050c0ee` | Most recently updated (2026-07-02) |
| AlertDialog | component_set | `a04de88e011a0d98ce47128088e9d5f72cab1538` | |
| Badge | component_set | `f0a4e90b5415081932a85616bb0dd63dff0ce59b` | Updated 2026-06-19 |
| Spinner | component_set | `7b7af13ed805bcff4a0401591b07e86f347e1808` | |
| Error | component_set | `181e1c1a70a74124d0f10a2058d84144ccf0fe60` | |
| Tooltip | component_set | `e6203be6017513bd06278ed5acfa83d2ec5da321` | |
| Help Tooltip | component_set | `becff2a9f29ac15ded0de4781616a68e923758f1` | |

### Display

| Component | assetType | componentKey | Key variants / notes |
|-----------|-----------|-------------|----------------------|
| Avatar | component_set | `78b07b467e9e5b5d3c68270c368be35c1c5ed5c9` | Updated 2026-06-19 |
| Avatar Group | component | `900c960f0ac18a0f87697af2d1d0495d8a5e4a70` | Single component (no variants) |
| Data Cell | component_set | `827bab63db023b922abd275f6aa5229f569c4025` | Updated 2026-06-30 |
| Block Element (Experimental) | component_set | `6eca0a48e68722063fd508cfda45babfe98dd384` | |

### Navigation

| Component | assetType | componentKey | Key variants / notes |
|-----------|-----------|-------------|----------------------|
| Sidenav Base | component_set | `d902d4aacc11620d63b083878aee026015c5b135` | |
| Sidenav parts/menu item (FA icon) | component_set | `2a9c06ac3c1926fbbe2ad8dd0b0d5badab3fb984` | |
| SubNav items/Back button | component | `2ada666c1f87254404a097d88d0c43dcf952e579` | |
| SubNav items/Menu | component_set | `86ebfdf582eced83a59b7d4146d5e50cb3f7ac09` | |

### Layout / Structural

| Component | assetType | componentKey | Key variants / notes |
|-----------|-----------|-------------|----------------------|
| Border Clear | component_set | `48f55ec18d9926b1e9a4ca6141c0d0b91fc35eaf` | |
| Separator Padded | component | `55820eee6780e9fd31f45d0ef4242eab3e9ad8b4` | Single component |

---

## Icons — Axiom Design System (V3)

Icons in V3 are individual component sets. Each has `Active=False` and `Active=True` variants. Always use `Active=False` unless the icon needs an active/highlighted state.

Icon imports in code use `@optiaxiom/icons` — NOT `@optimizely/axiom-icons` or `@tabler/icons-react`.

### Icon Component Keys

| Icon name (Figma) | @optiaxiom/icons export | componentKey | Variant to use |
|-------------------|------------------------|-------------|----------------|
| Search | `IconMagnifyingGlass` | `a99cb9a6110356ace11cb57186faba289f76b280` | `Active=False` |
| Chevron Left | `IconChevronLeft` | `e4183bd0df69feefa565118145dd2a2b16edf70d` | `Active=False` |
| Chevron Down | `IconChevronDown` | `09cc2cdd78f21507b338db6fe04a50a71a2eda73` | `Active=False` |
| Notification (Bell) | `IconBell` | `be7a2ac0c0ce8404824c7cbb776c600ecb055d87` | `Active=False` |
| Settings (Gear) | `IconGear` | `2b2d1ec2379eeb081f438b3b897682cfc7726d59` | `Active=False` |
| Book | `IconBook` | `9ce749d063b6f99b338d79e1f71716b5d5cc5d00` | `Active=False` |
| Image Person (Square User) | `IconImagePerson` | `99c2822e94b64bb2d4b9090e97f00af1ee925872` | `Active=False` |
| More (Ellipsis) | `IconEllipsis` | `9772d026ef2cddf9714f976244336d90028111d8` | `Active=False` |
| Sparkles | `IconSparkles` | `f220eb64ed0effd1b315605cad9ea58c988419f0` | `Active=False` |
| Chat (Comments) | `IconChat` | `d7be249c7554372aad9e869fe40e2b11351f773e` | `Active=False` |
| Check Circle | `IconCheckCircle` | `0b9ee2e7d8dfc1671869fda9897cd988eb0f2716` | `Active=False` |
| Refresh (Arrow Rotate) | `IconRefresh` | `2e5a2a9b61e4e6b34e8f44603e0e4f3cc513ca9d` | `Active=False` |
| History (Clock) | `IconHistory` | `d97e050a623235552bb76086c035639a0984f00b` | `Active=False` |
| Arrow Down Circle | `IconArrowDownCircle` | `0b1d812c80a390277ca81b780e9b12640034febc` | `Active=False` |
| Close / Xmark | `IconXmark` | `94021c35dea93d114eb2b1c081fecebc71c44c86` | `Active=False` — ⚠️ USE THIS for close buttons. Figma name: "Close", library "Axiom Design System" (confirmed 2026-07-17). Do NOT use the legacy Axiom Icons `6824278e…` "xmark-thin 24" below. |

### Icons not found in "Axiom Design System" — use Axiom Icons library

| Icon | Axiom Icons componentKey | Notes |
|------|--------------------------|-------|
| ~~Xmark / Close~~ | ~~`6824278e82aa2571467fb347e30501ba24e0c328`~~ | ⛔ **LEGACY — do not use.** The V3 "Close" icon IS in Axiom Design System (`94021c35…`, above). This legacy `xmark-thin 24` from the Axiom Icons lib was used by mistake and flagged as wrong. |
| Plus / Add | Not found via MCP — use `search_design_system` query "Plus Axiom Icons" at build time | From `@optiaxiom/icons` as `IconPlus` |

---

## Variables — Axiom Design System (V3)

### Color Variables

**Collection: "1. Colors Semantic"**
variableSetKey: `4e7174112093de5308bde69d85dd83693bca0d16`

#### Border tokens

| Token path | variableKey |
|-----------|-------------|
| `colors/border/default` | `511b503c64e6ac7350fb13ee96eb925897780d27` |
| `colors/border/secondary` | `1a0c9387d66996de165d84cbb597974d68fddf96` |
| `colors/border/light` | `445f9e91e0f5725b1f4b336c1350ff77c275160b` |
| `colors/border/error` | `4786b6c5fb6c8ed4363458dc4e80bae16a3e9a8c` |
| `colors/border/warning` | `9ff088ab38c3d08d10ac989ceb8c3f262e41c4d9` |
| `colors/border/disabled` | `9b9a0cf6cef409404198275111f3d17c7c8838e6` |
| `colors/border/control` | `d71307925315cf4def57a4068e8fe8661b60fc78` |
| `colors/border/control_hover` | `e79f409544d9b06bf8a24fa2e697c1ed902ba449` |

#### Component-level tokens

| Token path | variableKey |
|-----------|-------------|
| `component/Table/border` | `2525b731ea71a4286228bf5dd4a778a059bc6bd9` |
| `component/Avatar/bg-purple` | `f05403a78a33245b53514ce37f4dcf2a26759304` |
| `component/Avatar/fg-purple` | `832603931203c3dacfaf995889a810ac49e3a28b` |
| `component/Avatar/bg-neutral` | `bef7d61ffebcb0b4c9c3d1957b65e6fb8638f953` |
| `component/Avatar/fg-neutral` | `4cb932d35cd48ae685f9198f09c7a70a7cc03f4d` |
| `component/Spinner/bg-default` | `1c35e29be2e0f82fb7363e8854c84c42770a6ff4` |
| `component/Spinner/bg-inverse` | `0507f7caad92c645f54d733d5d492d54e4f9e1fa` |
| `component/Spinner/indicator-default` | `717ada61d507ef8081ebd9aab45cd55c819ffba9` |
| `component/Spinner/indicator-inverse` | `10c86feffc2e6f79a11dcd903d0a5dda95274d42` |

#### Background / foreground semantic tokens (bg.*, fg.*)

These were NOT returned by MCP `search_design_system` queries. At build time, use:
```
search_design_system(query: "bg default background", fileKey: "qs72V79n1s9wYOcZ1TzBwM", includeVariables: true)
```
Then filter results by libraryKey `lk-d7174ce160e385d2e236c46ac815460e3111dd378e6c26dfa34198e3901b57863dea7e88038763206cbba3b7029f8cb87e136c96694a6ee84036a4cebf6eaab7`.

**Collection: "0. Primitives"**
variableSetKey: `898663953f1f93cfe7d6c7523abd376c9c7f26db`

| Token path | variableKey |
|-----------|-------------|
| `Colors/Red/50` | `edf7c04872beb8fc290f233c33d4b97ef8a3fa31` |
| `Colors/Cyan/50` | `cf38825bd15263b0eba7635f4978947e81c03377` |

### Spacing Variables

**Collection: "3. Layout"**
variableSetKey: `703b36cc19b684c896b5122aba71edbd953c31ce`

| Token | variableKey |
|-------|-------------|
| `spacing/spacing-0` | `8425dc327af9919d339814bdb77bc184dd72ae25` |
| `spacing/spacing-2` | `27b2100c40d51c18056901c2964385f2cc6f62d5` |
| `spacing/spacing-4` | `63c84340dc8e051284570a568c79d74d4c3e24af` |
| `spacing/spacing-6` | `64d110ccc1fcb585ec1726b84169bbf5e184df40` |
| `spacing/spacing-8` | `030a92fb19ffb0a6a3d747f0097093ff69ce790a` |
| `spacing/spacing-12` | `e01d2d5d7e8742ce9fbab127d7a6d167d1826cd9` |
| `spacing/spacing-20` | `25d5579b4e90445f7fa386b953c63830d8644f95` |
| `spacing/spacing-24` | `5f02fa75a8c29edaa4f353f20d7572e4093e95d1` |
| `spacing/spacing-32` | `2ef3a35cf11a5faf4e79dd7a5d25bf1edf819513` |
| `spacing/spacing-64` | `3a75c50220d13d5de09404f5ad108524bcbe9842` |
| `spacing/spacing-80` | `e2ccb815e54b350ddcee2003ea4ac74a37b0972a` |

> Note: `spacing/spacing-16` was only found in "Foundations V2 - Legacy" — use `spacing-12` or `spacing-20` from V3, or look up at build time.

### Radius Variables

**Collection: "3. Layout"** (same variableSetKey: `703b36cc19b684c896b5122aba71edbd953c31ce`)

| Token | variableKey |
|-------|-------------|
| `radius/radius-none` | `b97fd17b87362dfc4790597fc89001849dd33c27` |
| `radius/radius-xs` | `99b7222a0df85ab85f168d0836bff64365d6a93f` |
| `radius/radius-sm` | `5456319c38257f333f40ff3b4fe710185ddbe6e4` |
| `radius/radius-md` | `6c68b59b5aaaa67516c6c7d2185451cbd13676e0` |
| `radius/radius-lg` | `d7e29dcfa68d7ed299f296a7c1b4d0f2353df63e` |
| `radius/radius-xl` | `648c3dd74c74bafb3c4d01354ff8c7ca28966a19` |
| `radius/radius-full` | `8f820c7967581a2c06a1628edb30be128ac2a764` |

### Typography

Typography style details (fontSize/fontWeight/lineHeight) were not returned by MCP `search_design_system`. The type scale lives in the "Typography" and "Opticon Typography" libraries (legacy names). At build time, use:
```
search_design_system(query: "heading body label type scale", fileKey: "qs72V79n1s9wYOcZ1TzBwM", includeStyles: true)
```

---

## Opal-Specific Components

These live in the **Opal Components** library, not Axiom Design System.

| Component | assetType | componentKey | Notes |
|-----------|-----------|-------------|-------|
| OpalAlert | component_set | `0b394e3c11043b2e1bf768c8c548de0df1e4948a` | Newest (updated 2025-12-23); older: `d241bae082fe212573c3bb74b000ce8df83d7d8b` |
| Opal Button | component_set | `525fe98efb6aa15e7e304000de23ef57bd7f543f` | |
| Opal Icon | component_set | `1d6bc2192fd97e0dee5a461b20592962b04b6de3` | |
| Quick action button | component | `1f9a91198e5d0709f48ea763d59038ccf7487846` | |

### Opal-Specific Notes

- **Opal avatar image:** Use `/opal-icon-nav.png` — NOT `/opal-orb.png` (old blue/purple sphere) or `/fd-avatar-opal.png` (old colorful orb). Render as plain `<img>` tag, not Next.js `<Image>`, to avoid optimization cache issues.
- **OpalAlert gradient:** The newest OpalAlert component set (key above) includes the gradient variant. Use the most recently updated key.
- **Icon source in code:** All icon imports in `app/opal/` use `@optiaxiom/icons`. Example: `import { IconSparkles } from "@optiaxiom/icons"`. Never use `@optimizely/axiom-icons` or `@tabler/icons-react`.

---

## Components Not Found in Axiom Design System V3

These require a fresh `search_design_system` query at build time — they either don't exist in V3 or search didn't surface them:

| Component | Reason | Recommended query |
|-----------|--------|-------------------|
| Input (standalone) | Only third-party kits returned | `"Input text field Axiom"` |
| Select / Dropdown V3 | Only older "Axiom Components" versions returned | `"Select dropdown Axiom V3"` |
| Plus / Add icon | Not in Axiom Design System results | `"Plus Axiom Icons"` — check Axiom Icons library |

---

## How to Use This File

1. **Before writing any Figma design call:** check this file for the componentKey.
2. **To instantiate a component:** use `importComponentByKeyAsync(componentKey)`.
3. **To apply a variable:** use the `variableKey` with the Figma Variables API.
4. **If the component is missing from this file:** run `search_design_system` with `fileKey: "qs72V79n1s9wYOcZ1TzBwM"` and filter results to libraryKey `lk-d7174ce160e385d2e236c46ac815460e3111dd378e6c26dfa34198e3901b57863dea7e88038763206cbba3b7029f8cb87e136c96694a6ee84036a4cebf6eaab7` (Axiom Design System).
5. **Never hand-roll** a component that Axiom already provides.
6. **Axiom layout props:** use `start`/`end` — never `flex-start`/`space-between`.

---

*Last updated: 2026-07-02 via MCP search_design_system queries against fileKey `qs72V79n1s9wYOcZ1TzBwM`.*
