"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, Box, Button, Text } from "@optiaxiom/react";
import {
  IconXmark,
  IconPaperPlaneTop,
  IconSparkles,
  IconEye,
  IconArrowUpRightFromSquare,
} from "@optimizely/axiom-icons";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useIMData } from "../hooks/useIMData";
import { avatarFor } from "../lib/avatars";

// ── Preview content ──────────────────────────────────────────────────────────

const PREVIEW_STYLES = `
  @keyframes chatSlideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
  .cos-doc h2 { font-size: 17px; font-weight: 700; margin: 0 0 2px; color: var(--ax-colors-fg-default); }
  .cos-doc .doc-meta { font-size: 12px; color: var(--ax-colors-fg-tertiary); margin: 0 0 20px; }
  .cos-doc h3 { font-size: 13px; font-weight: 600; margin: 20px 0 8px; color: var(--ax-colors-fg-default); text-transform: uppercase; letter-spacing: 0.04em; }
  .cos-doc p { font-size: 13px; line-height: 1.6; color: var(--ax-colors-fg-secondary); margin: 0 0 10px; }
  .cos-doc ul, .cos-doc ol { font-size: 13px; line-height: 1.8; color: var(--ax-colors-fg-secondary); margin: 0 0 10px; padding-left: 0; list-style-position: inside; }
  .cos-doc li { margin-bottom: 2px; }
  .cos-doc strong { font-weight: 600; color: var(--ax-colors-fg-default); }
  .cos-doc .status-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--ax-colors-border-secondary); font-size: 13px; }
  .cos-doc .status-row:last-child { border-bottom: none; }
  .cos-doc .pill { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
  .cos-doc .pill-green { background: #dcfce7; color: #15803d; }
  .cos-doc .pill-yellow { background: #fef9c3; color: #854d0e; }
  .cos-doc .pill-red { background: #fee2e2; color: #b91c1c; }
  .cos-doc .decision-row { display: grid; grid-template-columns: 1fr 100px 80px; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--ax-colors-border-secondary); font-size: 13px; color: var(--ax-colors-fg-secondary); }
  .cos-doc .decision-row.header { font-weight: 600; color: var(--ax-colors-fg-default); font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
  .cos-doc .check-item { display: flex; align-items: flex-start; gap: 8px; padding: 4px 0; font-size: 13px; color: var(--ax-colors-fg-secondary); }
  .cos-doc .check-box { width: 16px; height: 16px; border: 1.5px solid var(--ax-colors-border-default); border-radius: 3px; flex-shrink: 0; margin-top: 1px; }
  .im-md p { margin: 0 0 6px; }
  .im-md p:last-child { margin-bottom: 0; }
  .im-md strong { font-weight: 600; }
  .im-md em { font-style: italic; }
  .im-md ul, .im-md ol { margin: 4px 0 6px; padding-left: 20px; }
  .im-md ul:last-child, .im-md ol:last-child { margin-bottom: 0; }
  .im-md li { margin-bottom: 3px; }
  .im-md blockquote { border-left: 2px solid var(--ax-colors-border-default); margin: 4px 0; padding: 2px 0 2px 10px; opacity: 0.85; }
  .im-md code { background: rgba(0,0,0,0.06); border-radius: 3px; padding: 1px 5px; font-size: 12px; font-family: monospace; }
  .im-md pre { background: rgba(0,0,0,0.06); border-radius: 6px; padding: 8px 12px; overflow-x: auto; margin: 6px 0; }
  .im-md pre code { background: none; padding: 0; }
  @keyframes nh-step-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes nh-card-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .nh-step { animation: nh-step-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }
  .nh-card { animation: nh-card-in 0.4s cubic-bezier(0.22,1,0.36,1) both; }
`;

// ── Work output HTML — Strategic (direct, outcomes-focused) ──────────────────

const DAILY_BRIEF_STRATEGIC = `
<h2>Daily Brief</h2>
<p class="doc-meta">Friday · Jun 13 · 9:00 AM &nbsp;·&nbsp; Launch in 15 days</p>
<h3>🚦 Status pulse</h3>
<div>
  <div class="status-row"><span style="flex:1"><strong>Product</strong></span><span class="pill pill-green">On track</span><span style="color:var(--ax-colors-fg-tertiary)">Jamie</span></div>
  <div class="status-row"><span style="flex:1"><strong>Marketing</strong></span><span class="pill pill-yellow">Waiting on positioning</span><span style="color:var(--ax-colors-fg-tertiary)">Mia</span></div>
  <div class="status-row"><span style="flex:1"><strong>Sales</strong></span><span class="pill pill-red">Blocked — day 4</span><span style="color:var(--ax-colors-fg-tertiary)">Mary Anne</span></div>
  <div class="status-row"><span style="flex:1"><strong>Engineering</strong></span><span class="pill pill-yellow">4 days behind</span><span style="color:var(--ax-colors-fg-tertiary)">Alex</span></div>
</div>
<h3>🎯 Top 3 today</h3>
<ol>
  <li><strong>Reply to Mia's positioning draft before noon</strong> — Mary Anne can't start the enablement deck without it. Day 4 of this carry.</li>
  <li><strong>Sync with Alex on scope trade-off</strong> — get a clear yes/no on Jun 28 before Thursday's PLT so leadership isn't blindsided.</li>
  <li><strong>Send PLT pre-read by EOD</strong> — three open decisions need framing before the room fills up.</li>
</ol>
<h3>↩️ Carryover</h3>
<div class="status-row"><span style="flex:1">Positioning sign-off</span><span class="pill pill-red">Day 4 carry</span></div>
<div class="status-row"><span style="flex:1">Engineering go/no-go on Jun 28</span><span class="pill pill-yellow">Day 1 carry</span></div>
<h3>📅 Calendar</h3>
<div class="status-row"><span style="flex:1"><strong>Thu Jun 15 · 10:00 AM</strong> &nbsp;PLT Sync</span><span style="color:var(--ax-colors-fg-tertiary);font-size:12px">Come with eng trade-off rec</span></div>
<h3>🚨 Blockers to escalate</h3>
<p><strong>Sales</strong> — Mary Anne needs positioning to start the enablement deck. Stalled 4 days. If not resolved today, sales misses the launch prep window entirely.</p>
<p><strong>Engineering</strong> — Alex is 4 days behind on two critical modules. Jun 28 is at risk. Bring a scope-cut option to PLT Thursday.</p>
`;

