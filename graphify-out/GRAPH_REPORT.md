# Graph Report - VanguardSolutions  (2026-09-28)

## Corpus Check
- 165 files · ~93,653 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 263 nodes · 308 edges · 40 communities (23 shown, 17 thin omitted)
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Firebase AI Logic Web
- Genkit Dart Plugins
- App Hosting CLI
- Data Connect Guides
- Sitio: main.js
- Sitio: footer y productos
- Sitio: contacto y FAQ
- Firestore Enterprise
- App Rock: pantallas 1
- App Rock: pantallas 2
- Sitio: home y hero
- Data Connect Reference
- Sitio: header y servicios
- Genkit JS y Dart
- Firestore Data Model
- App Hosting Config
- Firebase Agent Setup
- Genkit JS Ejemplos
- Sitio: proyectos
- Firebase Auth y Rules
- Sitio: blogs
- Firebase Hosting
- Firestore Security Rules
- App Hosting Basics
- Firebase MCP Server
- Firestore Web SDK
- Genkit Anthropic/OpenAI
- Hosting Deploy
- Pagina 404
- Genkit Chrome
- Genkit Google GenAI
- Genkit MCP
- Genkit Middleware
- Genkit Shelf
- Firestore Ent Web SDK
- Firestore Std Indexes
- Firestore Std Provisioning
- Firestore Std Web SDK
- Hosting Config Ref
- Site Verification

