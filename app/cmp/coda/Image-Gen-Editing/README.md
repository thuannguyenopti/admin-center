# Q2 Epics & Features

*Fetched from Coda: Opal Platform → Q2 Epics & Features*

---

Other

- EU App Hosting — April deadline
- KEVIN ADD: Apps SDK for MSFT (Imran special)
- KEVIN ADD: RDE

ARE

- notifications
- service ticket creation
- sensitive tools
- Sherlock + watson updates
- Refactor Evaluation Prompt for AI Judge

HITL / AITL

- Human in the loop / agent in the loop system
- Easy way to add CMP webhooks into Opal
  - e.g., Assign step to agent
- Review all agent activities
- VAU (virtual agent user)

Chat

- baseline chat experience better !!!!
  - improve speed?
  - stream more activity in chat so user perception is Opal is working
  - have a better animation for thinking — loading icon for Opal if chat taking long
- forking chat if it gets too long
- auto compact strategies for chat 
- make stop chat button more immediate to match user expectation
- pin chats
- bring opal chat into agents, instructions, and tools pages
- sort chat by latest modified without refresh required
- share chat threads

Instructions

- code execution environment (python)
  - add system instructions for Claude skills (like ppt generation)
- add files to instructions
- instruction onboarding
- personal instructions ux
- link instructions to external source of truth
- Visual brand guidelines
- Hierarchy for instructions (e.g. file structure like Claude, link instructions to others)
- KEVIN ADD: tools for adding stuff to instructions from agent

Canvas

- Artifacts tab to view all canvases 
- Share canvas with someone in your org or everyone in your org
- Kevin add: what happened to Canvas → git → repo → programmatic access

Projects / Teams

- scope items to a project or team
  - instructions
  - agents
  - canvas

Tools

- Tools lookup (remove 128 max limit)
- Auto-sync tool registries
- Add logos to tools SDK
- Tools installation along with instructions (e.g. Tools that work better with instructions like Salesforce)
- Show tiles for Remote MCP providers in connectors tab
  - Only Admin role can click "Install" at first to set up, locked to user
  - Once admin enables it, then it should show as unlocked for users to connect
- Show tiles for OCP tools in connectors tab
  - same as above
- Experience if customer installs an agent and tool is not installed
- Experience if customer invokes an agent or prompt but not connected to a tool — ask to connect from Chat
- Allow customers to add their own remote MCP
- Alerting & error notifications for external tool creators (maybe via OCP)
- Tie tools to product registries (only enable tools if you have those products)

specialized agents

- Agent Builder onboarding to learn how to build specialized agent 
- add value field to agent (for ROI reporting)
- agent creation assistance
- show credits consumed in agent execution logs
- Import agent via A2A

workflow agents

- improve error messages
- webhook trigger ux - Pei Chien let's sync on the design
- Workflow agents import / export - need to discuss technical details Zawad  
- show credits consumed in agent execution logs
- For workflows triggered from chat, show input parameters - need to discuss technical details Zawad Abdullah  
- Create / edit workflow agent should take you to workflow builder directly -  
- workflow within workflow agent
- parameter generation log
- export execution logs for workflows
- Add instance selection to workflow triggers -  
- Enable workflow nodes to "snap to grid" & show leading lines for easier management and visuals  - Pei Chien working on some updated design, we can share when ready!
- Workflow monitoring & activity logs - updated designs when a workflow is actively running and make it easier to go through logs / activity trace
- Version history for workflow agents
- Undo + redo for workflow agents
- Workflow agent "draft" vs. "publish" mode - need to work on design
- Drag agents already in workflow canvas into a loop -  
- test run specialized agent within workflow (test run side panel)
- support attachment on email trigger
- Agent Builder onboarding to learn how to build workflow agents

Image / Video

- Update image gen tools & use cases
- Update video gen tools & use cases

Agent Onboarding & Adoption

- Agent onboarding
  - Starter kits
  - OOTB agents
  - Specialized agents
  - Workflow agents
- Admin & user in-app onboarding - Alex Wald
  - OOTB agents (Delivery)
  - Instructions (Delivery)
  - OCP Tools (Delivery)
  - Build your own agent (discovery) 
- Opal Home
- Agent Directory 
  - Agent details preview
  - Agent & tool config (e.g., setting up GA4)
  - More sections? For now it’s only visible for Agent Builders & Admins, since users will get the new homepage
- Chat
  - Recommended agents

App Companion 

- Platform product

Adaptive Blocks

- Tool adaptive blocks
- Agent adaptive blocks
- GUI builder
- Headless compatibility
- Output canvas adaptive blocks? 

RAG

- External data sources (google docs, one drive, etc)
- Opti-product connectors
- Eval and improve false negatives and false positives
- Eval and improve retrieval ranking
- Add referenced material to response (link)
- reduce latency of RAG

Memory

- Agent memory (recall tools that worked, avoid tools that error out)
- Improve memory capture and retrieval quality
- Respond with "references to relevant chats"

Evals

- automate run of samples with complex historical user queries (attachments + agents) in an instance with access to user instance assets/tools etc
- multi-modal evaluation metrics for complex tasks
- KEVIN add: conditional branching based on evals, e.g. if score > x, do A, otherwise B
- KEVIN add: let me access eval scores programmatically

Biruni

- data analytics snippet / engine

Mercator

- chat mode on customer front-end

Aldus

- customized landing page generation
- lightweight CMS

Analytics Requests

- Burn down some of the requests on  

Other

- new models
- opal on mobile app
- benchmarking
- fine-tuning models
- speech to text  / voice input via mic button