const MEETING_PREP_STRATEGIC = `
<h2>Meeting Prep</h2>
<p class="doc-meta">PLT Sync · Thursday Jun 15 · 10:00 AM</p>
<h3>👥 Attendees</h3>
<p>Jamie Chen, Sarah K. (CPO), Marcus R. (CRO), Alex Dev (Eng Lead)</p>
<h3>⚡ Open decisions to resolve</h3>
<ol>
  <li><strong>Launch date</strong> — keep Jun 28 or push to Jul 12?</li>
  <li><strong>Positioning</strong> — approve final messaging framework</li>
  <li><strong>Sales readiness</strong> — confirm enablement timeline and owner</li>
</ol>
<h3>📋 Background</h3>
<p>Q2 product launch is 3 weeks out. Sales enablement is blocked on final positioning — Mary Anne confirmed sales can't start prep without it. Engineering is 4 days behind on 2 critical modules; Alex estimates a Jun 28 ship is risky without a scope cut.</p>
<h3>🗓 Suggested agenda</h3>
<ul>
  <li>Engineering status update <span style="color:var(--ax-colors-fg-tertiary)">(10 min)</span></li>
  <li>Positioning approval <span style="color:var(--ax-colors-fg-tertiary)">(15 min)</span></li>
  <li>Launch date decision <span style="color:var(--ax-colors-fg-tertiary)">(10 min)</span></li>
  <li>Sales readiness check <span style="color:var(--ax-colors-fg-tertiary)">(10 min)</span></li>
</ul>
<h3>❓ Questions to drive</h3>
<ul>
  <li>Is a scope cut on engineering acceptable to ship Jun 28?</li>
  <li>Who owns the final positioning sign-off?</li>
  <li>What's the fallback plan if we miss the date?</li>
</ul>
`;

const WEEKLY_RECAP_STRATEGIC = `
<h2>Weekly Recap</h2>
<p class="doc-meta">Week of Jun 9 – 13</p>
<h3>📝 What happened</h3>
<ul>
  <li>Surfaced sales enablement blocker — positioning not finalized, sales can't prep</li>
  <li>Flagged engineering timeline risk — 4 days behind, launch date at risk</li>
  <li>Set up decision log and 9am daily digest cadence</li>
  <li>Drafted sales enablement brief (first draft ready Fri EOD)</li>
</ul>
<h3>✅ Decisions made</h3>
<div class="decision-row header"><span>Decision</span><span>Owner</span><span>Date</span></div>
<div class="decision-row"><span>Daily digest at 9am</span><span>Jamie + CoS</span><span>Jun 9</span></div>
<div class="decision-row"><span>Enablement brief by Fri EOD</span><span>CoS</span><span>Jun 10</span></div>
<div class="decision-row"><span>Eng milestone tracking</span><span>CoS</span><span>Jun 11</span></div>
<h3>🔄 In flight</h3>
<div class="check-item"><div class="check-box"></div><span>Sales enablement brief <strong>(due Fri EOD)</strong></span></div>
<div class="check-item"><div class="check-box"></div><span>Engineering milestone tracking setup</span></div>
<div class="check-item"><div class="check-box"></div><span>Alignment brief for 4 stakeholders</span></div>
<h3>👀 Next week</h3>
<p>Get launch date locked. Unblock sales with the enablement brief. Reset leadership expectations on engineering timeline before it becomes a crisis.</p>
`;

// ── Work output HTML — Empathetic (warm, people-first) ────────────────────────