## God Nodes (most connected - your core abstractions)
1. `Firebase Basics Skill` - 19 edges
2. `Firebase Basics Skill` - 13 edges
3. `Genkit Dart Skill` - 12 edges
4. `initForm()` - 8 edges
5. `initCarousel()` - 8 edges
6. `Genkit JS Skill` - 8 edges
7. `Firebase Data Connect Skill` - 8 edges
8. `Firebase Data Connect Skill` - 8 edges
9. `init()` - 7 edges
10. `Firestore Enterprise Native Mode Skill` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Data Connect Templates` --shares_data_with--> `@auth Directive and Access Levels`  [INFERRED]
  .claude/skills/firebase-data-connect/templates.md → .agents/skills/firebase-data-connect/reference/security.md
- `Genkit Dart Skill` --semantically_similar_to--> `Genkit JS Skill`  [INFERRED] [semantically similar]
  .agents/skills/developing-genkit-dart/SKILL.md → .agents/skills/developing-genkit-js/SKILL.md
- `Cursor Setup` --references--> `Firebase MCP Server`  [INFERRED]
  .agents/skills/firebase-basics/references/setup-cursor.md → .agents/skills/firebase-basics/references/local-env-setup.md
- `GitHub Copilot Setup` --references--> `Firebase MCP Server`  [INFERRED]
  .agents/skills/firebase-basics/references/setup-github_copilot.md → .agents/skills/firebase-basics/references/local-env-setup.md
- `Firebase Data Connect Skill` --references--> `Data Connect Security Reference`  [EXTRACTED]
  .agents/skills/firebase-data-connect/SKILL.md → .agents/skills/firebase-data-connect/reference/security.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Genkit Dart Model Provider Plugins** — _agents_skills_developing_genkit_dart_references_genkit_anthropic, _agents_skills_developing_genkit_dart_references_genkit_firebase_ai, _agents_skills_developing_genkit_dart_references_genkit_google_genai, _agents_skills_developing_genkit_dart_references_genkit_openai, _agents_skills_developing_genkit_dart_references_genkit_chrome [INFERRED 0.85]
- **Per-agent Firebase setup guides** — agents_skills_firebase_basics_references_setup_antigravity, agents_skills_firebase_basics_references_setup_claude_code, agents_skills_firebase_basics_references_setup_cursor, agents_skills_firebase_basics_references_setup_gemini_cli, agents_skills_firebase_basics_references_setup_github_copilot [EXTRACTED 1.00]
- **Data Connect development workflow (schema, operations, security, SDKs)** — agents_skills_firebase_data_connect_reference_schema, agents_skills_firebase_data_connect_reference_operations, agents_skills_firebase_data_connect_reference_security, agents_skills_firebase_data_connect_reference_sdks [EXTRACTED 1.00]
- **Genkit Dart model provider plugins** — claude_skills_developing_genkit_dart_references_genkit_anthropic, claude_skills_developing_genkit_dart_references_genkit_openai, claude_skills_developing_genkit_dart_references_genkit_google_genai, claude_skills_developing_genkit_dart_references_genkit_firebase_ai [INFERRED 0.85]
- **Per-agent Firebase setup guides** — claude_skills_firebase_basics_references_setup_antigravity, claude_skills_firebase_basics_references_setup_claude_code, claude_skills_firebase_basics_references_setup_cursor, claude_skills_firebase_basics_references_setup_gemini_cli, claude_skills_firebase_basics_references_setup_github_copilot, claude_skills_firebase_basics_references_setup_other_agents [INFERRED 0.85]
- **Data Connect reference documents** — _claude_skills_firebase_data_connect_reference_schema, _claude_skills_firebase_data_connect_reference_operations, _claude_skills_firebase_data_connect_reference_security, _claude_skills_firebase_data_connect_reference_sdks, _claude_skills_firebase_data_connect_reference_config [EXTRACTED 1.00]
- **Per-agent Firebase setup guides** — _claude_skills_firebase_basics_references_setup_claude_code, _claude_skills_firebase_basics_references_setup_cursor, _claude_skills_firebase_basics_references_setup_gemini_cli, _claude_skills_firebase_basics_references_setup_github_copilot, _claude_skills_firebase_basics_references_setup_other_agents [EXTRACTED 1.00]
- **Site pages sharing header and footer components** — home_home, services_services, products_products, proyects_proyects, contact_contact, blogs_blogs [INFERRED 0.85]
- **ROCK Restaurante app screens** — assets_proyects_apprestaurante_cart, assets_proyects_apprestaurante_cuenta, assets_proyects_apprestaurante_direccion, assets_proyects_apprestaurante_home, assets_proyects_apprestaurante_login [EXTRACTED 1.00]
- **Menu to cart to payment to card flow** — assets_proyects_apprestaurante_menu, assets_proyects_apprestaurante_pagos, assets_proyects_apprestaurante_tarjeta [INFERRED 0.85]

## Communities (40 total, 17 thin omitted)

### Community 0 - "Firebase AI Logic Web"
Cohesion: 0.10
Nodes (28): Firebase AI Logic Web Usage Patterns, getAI/getGenerativeModel initialization, Firebase AI Logic Skill, Gemini Developer API, Vertex AI Gemini API, Firebase Auth Web SDK, Auth in Security Rules, request.auth (+20 more)

### Community 1 - "Genkit Dart Plugins"
Cohesion: 0.12
Nodes (22): Genkit Dart Core Reference, genkit_anthropic Plugin, genkit_chrome Plugin, genkit_firebase_ai Plugin, Genkit Flow, genkit_google_genai Plugin, genkit_mcp, genkit_middleware (+14 more)

### Community 2 - "App Hosting CLI"
Cohesion: 0.15
Nodes (20): App Hosting CLI Commands, apphosting.yaml Configuration, App Hosting Emulation, Firebase CLI Guide, Firebase Project Creation, Firebase Service Init, Local Environment Setup, Refresh Antigravity (+12 more)

### Community 3 - "Data Connect Guides"
Cohesion: 0.15
Nodes (15): Firebase Web Setup Guide, Data Connect Examples, Data Connect Advanced Features Reference, Data Connect Configuration Reference, Data Connect Operations Reference, Data Connect Schema Reference, Data Connect SDK Reference, Data Connect Security Reference (+7 more)

### Community 4 - "Sitio: main.js"
Cohesion: 0.20
Nodes (10): animateCounter(), detectActivePage(), hideLoader(), init(), initCounters(), initParticles(), initScrollProgress(), initScrollReveal() (+2 more)

### Community 5 - "Sitio: footer y productos"
Cohesion: 0.24
Nodes (10): getPathDepthFooter(), initFooter(), loadFooter(), initCarousel(), buildDots(), clampIndex(), getCardWidth(), goTo() (+2 more)

### Community 6 - "Sitio: contacto y FAQ"
Cohesion: 0.33
Nodes (11): getEmailJS(), initContact(), initFaq(), initFloatingLabels(), initForm(), initWhatsAppButton(), serviceLabel(), showError() (+3 more)

### Community 7 - "Firestore Enterprise"
Cohesion: 0.22
Nodes (11): Firebase Web Setup Guide, Firestore Enterprise Data Model, Firestore Enterprise Indexes, Firestore Enterprise Provisioning, Firestore Enterprise Python SDK Usage, Firestore Enterprise Security Rules, Firestore Enterprise Web SDK Usage, Firestore Enterprise Native Mode Skill (+3 more)

### Community 8 - "App Rock: pantallas 1"
Cohesion: 0.25
Nodes (11): Cart Screen (Carrito) - Rock Restaurante app, Account Screen (Mi cuenta) - Rock Restaurante app, Address Screen (Mi direccion) with map, Home Screen (Inicio) - Lo mas pedido, Login Screen - ROCK Restaurante, ROCK Restaurante mobile app, Bottom navigation (Inicio, Menu, Carrito, Cuenta), Dark theme with red glowing accents design (+3 more)

### Community 9 - "App Rock: pantallas 2"
Cohesion: 0.24
Nodes (10): Menu screen (restaurant app), Confirm order / payment method screen, My reviews screen, Make reservation screen, Card payment data screen, Bottom nav: Inicio, Menu, Carrito, Cuenta, Upcoming rock events tied to reservations by zone and time, PayPal payment in USD with BCCR exchange rate (+2 more)

### Community 10 - "Sitio: home y hero"
Cohesion: 0.29
Nodes (6): initGlitch(), initHeroCanvas(), initHome(), initRevealDelay(), initTyping(), Index Redirect and Firebase Init

### Community 11 - "Data Connect Reference"
Cohesion: 0.25
Nodes (9): Data Connect Examples, Data Connect Advanced Reference, Data Connect Configuration Reference, Data Connect Operations Reference, Data Connect Schema Reference, Data Connect SDKs Reference, Firebase Data Connect Skill, Data Connect Templates (+1 more)

### Community 12 - "Sitio: header y servicios"
Cohesion: 0.36
Nodes (7): adjustPaths(), getPathDepth(), initHeader(), loadHeader(), addCardRevealDelays(), addCardTiltEffect(), initServices()

### Community 13 - "Genkit JS y Dart"
Cohesion: 0.25
Nodes (8): Genkit Dart Core, genkit_firebase_ai Plugin, Schemantic Schema Library, Developing Genkit Dart Skill, Genkit JS Best Practices, Genkit JS Common Errors, Genkit JS Docs and CLI, Developing Genkit JS Skill

### Community 14 - "Firestore Data Model"
Cohesion: 0.33
Nodes (7): Firestore Data Model Reference, Firestore Indexes Reference, Provisioning Firestore Enterprise, Firestore Python SDK Usage, Firestore Enterprise Native Mode Skill, Firestore documents, collections, subcollections, Firestore Enterprise indexes (no default indexes, sparse, unique)

### Community 15 - "App Hosting Config"
Cohesion: 0.38
Nodes (7): App Hosting CLI Commands, App Hosting Secrets (Cloud Secret Manager), App Hosting Configuration, apphosting.yaml, App Hosting Emulation, apphosting.emulator.yaml, Firebase App Hosting Basics Skill

### Community 16 - "Firebase Agent Setup"
Cohesion: 0.33
Nodes (6): Claude Code Firebase Setup, Cursor Firebase Setup, Gemini CLI Firebase Setup, GitHub Copilot Firebase Setup, Other Agents Firebase Setup, Firebase agent skills and MCP server installation

### Community 17 - "Genkit JS Ejemplos"
Cohesion: 0.33
Nodes (6): Genkit Examples, Google Search Grounding, Genkit Streaming generateStream, Genkit Structured Output (zod schema), Genkit JS Setup, ai/genkit.ts Genkit config

### Community 18 - "Sitio: proyectos"
Cohesion: 0.53
Nodes (5): initProyects(), initScreenCarousel(), buildDots(), goTo(), render()

### Community 19 - "Firebase Auth y Rules"
Cohesion: 0.60
Nodes (5): Firebase Auth Web SDK, Auth in Security Rules, Firebase Auth Basics Skill, Firebase Authentication, Firebase Security Rules

### Community 20 - "Sitio: blogs"
Cohesion: 0.60
Nodes (4): addRevealDelays(), closeArticle(), initBlogs(), openArticle()

### Community 21 - "Firebase Hosting"
Cohesion: 0.67
Nodes (3): Firebase Hosting Configuration, Firebase Hosting Deploying, Firebase Hosting Basics Skill

### Community 22 - "Firestore Security Rules"
Cohesion: 0.67
Nodes (3): Firestore Enterprise Security Rules Reference, Firestore Standard Security Rules Reference, Firestore Standard Skill

## Knowledge Gaps
- **83 isolated node(s):** `genkit_anthropic Plugin`, `genkit_chrome Plugin`, `genkit_mcp`, `genkit_middleware`, `genkit_openai Plugin` (+78 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 93 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Firebase Basics Skill` connect `Firebase AI Logic Web` to `App Hosting Config`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `Firebase App Hosting Basics Skill` connect `App Hosting Config` to `Firebase AI Logic Web`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Firebase Basics Skill` (e.g. with `Firebase AI Logic Skill` and `Firebase App Hosting Basics Skill`) actually correct?**
  _`Firebase Basics Skill` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `genkit_anthropic Plugin`, `genkit_chrome Plugin`, `genkit_mcp` to the rest of the system?**
  _83 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Firebase AI Logic Web` be split into smaller, more focused modules?**
  _Cohesion score 0.10052910052910052 - nodes in this community are weakly interconnected._
- **Should `Genkit Dart Plugins` be split into smaller, more focused modules?**
  _Cohesion score 0.11688311688311688 - nodes in this community are weakly interconnected._
- **Should `App Hosting CLI` be split into smaller, more focused modules?**
  _Cohesion score 0.14736842105263157 - nodes in this community are weakly interconnected._