const DAILY_BRIEF_EMPATHETIC = `
<h2>Daily Brief</h2>
<p class="doc-meta">Friday · Jun 13 · 9:00 AM &nbsp;·&nbsp; Launch in 15 days</p>
<h3>👥 How the team is doing</h3>
<div>
  <div class="status-row"><span style="flex:1"><strong>Product</strong></span><span class="pill pill-green">Moving well</span><span style="color:var(--ax-colors-fg-tertiary)">Jamie</span></div>
  <div class="status-row"><span style="flex:1"><strong>Marketing</strong></span><span class="pill pill-yellow">Needs a decision</span><span style="color:var(--ax-colors-fg-tertiary)">Mia</span></div>
  <div class="status-row"><span style="flex:1"><strong>Sales</strong></span><span class="pill pill-red">Feeling stuck — day 4</span><span style="color:var(--ax-colors-fg-tertiary)">Mary Anne</span></div>
  <div class="status-row"><span style="flex:1"><strong>Engineering</strong></span><span class="pill pill-yellow">Under pressure</span><span style="color:var(--ax-colors-fg-tertiary)">Alex</span></div>
</div>
<h3>🌟 Where to focus your energy today</h3>
<ol>
  <li><strong>Reach out to Mia on the positioning draft before noon</strong> — she's been waiting 4 days. A quick reply will unlock Mary Anne's team and signal you're paying attention.</li>
  <li><strong>Check in with Alex</strong> — there's real pressure on the engineering team. A 10-min conversation could surface what they actually need to make Jun 28 work.</li>
  <li><strong>Set up the PLT conversation with context</strong> — the team will feel better walking in Thursday knowing leadership has the full picture.</li>
</ol>
<h3>↩️ Things still waiting on a response</h3>
<div class="status-row"><span style="flex:1">Positioning sign-off (Mia waiting)</span><span class="pill pill-red">Day 4</span></div>
<div class="status-row"><span style="flex:1">Engineering date conversation (Alex)</span><span class="pill pill-yellow">Day 1</span></div>
<h3>📅 Your day</h3>
<div class="status-row"><span style="flex:1"><strong>Thu Jun 15 · 10:00 AM</strong> &nbsp;PLT Sync</span><span style="color:var(--ax-colors-fg-tertiary);font-size:12px">Team needs a clear direction</span></div>
<h3>💛 What to be aware of</h3>
<p><strong>Mary Anne's team</strong> is 4 days into a blocker that isn't their fault. They're ready to go the moment positioning is decided — the earlier you close this, the more goodwill it builds.</p>
<p><strong>Alex and the engineering team</strong> are in a hard spot. A scope conversation isn't a failure — it's giving them what they need to succeed. Consider framing it as support, not scrutiny.</p>
`;

const MEETING_PREP_EMPATHETIC = `
<h2>Meeting Prep</h2>
<p class="doc-meta">PLT Sync · Thursday Jun 15 · 10:00 AM</p>
<h3>👥 Who's in the room</h3>
<p>Jamie Chen, Sarah K. (CPO), Marcus R. (CRO), Alex Dev (Eng Lead)</p>
<h3>🌱 What this meeting is really about</h3>
<p>The team needs three things decided so they can move forward. Everyone coming in has been carrying uncertainty — the faster decisions land, the better people feel about the launch.</p>
<h3>⚡ Decisions the team is waiting on</h3>
<ol>
  <li><strong>Launch date</strong> — Alex's team needs a clear answer on scope. Jun 28 or Jul 12?</li>
  <li><strong>Positioning</strong> — Mia has been waiting 4 days. Once approved, Mary Anne's team can finally start moving.</li>
  <li><strong>Sales readiness</strong> — confirm who owns enablement prep so Mary Anne's team knows help is coming.</li>
</ol>
<h3>📋 What each person needs</h3>
<p><strong>Alex (Eng Lead):</strong> Under real pressure, hasn't surfaced the gap yet. Come ready to listen first — create space for him to raise it.</p>
<p><strong>Marcus (CRO):</strong> His team is the most blocked. He'll push for urgency and he's right. Help him feel heard.</p>
<p><strong>Sarah (CPO):</strong> Will want clarity on the scope trade-off. Bring a clear recommendation, not options.</p>
<h3>🗓 Suggested flow</h3>
<ul>
  <li>Acknowledge where we are and what the team needs <span style="color:var(--ax-colors-fg-tertiary)">(5 min)</span></li>
  <li>Engineering update from Alex — hear him out <span style="color:var(--ax-colors-fg-tertiary)">(10 min)</span></li>
  <li>Positioning approval — make the call <span style="color:var(--ax-colors-fg-tertiary)">(10 min)</span></li>
  <li>Launch date decision <span style="color:var(--ax-colors-fg-tertiary)">(10 min)</span></li>
  <li>Sales support plan — confirm owners <span style="color:var(--ax-colors-fg-tertiary)">(10 min)</span></li>
</ul>
<h3>💛 Things worth noting</h3>
<ul>
  <li>Alex may feel hesitant to raise the engineering gap — create space for him</li>
  <li>The room will want to problem-solve — the highest-value thing you can do is make decisions, not discuss them</li>
  <li>Marcus has his team relying on this meeting. A clear outcome will go a long way</li>
</ul>
`;

const WEEKLY_RECAP_EMPATHETIC = `
<h2>Weekly Recap</h2>
<p class="doc-meta">Week of Jun 9 – 13</p>
<h3>🌟 How the week went</h3>
<p>A lot happened quietly this week. The team surfaced real stress early — the sales blocker, the engineering gap — and started building habits that will make next week much smoother.</p>
<h3>👥 People moments worth noting</h3>
<ul>
  <li>Mary Anne's team stepped up under pressure — they're ready to move the moment positioning lands</li>
  <li>Alex shared difficult news about the engineering timeline — that transparency takes trust. Worth acknowledging.</li>
  <li>Mia's positioning draft is ready and waiting — she's done her part</li>
</ul>
<h3>✅ Decisions made</h3>
<div class="decision-row header"><span>Decision</span><span>Owner</span><span>Date</span></div>
<div class="decision-row"><span>Daily digest at 9am</span><span>Jamie + CoS</span><span>Jun 9</span></div>
<div class="decision-row"><span>Enablement brief by Fri EOD</span><span>CoS</span><span>Jun 10</span></div>
<div class="decision-row"><span>Eng milestone tracking</span><span>CoS</span><span>Jun 11</span></div>
<h3>🔄 Still in motion</h3>
<div class="check-item"><div class="check-box"></div><span>Sales enablement brief <strong>(due Fri EOD)</strong></span></div>
<div class="check-item"><div class="check-box"></div><span>Engineering milestone tracking setup</span></div>
<div class="check-item"><div class="check-box"></div><span>4-stakeholder alignment brief</span></div>
<h3>💛 Next week</h3>
<p>The team needs decisions — especially the launch date and positioning. Once those land, the mood will shift. Get those locked early and give people something to move toward.</p>
`;

// ── Work output HTML — Analytic (data-driven, precise) ────────────────────────

const DAILY_BRIEF_ANALYTIC = `
<h2>Daily Brief</h2>
<p class="doc-meta">Friday · Jun 13 · 9:00 AM &nbsp;·&nbsp; Launch T−15d</p>
<h3>🚦 Workstream status</h3>
<div>
  <div class="status-row"><span style="flex:1"><strong>Product</strong></span><span class="pill pill-green">On track</span><span style="color:var(--ax-colors-fg-tertiary)">Jamie</span></div>
  <div class="status-row"><span style="flex:1"><strong>Marketing</strong></span><span class="pill pill-yellow">Blocked — positioning D+4</span><span style="color:var(--ax-colors-fg-tertiary)">Mia</span></div>
  <div class="status-row"><span style="flex:1"><strong>Sales</strong></span><span class="pill pill-red">No enablement — D+4 stall</span><span style="color:var(--ax-colors-fg-tertiary)">Mary Anne</span></div>
  <div class="status-row"><span style="flex:1"><strong>Engineering</strong></span><span class="pill pill-yellow">−4d vs. plan</span><span style="color:var(--ax-colors-fg-tertiary)">Alex</span></div>
</div>
<h3>📊 Risk summary</h3>
<p>2 of 4 workstreams blocked. Sales stall at D+4 = <strong>estimated 2-week lost prep window</strong> if not resolved today. Engineering deficit: −4d on 2 modules = <strong>Jun 28 ship date at risk</strong> without scope cut.</p>
<h3>🎯 Top 3 today (ranked by downstream impact)</h3>
<ol>
  <li><strong>Positioning sign-off → Mia, reply by noon</strong> — unblocks sales (D+4), marketing, and removes #1 launch risk in one action.</li>
  <li><strong>Scope decision → Alex, sync before EOD</strong> — yes/no on Jun 28 scope cut feeds PLT slide. No decision = leadership blindsided Thu.</li>
  <li><strong>PLT pre-read → distribute by EOD</strong> — 3 open decisions require framing before Thu session.</li>
</ol>
<h3>↩️ Carryover tracker</h3>
<div class="status-row"><span style="flex:1">Positioning sign-off</span><span class="pill pill-red">D+4 stall</span></div>
<div class="status-row"><span style="flex:1">Eng go/no-go on Jun 28</span><span class="pill pill-yellow">D+1</span></div>
<h3>📅 Calendar</h3>
<div class="status-row"><span style="flex:1"><strong>Thu Jun 15 · 10:00 AM</strong> &nbsp;PLT Sync</span><span style="color:var(--ax-colors-fg-tertiary);font-size:12px">Requires eng + positioning inputs</span></div>
<h3>🚨 Escalation brief</h3>
<p><strong>Sales (D+4):</strong> Impact = 2-week enablement window lost if not resolved Jun 13. Required action: positioning approval → Mia by noon.</p>
<p><strong>Engineering (−4d):</strong> Impact = Jun 28 date slip without scope cut. Required input: yes/no before PLT Thu.</p>
`;

const MEETING_PREP_ANALYTIC = `
<h2>Meeting Prep</h2>
<p class="doc-meta">PLT Sync · Thursday Jun 15 · 10:00 AM</p>
<h3>👥 Attendees</h3>
<p>Jamie Chen, Sarah K. (CPO), Marcus R. (CRO), Alex Dev (Eng Lead)</p>
<h3>⚡ Required decisions (meeting output)</h3>
<ol>
  <li><strong>Launch date:</strong> Jun 28 (scope cut required) vs. Jul 12 (full scope, −2 weeks). Input needed: eng scope cut estimate from Alex.</li>
  <li><strong>Positioning:</strong> Approve or reject Mia's draft. Binary decision. Downstream: sales enablement D+4 stall.</li>
  <li><strong>Sales readiness:</strong> Confirm owner + deadline for enablement deck. No owner = continued stall.</li>
</ol>
<h3>📊 Decision data</h3>
<p><strong>Launch date:</strong> Eng −4d vs. plan on 2 modules. Jun 28 requires scope cut. Jul 12 = full scope, −2 weeks pipeline prep. Recommendation: cut scope, ship Jun 28.</p>
<p><strong>Positioning:</strong> 4 days without sign-off → sales blocked. Each additional day = 1 day less enablement time. Decision cost: ~30 min of async review.</p>
<p><strong>Sales readiness:</strong> Owner not named today → enablement starts Jun 16 at earliest, leaving 12 days before Jun 28.</p>
<h3>🗓 Optimal agenda</h3>
<ul>
  <li>Engineering status + scope trade-off decision <span style="color:var(--ax-colors-fg-tertiary)">(15 min)</span></li>
  <li>Positioning approval — binary call <span style="color:var(--ax-colors-fg-tertiary)">(10 min)</span></li>
  <li>Launch date lock <span style="color:var(--ax-colors-fg-tertiary)">(5 min — follows eng decision)</span></li>
  <li>Sales readiness: owner + deadline <span style="color:var(--ax-colors-fg-tertiary)">(5 min)</span></li>
</ul>
<h3>❓ Required inputs from Jamie</h3>
<ul>
  <li>Is a scope cut on engineering acceptable to ship Jun 28?</li>
  <li>Who has final positioning sign-off authority?</li>
  <li>What's the sales enablement owner and deadline?</li>
</ul>
`;

const WEEKLY_RECAP_ANALYTIC = `
<h2>Weekly Recap</h2>
<p class="doc-meta">Week of Jun 9 – 13 &nbsp;·&nbsp; Decision velocity: 3/3 logged same day</p>
<h3>📊 Operational metrics</h3>
<p><strong>Decisions logged ≤24h:</strong> 3 of 3 (100%) &nbsp;|&nbsp; <strong>Blockers surfaced:</strong> 2 &nbsp;|&nbsp; <strong>Resolved:</strong> 0 (carryover to wk2) &nbsp;|&nbsp; <strong>Briefs delivered on time:</strong> 5/5</p>
<h3>📝 What happened</h3>
<ul>
  <li>Surfaced sales enablement blocker — positioning not finalized, sales stalled D+4</li>
  <li>Flagged engineering timeline risk — −4d vs. plan, Jun 28 at risk</li>
  <li>Established decision log (schema: decision, owner, deadline, meeting source)</li>
  <li>Set 9am daily brief cadence — wk1 complete, 5/5 delivered on time</li>
  <li>Drafted sales enablement brief — first draft ready Fri EOD</li>
</ul>
<h3>✅ Decisions logged</h3>
<div class="decision-row header"><span>Decision</span><span>Owner</span><span>Date</span></div>
<div class="decision-row"><span>Daily digest at 9am</span><span>Jamie + CoS</span><span>Jun 9</span></div>
<div class="decision-row"><span>Enablement brief by Fri EOD</span><span>CoS</span><span>Jun 10</span></div>
<div class="decision-row"><span>Eng milestone tracking</span><span>CoS</span><span>Jun 11</span></div>
<h3>🔄 In-flight items</h3>
<div class="check-item"><div class="check-box"></div><span>Sales enablement brief — <strong>Fri EOD deadline</strong></span></div>
<div class="check-item"><div class="check-box"></div><span>Engineering milestone tracking setup</span></div>
<div class="check-item"><div class="check-box"></div><span>4-stakeholder alignment brief</span></div>
<h3>📅 Wk2 priority actions</h3>
<p>Resolve 2 carryover blockers (positioning + eng scope decision) before PLT Thu. Both are decision-gated — no execution unblocks until decisions land. ETA: Jun 15 PLT.</p>
`;

// ── Work output cards ────────────────────────────────────────────────────────

const COS_WORK_OUTPUTS_BY_VARIANT = [
  // 0 — Strategic
  [
    { id: "brief", title: "Daily Brief",    coverImg: "/cos-cover-daily-brief.png",   html: DAILY_BRIEF_STRATEGIC },
    { id: "prep",  title: "Meeting Prep",   coverImg: "/cos-cover-meeting-prep.png",  html: MEETING_PREP_STRATEGIC },
    { id: "recap", title: "Weekly Recap",   coverImg: "/cos-cover-weekly-recap.png",  html: WEEKLY_RECAP_STRATEGIC },
  ],
  // 1 — Empathetic
  [
    { id: "brief", title: "Daily Brief",    coverImg: "/cos-cover-daily-brief.png",   html: DAILY_BRIEF_EMPATHETIC },
    { id: "prep",  title: "Meeting Prep",   coverImg: "/cos-cover-meeting-prep.png",  html: MEETING_PREP_EMPATHETIC },
    { id: "recap", title: "Weekly Recap",   coverImg: "/cos-cover-weekly-recap.png",  html: WEEKLY_RECAP_EMPATHETIC },
  ],
  // 2 — Analytic
  [
    { id: "brief", title: "Daily Brief",    coverImg: "/cos-cover-daily-brief.png",   html: DAILY_BRIEF_ANALYTIC },
    { id: "prep",  title: "Meeting Prep",   coverImg: "/cos-cover-meeting-prep.png",  html: MEETING_PREP_ANALYTIC },
    { id: "recap", title: "Weekly Recap",   coverImg: "/cos-cover-weekly-recap.png",  html: WEEKLY_RECAP_ANALYTIC },
  ],
];

// ── New hire daily brief sequence ────────────────────────────────────────────

const WORKING_STEPS = [
  { emoji: "📅", label: "Checking your calendar" },
  { emoji: "💬", label: "Reading unread messages" },
  { emoji: "🔔", label: "Scanning Slack updates" },
  { emoji: "📋", label: "Reviewing open items" },
];

function DailyBriefCard({
  variant,
  onPreview,
}: {
  variant: number;
  onPreview: () => void;
}) {
  const labels = ["Strategic", "Empathetic", "Data-led"];
  const stats =
    variant === 2
      ? "2 workstreams blocked · −4d engineering · 3 decisions pending"
      : "3 meetings · 2 blockers · 4 items need your attention";
  return (
    <div
      className="nh-card"
      style={{
        border: "1px solid var(--ax-colors-border-secondary)",
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--ax-colors-bg-default)",
        maxWidth: "88%",
      }}
    >
      <div style={{ height: 72, overflow: "hidden" }}>
        <Image
          src="/cos-cover-daily-brief.png"
          alt="Daily Brief"
          width={400}
          height={72}
          unoptimized
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
      </div>
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13 }}>📅</span>
          <Text
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--ax-colors-fg-tertiary)",
              letterSpacing: "0.4px",
              textTransform: "uppercase",
            }}
          >
            Daily Brief
          </Text>
          <span style={{ marginLeft: "auto" }}>
            <Badge intent="information">{labels[variant]}</Badge>
          </span>
        </div>
        <p style={{ fontSize: 12, color: "var(--ax-colors-fg-secondary)", lineHeight: 1.5, margin: 0 }}>
          {stats}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            size="sm"
            appearance="primary"
            icon={<IconEye size={13} />}
            iconPosition="start"
            onClick={onPreview}
          >
            Preview
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(isoString: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m} ${ampm}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export function IMChatPanel({
  convId,
  vauName,
  vauRole,
  vauAvatar,
  onClose,
}: {
  convId: string;
  vauName: string;
  vauRole: string;
  vauAvatar: string;
  onClose: () => void;
}) {
  const { messages, profiles, sendCurrent } = useIMData(convId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [newHireStage, setNewHireStage] = useState<"idle" | "working" | "ready">("idle");
  const [workingStep, setWorkingStep] = useState(0);

  const isCoS = convId === "conv-vau-chief-of-staff" || convId === "conv-vau-cos-empathetic" || convId === "conv-vau-cos-analytic";

  // Chat column resize
  const [chatWidth, setChatWidth] = useState(400);
  const chatDragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const handleChatDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    chatDragRef.current = { startX: e.clientX, startWidth: chatWidth };
    const onMove = (ev: MouseEvent) => {
      if (!chatDragRef.current) return;
      const delta = ev.clientX - chatDragRef.current.startX;
      setChatWidth(Math.max(300, Math.min(600, chatDragRef.current.startWidth - delta)));
    };
    const onUp = () => {
      chatDragRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // Preview panel state
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [previewWidth, setPreviewWidth] = useState(420);
  const previewDragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const cosVariant = convId === "conv-vau-cos-empathetic" ? 1 : convId === "conv-vau-cos-analytic" ? 2 : 0;
  const COS_WORK_OUTPUTS = COS_WORK_OUTPUTS_BY_VARIANT[cosVariant];
  const selectedOutput = COS_WORK_OUTPUTS.find((o) => o.id === selectedPreview);

  const handlePreviewDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    previewDragRef.current = { startX: e.clientX, startWidth: previewWidth };
    const onMove = (ev: MouseEvent) => {
      if (!previewDragRef.current) return;
      const delta = ev.clientX - previewDragRef.current.startX;
      setPreviewWidth(Math.max(280, Math.min(640, previewDragRef.current.startWidth - delta)));
    };
    const onUp = () => {
      previewDragRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, newHireStage, workingStep]);

  // Detect first-hire landing and trigger welcome sequence
  useEffect(() => {
    if (!isCoS) return;
    try {
      const flag = sessionStorage.getItem("im-new-hire");
      if (flag === convId) {
        sessionStorage.removeItem("im-new-hire");
        setNewHireStage("working");
        setWorkingStep(1);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Advance working steps then reveal daily brief card
  useEffect(() => {
    if (newHireStage !== "working") return;
    const timers = [
      setTimeout(() => setWorkingStep(2), 700),
      setTimeout(() => setWorkingStep(3), 1400),
      setTimeout(() => setWorkingStep(4), 2100),
      setTimeout(() => setNewHireStage("ready"), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [newHireStage]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setInput("");
    setSending(true);
    await sendCurrent(trimmed);
    setSending(false);
  };

  return (
    <Box display="flex" style={{ height: "100%", width: selectedPreview ? chatWidth + previewWidth : chatWidth }}>
      <style>{PREVIEW_STYLES}</style>

      {/* ── Chat column ── */}
      <Box display="flex" flexDirection="column" style={{ width: chatWidth, flexShrink: 0, height: "100%", position: "relative" }}>
        {/* Chat resize handle — left edge */}
        <div
          onMouseDown={handleChatDragStart}
          style={{ position: "absolute", left: 0, top: 0, width: 4, height: "100%", cursor: "col-resize", zIndex: 10 }}
        />

        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          gap="8"
          px="12"
          borderB="1"
          borderColor="border.secondary"
          style={{ flexShrink: 0, height: 56, background: "var(--ax-colors-bg-default)" }}
        >
          <Button
            appearance="subtle"
            size="sm"
            icon={<IconXmark size={16} />}
            onClick={onClose}
            aria-label="Close"
            style={{ padding: 0, minWidth: "auto", width: 32, height: 32, flexShrink: 0 }}
          />
          <span style={{ position: "relative", width: 28, height: 28, flexShrink: 0, display: "inline-flex" }}>
            <Image
              src={vauAvatar}
              alt={vauName}
              width={28}
              height={28}
              unoptimized
              style={{ borderRadius: "50%", display: "block", objectFit: "cover" }}
            />
            <span style={{
              position: "absolute", bottom: 0, right: 0,
              width: 9, height: 9, borderRadius: "50%",
              background: "#7c5cff",
              border: "1.5px solid var(--ax-colors-bg-default)",
              boxSizing: "border-box",
            }} />
          </span>
          <Box display="flex" alignItems="center" gap="4" flex="1">
            <Text fontWeight="500" fontSize="md" color="fg.default">{vauName}</Text>
            <IconSparkles size={12} style={{ color: "#7c5cff", flexShrink: 0 }} />
          </Box>
        </Box>

        {/* Messages */}
        <Box
          ref={scrollRef as React.RefObject<HTMLDivElement>}
          flex="1"
          px="16"
          py="16"
          display="flex"
          flexDirection="column"
          style={{ overflowY: "auto", background: "var(--ax-colors-bg-default)" }}
        >
          {messages.map((msg) => {
            const isMe = msg.sender_id === "jamie";
            const isVAU = msg.sender_id.startsWith("vau-");
            const avatar = avatarFor(msg.sender_id);
            const name = profiles[msg.sender_id] ?? msg.sender_id;
            const time = formatTime(msg.created_at);

            if (isMe) {
              return (
                <div key={msg.id} style={{ width: "100%", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--ax-colors-fg-tertiary)" }}>{time}</span>
                  </div>
                  <Box display="flex" alignItems="start" gap="8" w="full">
                    <Box display="flex" flexDirection="column" alignItems="end" style={{ flex: 1, minWidth: 0 }}>
                      <div className="im-md" style={{
                        maxWidth: "80%",
                        padding: "8px 12px",
                        borderRadius: 12,
                        backgroundColor: "var(--ax-colors-bg-accent-subtle)",
                        color: "var(--ax-colors-fg-default)",
                        fontSize: 14,
                        lineHeight: "22px",
                        wordBreak: "break-word",
                      }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    </Box>
                    <span style={{ position: "relative", width: 32, height: 32, flexShrink: 0, display: "inline-flex" }}>
                      <Image src="/avatars/avatar-3.png" alt="You" width={32} height={32} unoptimized style={{ borderRadius: "50%", display: "block", objectFit: "cover" }} />
                      <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "1.5px solid var(--ax-colors-bg-default)", boxSizing: "border-box" }} />
                    </span>
                  </Box>
                </div>
              );
            }

            return (
              <div key={msg.id} style={{ width: "100%", marginBottom: 16 }}>
                <Box display="flex" alignItems="center" gap="8" style={{ paddingLeft: 40, marginBottom: 4 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ax-colors-fg-default)" }}>{isVAU ? vauName : name}</span>
                    {isVAU && <IconSparkles size={12} style={{ color: "#7c5cff", flexShrink: 0 }} />}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--ax-colors-fg-tertiary)" }}>{time}</span>
                </Box>
                <Box display="flex" alignItems="start" gap="8" w="full">
                  <span style={{ position: "relative", width: 32, height: 32, flexShrink: 0, display: "inline-flex" }}>
                    <Image src={isVAU ? vauAvatar : (avatar ?? vauAvatar)} alt={name} width={32} height={32} unoptimized style={{ borderRadius: "50%", display: "block", objectFit: "cover" }} />
                    {isVAU && (
                      <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#7c5cff", border: "1.5px solid var(--ax-colors-bg-default)", boxSizing: "border-box" }} />
                    )}
                  </span>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <div className="im-md" style={{
                      padding: "8px 12px",
                      borderRadius: 12,
                      backgroundColor: "var(--ax-colors-bg-secondary)",
                      color: "var(--ax-colors-fg-default)",
                      fontSize: 14,
                      lineHeight: "22px",
                      wordBreak: "break-word",
                    }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  </Box>
                </Box>
              </div>
            );
          })}

          {sending && (
            <div style={{ width: "100%", marginBottom: 16 }}>
              <Box display="flex" alignItems="center" gap="8" style={{ paddingLeft: 40, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ax-colors-fg-default)" }}>{vauName}</span>
                <IconSparkles size={12} style={{ color: "#7c5cff", flexShrink: 0 }} />
              </Box>
              <Box display="flex" alignItems="start" gap="8" w="full">
                <span style={{ position: "relative", width: 32, height: 32, flexShrink: 0, display: "inline-flex" }}>
                  <Image src={vauAvatar} alt={vauName} width={32} height={32} unoptimized style={{ borderRadius: "50%", display: "block", objectFit: "cover" }} />
                  <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#7c5cff", border: "1.5px solid var(--ax-colors-bg-default)", boxSizing: "border-box" }} />
                </span>
                <div style={{ padding: "8px 12px", borderRadius: 12, backgroundColor: "var(--ax-colors-bg-secondary)", fontSize: 14, color: "var(--ax-colors-fg-tertiary)", lineHeight: "22px" }}>
                  Typing…
                </div>
              </Box>
            </div>
          )}

          {/* New hire daily brief sequence */}
          {newHireStage !== "idle" && isCoS && (
            <div style={{ width: "100%", marginBottom: 16 }}>
              <Box display="flex" alignItems="center" gap="8" style={{ paddingLeft: 40, marginBottom: 4 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ax-colors-fg-default)" }}>{vauName}</span>
                  <IconSparkles size={12} style={{ color: "#7c5cff", flexShrink: 0 }} />
                </span>
              </Box>
              <Box display="flex" alignItems="start" gap="8">
                <span style={{ position: "relative", width: 32, height: 32, flexShrink: 0, display: "inline-flex" }}>
                  <Image src={vauAvatar} alt={vauName} width={32} height={32} unoptimized style={{ borderRadius: "50%", display: "block", objectFit: "cover" }} />
                  <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#7c5cff", border: "1.5px solid var(--ax-colors-bg-default)", boxSizing: "border-box" }} />
                </span>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  {newHireStage === "working" ? (
                    <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--ax-colors-bg-secondary)", fontSize: 14, lineHeight: "22px" }}>
                      <div style={{ fontSize: 13, color: "var(--ax-colors-fg-secondary)", marginBottom: 10 }}>
                        On it — pulling your daily brief together.
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {WORKING_STEPS.map((step, i) =>
                          i < workingStep ? (
                            <div key={i} className="nh-step" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 14 }}>{step.emoji}</span>
                              <span style={{ fontSize: 13, color: "var(--ax-colors-fg-secondary)" }}>{step.label}</span>
                              {i < workingStep - 1 ? (
                                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ax-colors-fg-tertiary)" }}>✓</span>
                              ) : (
                                <span style={{ marginLeft: "auto", fontSize: 11, color: "#7c5cff" }}>…</span>
                              )}
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ padding: "8px 12px", borderRadius: 12, background: "var(--ax-colors-bg-secondary)", fontSize: 14, color: "var(--ax-colors-fg-default)", lineHeight: "22px" }}>
                        Looks like a heavy day today — your daily brief is ready.
                      </div>
                      <DailyBriefCard variant={cosVariant} onPreview={() => setSelectedPreview("brief")} />
                    </div>
                  )}
                </Box>
              </Box>
            </div>
          )}
        </Box>

        {/* Work output preview cards (CoS only) */}
        {isCoS && (
          <Box
            px="16"
            pt="12"
            pb="12"
            borderT="1"
            borderColor="border.secondary"
            style={{ flexShrink: 0, background: "var(--ax-colors-bg-default)" }}
          >
            <Text
              fontSize="xs"
              color="fg.tertiary"
              fontWeight="500"
              style={{ textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}
            >
              Sample work outputs
            </Text>
            <Box display="flex" gap="8">
              {COS_WORK_OUTPUTS.map((wo) => {
                const isActive = selectedPreview === wo.id;
                return (
                  <Box
                    key={wo.id}
                    display="flex"
                    flexDirection="column"
                    rounded="lg"
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      border: `1.5px solid ${isActive ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-secondary)"}`,
                      cursor: "pointer",
                      background: "var(--ax-colors-bg-default)",
                      transition: "border-color 0.15s",
                    }}
                    onClick={() => setSelectedPreview(isActive ? null : wo.id)}
                  >
                    {/* Cover */}
                    <div style={{ height: 88, overflow: "hidden", flexShrink: 0 }}>
                      <Image
                        src={wo.coverImg}
                        alt={wo.title}
                        width={200}
                        height={88}
                        unoptimized
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                      />
                    </div>
                    {/* Below cover */}
                    <Box px="8" pt="8" pb="8">
                      <Text fontSize="sm" fontWeight="600" color="fg.default" style={{ display: "block", marginBottom: 4 }}>
                        {wo.title}
                      </Text>
                      <Box display="flex" alignItems="center" gap="4">
                        <IconEye size={11} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
                        <Text fontSize="xs" color="fg.tertiary" fontWeight="500" style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>
                          Preview
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Input */}
        <Box
          px="16"
          py="12"
          borderT="1"
          borderColor="border.secondary"
          display="flex"
          gap="8"
          alignItems="center"
          style={{ flexShrink: 0, background: "var(--ax-colors-bg-default)" }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder={`Message ${vauName}…`}
            style={{
              flex: 1,
              padding: "8px 14px",
              borderRadius: 20,
              border: "1px solid var(--ax-colors-border-secondary)",
              fontSize: 14,
              outline: "none",
              background: "transparent",
              color: "var(--ax-colors-fg-default)",
            }}
          />
          <Button
            appearance="primary"
            size="sm"
            icon={<IconPaperPlaneTop size={14} />}
            disabled={!input.trim() || sending}
            onClick={() => void handleSend()}
            aria-label="Send"
          />
        </Box>
      </Box>

      {/* ── Preview column ── */}
      {selectedOutput && (
        <Box
          display="flex"
          flexDirection="column"
          style={{
            width: previewWidth,
            flexShrink: 0,
            height: "100%",
            borderLeft: "1px solid var(--ax-colors-border-secondary)",
            background: "var(--ax-colors-bg-default)",
            position: "relative",
            animation: "chatSlideIn 0.25s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {/* Drag handle */}
          <div
            onMouseDown={handlePreviewDragStart}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 4,
              height: "100%",
              cursor: "col-resize",
              zIndex: 10,
            }}
          />

          {/* Preview header */}
          <Box style={{ flexShrink: 0 }}>
            {/* Cover banner */}
            <div style={{ height: 120, overflow: "hidden", position: "relative" }}>
              <Image
                src={selectedOutput.coverImg}
                alt={selectedOutput.title}
                width={640}
                height={120}
                unoptimized
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
              />
              {/* Top bar with actions overlaid on cover */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", padding: "8px 8px", gap: 4 }}>
                <button
                  onClick={() => setSelectedPreview(null)}
                  aria-label="Close preview"
                  style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backdropFilter: "blur(4px)" }}
                >
                  <IconXmark size={16} style={{ color: "var(--ax-colors-fg-default)" }} />
                </button>
                <div style={{ flex: 1 }} />
                <button
                  aria-label="Open full view"
                  style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backdropFilter: "blur(4px)" }}
                >
                  <IconArrowUpRightFromSquare size={14} style={{ color: "var(--ax-colors-fg-default)" }} />
                </button>
              </div>
            </div>
          </Box>

          {/* Preview content */}
          <div
            className="cos-doc"
            style={{ flex: 1, overflowY: "auto", padding: "24px 24px" }}
            dangerouslySetInnerHTML={{ __html: selectedOutput.html }}
          />
        </Box>
      )}
    </Box>
  );
}
