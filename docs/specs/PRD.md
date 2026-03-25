# PRD — Cyber Wiki

## Table of Contents

1. [1. Overview](#1-overview)
   - [1.1 Purpose](#11-purpose)
   - [1.2 Background / Problem Statement](#12-background--problem-statement)
   - [1.3 Goals (Business Outcomes)](#13-goals-business-outcomes)
   - [1.4 Glossary](#14-glossary)
2. [2. Actors](#2-actors)
   - [2.1 Human Actors](#21-human-actors)
   - [2.2 System Actors](#22-system-actors)
3. [3. Operational Concept & Environment](#3-operational-concept--environment)
   - [3.1 Module-Specific Environment Constraints](#31-module-specific-environment-constraints)
4. [4. Scope](#4-scope)
   - [4.1 In Scope](#41-in-scope)
   - [4.2 Out of Scope](#42-out-of-scope)
5. [5. Functional Requirements](#5-functional-requirements)
   - [5.1 Repository & Space Navigation](#51-repository--space-navigation)
   - [5.2 Live Document Editing](#52-live-document-editing)
   - [5.3 Contextual Inline Comments](#53-contextual-inline-comments)
   - [5.4 Change Review Workflow](#54-change-review-workflow)
   - [5.5 Rich Content Previews](#55-rich-content-previews)
   - [5.6 Document Validation](#56-document-validation)
   - [5.7 Git Synchronisation](#57-git-synchronisation)
   - [5.8 Search](#58-search)
   - [5.9 JIRA Integration](#59-jira-integration)
   - [5.10 Access Control](#510-access-control)
6. [6. Non-Functional Requirements](#6-non-functional-requirements)
   - [6.1 Module-Specific NFRs](#61-module-specific-nfrs)
   - [6.2 NFR Exclusions](#62-nfr-exclusions)
7. [7. Public Library Interfaces](#7-public-library-interfaces)
   - [7.1 Public API Surface](#71-public-api-surface)
   - [7.2 External Integration Contracts](#72-external-integration-contracts)
8. [8. Use Cases](#8-use-cases)
9. [9. Acceptance Criteria](#9-acceptance-criteria)
10. [10. Dependencies](#10-dependencies)
11. [11. Assumptions](#11-assumptions)
12. [12. Risks](#12-risks)
13. [13. Open Questions](#13-open-questions)

---

## 1. Overview

### 1.1 Purpose

Cyber Wiki is a Git-native documentation and collaboration platform that brings a GitHub-like experience to engineering teams who need more than a code host — structured doc authoring, rich previews, context-aware commenting, semantic search, smart validation, and deep integrations with project-tracking tools. It treats Git as the single source of truth while removing the barriers that prevent non-engineers from participating in documentation workflows.

The platform bridges the gap between raw Git tooling and heavyweight wiki/knowledge-base products: it is fast, version-controlled, validation-aware, and extensible.

### 1.2 Background / Problem Statement

Engineering teams already store their most important content — architecture decisions, API specs, runbooks, design docs — inside Git repositories. However, the available tooling forces a painful trade-off: either use a plain Git host (GitHub/GitLab) and accept a minimal editing and review experience, or use a separate wiki product (Confluence, Notion) and accept that the content drifts away from the codebase.

The result is fragmented knowledge: stale wiki pages that no longer reflect the code, review comments that get lost after merge, JIRA tickets that must be opened in a separate tab just to read the status, and broken links that nobody notices until it is too late.

**Target Users:**

- Engineers and architects authoring and reviewing technical documentation
- Product managers and designers who need to comment on specs without a Git client
- Team leads who need to track document state, pending reviews, and JIRA alignment
- Automation and CI pipelines that need to validate document conformance

**Key Problems Solved:**

- Fragmentation between source code and documentation
- High friction for non-engineers to contribute to or comment on technical docs
- Lack of in-context JIRA visibility — readers must context-switch to find ticket status
- No enforcement mechanism for document quality or link integrity
- Semantic search is unavailable across Git-hosted documentation
- Advanced editing capabilities - WYSIWYG for tables, heading, styles
- Advanced documents and code content presentation capabilities - diagrams, tables, code snippets, xls tables or ppt or pdf preview, etc
- Automated navigation across git source files and documents - table of contents, parent/child pages, references to other repositories or files

### 1.3 Goals (Business Outcomes)

**Success Criteria:**

- Editing and committing a document takes under 60 seconds for an authenticated Editor (Baseline: no baseline — new product; Target: v1.0 — Q3 2026)
- Broken internal links are surfaced before a document is saved (Baseline: not possible today; Target: v1.0 — Q3 2026)
- Semantic search returns relevant results across 10,000 documents in under 2 seconds (Baseline: N/A; Target: v1.0 — Q3 2026)
- JIRA issue status is visible inline without leaving the document (Baseline: not possible today; Target: v1.0 — Q3 2026)
  - It must be possible to configure what JIRA fields to be displayed, such as fix version, assignee, title, etc
  - It must be possible to show the whole JIRA items list with selected fields

**Capabilities:**

- Browse, author, and review Git-backed documents from a web UI
- Leave context-aware inline comments that survive content changes
- Preview rich content: Markdown, sequence diagrams, draw.io diagrams, tables
- Validate documents against configurable rules before saving
- Synchronise document changes bidirectionally with Git repositories
- Surface JIRA issue data (status, assignee, priority) inline in documents
- Search documentation semantically using AI-powered embeddings
- Edit Markdown with WYSIWYG editor — headings, styles, tables, links
- Global documentation space system with configurable Git repositories attached and configurable lists of files and folders to be discoverable
- Integration with notification systems for document creation and updates — send emails, send notifications to Teams/Slack
- Integrated chat where users can ask questions, review documents, and collaborate
- Integrated AI assistant for inline document editing that can fix misprints, suggest better wording, and improve content
- Support integration with local LLM models for misprint detection and content enhancement

### 1.4 Glossary

| Term | Definition |
|------|------------|
| Space | A top-level organisational unit that groups related documents, optionally linked to a Git repository |
| Document | A file (typically Markdown) stored within a Space, version-controlled through Git |
| Inline Comment | An annotation anchored to a line range within a Document, visible to all readers |
| Pending Change | A proposed edit submitted by a Commenter for review and approval by an Editor or Admin |
| Change Record | An immutable audit entry created each time a Document is saved or synced |
| Git Sync | Bidirectional synchronisation between a Space and a Git repository |
| Validator | A configurable rule that checks a Document before it can be saved |
| JIRA Badge | An inline widget rendered from a `[JIRA:KEY-123]` reference that shows live issue data |
| Semantic Search | AI-powered full-text search using vector embeddings for relevance-ranked results |

---

## 2. Actors

### 2.1 Human Actors

#### Admin

**ID**: `cpt-cyberwiki-actor-admin`

**Role**: Full platform administrator — manages users, spaces, Git sync configurations, validator rules, and integration credentials.

**Needs**: Ability to configure and control every aspect of the platform; visibility into sync health, pending changes, and access control.

#### Editor

**ID**: `cpt-cyberwiki-actor-editor`

**Role**: Creates, edits, and deletes documents within available git repositories; reviews and approves or rejects Pending Changes submitted by Commenters.

**Needs**: A fast, distraction-free editing experience with rich previews, inline validation feedback, and a clear review queue.

#### Commenter

**ID**: `cpt-cyberwiki-actor-commenter`

**Role**: Reads documents, leaves inline comments, and submits Pending Changes for review; does not have direct write access to apply edits.

**Needs**: Ability to annotate and propose changes without requiring a Git client or deep Git knowledge.

#### Viewer

**ID**: `cpt-cyberwiki-actor-viewer`

**Role**: Read-only access to assigned spaces and documents.

**Needs**: Fast, well-rendered document views with visible inline comments and JIRA context.


### 2.2 System Actors

#### Git Repository

**ID**: `cpt-cyberwiki-actor-git-repo`

**Role**: External source-of-truth for document content; the platform reads from and writes to repositories via Git protocols.

**Integration**: Bidirectional — platform reads content (Git → Wiki) and writes commits (Wiki → Git) via SSH/HTTPS Git protocols.

**Availability**: If the Git provider is unreachable, the platform operates in read-only mode; sync operations are queued and retried when connectivity is restored.

#### JIRA Instance

**ID**: `cpt-cyberwiki-actor-jira`

**Role**: External issue tracker; provides live issue metadata (status, assignee, priority, summary) consumed by inline JIRA Badges.

**Integration**: Outbound — platform queries JIRA REST API for issue data; no inbound calls from JIRA to the platform in v1.

**Availability**: If JIRA is unreachable, inline badges degrade gracefully to display the raw `[JIRA:KEY-123]` reference; document editing is unaffected.

#### CI / Automation Pipeline

**ID**: `cpt-cyberwiki-actor-ci`

**Role**: Automated process that triggers document validation or Git sync as part of a broader build or release workflow.

**Integration**: Inbound — CI calls the platform to trigger validation or sync; no outbound calls from the platform to CI in v1.

**Availability**: CI integration is optional; absence of CI does not affect manual editing or sync workflows.

---

## 3. Operational Concept & Environment

### 3.1 Module-Specific Environment Constraints

Cyber Wiki is a self-hosted, single-team web application. It is accessed via a browser by all human actors. All document changes flow through Git — the platform never holds document state that is not committed or pending commit to a repository.

The platform operates in a staging environment in v1; a production-grade deployment is explicitly out of scope. There are no multi-tenancy requirements in v1.

---

## 4. Scope

### 4.1 In Scope

- Web-based browsing and editing of Git-backed documents (Markdown focus)
- Live editing with immediate rich preview (Markdown, diagrams, tables)
- Inline commenting on documents
- Pending Changes workflow: propose → review → approve/reject
- Immutable change history per document
- Bidirectional Git synchronisation with configurable direction and schedule
- Configurable document validators (link checking, schema validation, custom rules)
- JIRA integration: inline status badges, issue views (grid, chart, Gantt), and issue search within the app
- Full-text and semantic (AI-powered) search across all accessible documents
- Access control inherited from Git repository permissions
- Self-hosted, single-team deployment

### 4.2 Out of Scope

- Production deployment (staging only in v1)
- Mobile native applications
- Real-time collaborative editing (concurrent multi-user editing of the same document)
- Replacing a full-featured Git hosting platform (no code review, branch management, CI/CD)
- Multi-tenancy or SaaS delivery
- Native support for non-text file types (binary assets, large media)

---

## 5. Functional Requirements

### 5.1 Repository & Space Navigation

#### Browse Repositories and Spaces

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-browse-spaces`

The system **MUST** allow any authenticated actor to browse spaces and navigate to the documents within them from a unified entry point.

**Rationale**: Discoverability is the first step in the documentation workflow; without it, the platform cannot replace fragmented tooling.

**Actors**: `cpt-cyberwiki-actor-admin`, `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-commenter`, `cpt-cyberwiki-actor-viewer`

#### Single-Repo Entry Page

- [ ] `p2` - **ID**: `cpt-cyberwiki-fr-single-repo-entry`

The system **MUST** support a configurable "entry page" mode where the platform opens directly on a specific repository or space, suitable for teams with a single primary repository.

**Rationale**: Teams that organise around one canonical repository benefit from a focused, direct landing experience rather than a multi-space directory.

**Actors**: `cpt-cyberwiki-actor-admin`, `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-viewer`

### 5.2 Live Document Editing

#### In-Browser Editing with Live Preview

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-live-edit`

The system **MUST** allow Editors to edit document content directly in the browser with a live preview rendered alongside or in place of the raw text.

**Rationale**: Eliminates the need for a local Git client or local Markdown renderer, reducing contribution friction to zero for engineers and non-engineers alike.

**Actors**: `cpt-cyberwiki-actor-editor`

#### Inline Pending Changes Visibility

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-inline-pending-changes`

The system **MUST** display pending changes from open pull requests inline within the document view for all users, as if the changes were already committed, with the following capabilities:

1. **Visual Indication**: Pending changes **MUST** be highlighted with a distinct background color to clearly indicate they are not yet merged
2. **Change Metadata**: Each pending change snippet **MUST** display:
   - Author name
   - Last update timestamp
   - Quick link to the full pull request
   - Visual indicators similar to diff view (red/green sections for deletions/additions)
3. **Inline Comments**: Users **MUST** be able to comment directly on pending change snippets; comments **MUST** be linked to the pull request
4. **Snippet Approval**: Users **MUST** be able to mark individual change snippets as "reviewed" or "pre-approved" for visibility to other reviewers; approved snippets **MUST** have a visually distinct background color from unreviewed pending changes
5. **PR Navigation**: Users **MUST** be able to navigate from any pending change snippet directly to the full pull request view to see all changes, leave comprehensive comments, or formally approve the PR

**Rationale**: Inline visibility of pending changes eliminates context-switching between the document and the PR review interface, enabling reviewers to see proposed changes in the context of the full document rather than isolated diffs. Per-snippet approval tracking helps teams coordinate review effort on large PRs. This mirrors the "viewed file" checkbox pattern familiar from Git hosting platforms while providing richer in-context review capabilities.

**Actors**: `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-commenter`, `cpt-cyberwiki-actor-viewer`

#### Save to Fork and Commit to Main

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-save-commit`

The system **MUST** support a GitHub-style review workflow with a "Submit review" button pattern: (1) save the edit to a personal fork or branch, then (2) submit for review/merge to the main branch. The system **MUST** display changes with visual diff highlighting (background colors for additions and deletions, including word-level changes) before submission, making it clear what content was added, removed, or modified.

**Rationale**: The GitHub "Submit review" pattern is familiar to engineering teams and provides clear visual feedback on changes before they are committed. Visual diff highlighting (showing deleted words/lines and added content with distinct background colors) reduces errors by making changes immediately apparent, mirroring the Git diff experience while keeping Git as the source of truth.

**Actors**: `cpt-cyberwiki-actor-editor`

### 5.3 Contextual Inline Comments

#### Anchor Comments to Line Ranges

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-inline-comments`

The system **MUST** allow authenticated actors to leave inline comments anchored to a specific line range within a document.

**Rationale**: Context-specific comments are more actionable and easier to navigate than document-level notes; they enable non-Git users to participate meaningfully in review.

**Actors**: `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-commenter`

#### Comments Survive Content Changes

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-comment-persistence`

The system **MUST** keep comments visible and relevant even after the lines they are anchored to have changed; when an anchor becomes outdated, the comment **MUST** be flagged rather than hidden.

**Rationale**: Comments that silently disappear after a document edit cause reviewers to lose track of unresolved concerns; flagging preserves traceability without cluttering the view.

**Actors**: `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-admin`

#### Threaded Comment Replies

- [ ] `p2` - **ID**: `cpt-cyberwiki-fr-comment-threads`

The system **MUST** support threaded replies to inline comments (one level of nesting) and allow Editors or Admins to resolve or delete comment threads.

**Rationale**: Threaded replies allow back-and-forth resolution of a concern without creating new top-level comments, keeping the review gutter readable.

**Actors**: `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-admin`, `cpt-cyberwiki-actor-commenter`

#### Comment Storage

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-comment-storage`

The system **MUST** persist inline comments in a configurable storage location: either (1) in a dedicated location within the repository, (2) in a dedicated separate repository, or (3) in a database. The storage location **MUST** be configurable to allow teams to choose the approach that best fits their security and access control requirements.

**Rationale**: Making comment storage configurable keeps the security and access model simple by allowing teams to leverage existing Git repository permissions for comment access control (by storing comments in Git), or to use a separate cyber-wiki-comments repository with its own access controls, or to use a database for simpler management. This flexibility avoids the need to build complex permission systems within the platform itself.

**Actors**: `cpt-cyberwiki-actor-git-repo`

### 5.4 Change Review Workflow

#### Propose Pending Changes

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-pending-changes`

The system **MUST** allow Commenters (and above) to propose a change to a document as a Pending Change that enters a review cycle before being applied.

**Rationale**: Gives non-Editor roles a structured path to contribute content changes without direct write access, enabling broader participation without compromising quality gates.

**Actors**: `cpt-cyberwiki-actor-commenter`, `cpt-cyberwiki-actor-editor`

#### Approve and Reject Changes

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-change-approval`

The system **MUST** allow Editors and Admins to approve or reject Pending Changes; approving a change **MUST** apply the edit to the document and create a Change Record.

**Rationale**: Without a gatekeeping step, any Commenter could overwrite document content; the approval gate preserves editorial control.

**Actors**: `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-admin`

#### Immutable Change History

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-change-history`

The system **MUST** maintain an immutable per-document change history that records author, timestamp, change type, summary, the content diff, change approvers, and the person who merged the change for every save.

**Rationale**: Auditability and the ability to understand why a document changed over time are fundamental to trust in a documentation platform. Recording change approvers and the person who merged it is critical to know who reviewed and authorized the change, especially for compliance and accountability purposes.

**Actors**: `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-admin`, `cpt-cyberwiki-actor-viewer`

### 5.5 Rich Content Previews

#### Markdown Rendering

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-markdown-preview`

The system **MUST** render Markdown documents with full GFM (GitHub Flavored Markdown) support, including headings, lists, code blocks, tables, links, and images.

**Rationale**: Markdown is the primary content format; high-fidelity rendering is a baseline expectation for any documentation platform.

**Actors**: `cpt-cyberwiki-actor-viewer`, `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-commenter`

#### Sequence and Mermaid Diagram Previews

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-diagram-preview`

The system **MUST** render Mermaid diagram fences (including sequence diagrams) as inline SVG within the document preview.

**Rationale**: Sequence and flow diagrams are essential to architectural documentation; requiring engineers to export diagrams separately introduces friction and stale images.

**Actors**: `cpt-cyberwiki-actor-viewer`, `cpt-cyberwiki-actor-editor`

#### draw.io Diagram Previews

- [ ] `p2` - **ID**: `cpt-cyberwiki-fr-drawio-preview`

The system **MUST** render draw.io diagram files linked or embedded within documents as interactive previews within the document viewer.

**Rationale**: draw.io is widely used for system and network diagrams in engineering teams; native rendering eliminates the round-trip to the draw.io application.

**Actors**: `cpt-cyberwiki-actor-viewer`, `cpt-cyberwiki-actor-editor`

#### Table Rendering

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-table-rendering`

The system **MUST** render Markdown tables as styled HTML tables with readable formatting in all document views. The system **SHOULD** support automated sorting and filtering capabilities for rendered tables to enable users to interact with tabular data without editing the source.

**Rationale**: Plain-text table syntax is unreadable at a glance; rendered tables are a basic quality-of-life requirement for structured documentation. Automated sorting and filtering enhance usability for large tables, allowing users to quickly find relevant data without manually reorganizing the table content.

**Actors**: `cpt-cyberwiki-actor-viewer`, `cpt-cyberwiki-actor-editor`

#### Extensible Visual Elements

- [ ] `p3` - **ID**: `cpt-cyberwiki-fr-custom-visuals`

The system **MUST** provide an extension point for rendering custom visual elements within documents beyond the built-in preview types. Additionally, the system **SHOULD** support the following Confluence-style rendering features:

1. **Checkbox rendering**: Interactive checkboxes within documents (similar to task lists in Confluence)
2. **Date rendering**: Formatted date display with calendar picker integration
3. **Current user highlight**: Automatic highlighting of content relevant to the currently logged-in user (e.g., mentions, assigned tasks)

**Rationale**: Teams have diverse visualisation needs (Gantt charts, topology maps, custom dashboards); a fixed set of renderers will eventually be insufficient. Confluence-style features like checkboxes, date rendering, and user highlighting are familiar to documentation teams and enhance interactivity and personalization without requiring custom extensions.

**Actors**: `cpt-cyberwiki-actor-admin`

### 5.6 Document Validation

#### Link Checker

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-link-checker`

The system **MUST** validate all internal links within a document (including links to other documents and Git repository paths) before the document can be saved; a document with broken internal links **MUST NOT** be saved until the links are resolved or explicitly overridden by the Editor.

**Rationale**: Broken links are the most common form of documentation rot; catching them at save time prevents accumulation of dead references.

**Actors**: `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-ci`

#### Schema Validation

- [ ] `p2` - **ID**: `cpt-cyberwiki-fr-schema-validation`

The system **MUST** support configurable schema validators (e.g., JSON Schema, RAML) that check the structure of documents or embedded data against a declared schema before saving.

**Rationale**: Structured documents (API specs, configuration manifests, data contracts) must conform to a schema to be consumable by downstream tooling; schema validation at the editor prevents non-conformant documents from entering the repository.

**Actors**: `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-admin`, `cpt-cyberwiki-actor-ci`

#### Custom / Domain-Specific Validators

- [ ] `p2` - **ID**: `cpt-cyberwiki-fr-custom-validators`

The system **MUST** support pluggable custom validators (e.g., CTI-specific rules, GTS-specific rules) that can be configured per space and that block or warn on save when triggered.

**Rationale**: Domain-specific teams (e.g., Cyber Threat Intelligence) have validation requirements that no generic validator can address; a plugin interface future-proofs the platform for these use cases.

**Actors**: `cpt-cyberwiki-actor-admin`, `cpt-cyberwiki-actor-ci`

### 5.7 Git Synchronisation

#### Bidirectional Sync

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-git-sync`

The system **MUST** support bidirectional synchronisation between a Space and a linked Git repository, with configurable sync direction (repository → wiki, wiki → repository, or both) and schedule.

**Rationale**: Git is the source of truth; the sync keeps the platform in alignment with changes made via other Git clients and ensures edits made in the wiki reach the repository.

**Actors**: `cpt-cyberwiki-actor-admin`, `cpt-cyberwiki-actor-git-repo`, `cpt-cyberwiki-actor-ci`

#### Conflict Detection

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-conflict-detection`

The system **MUST** detect merge conflicts during sync and surface them to the change author for resolution; whoever is second must update their PR to resolve conflicts, following standard Git workflow. Conflicted PRs **MUST** be clearly indicated in the UI.

**Rationale**: Undetected conflicts silently overwrite content; surfacing them preserves data integrity. Conflict resolution is the author's responsibility, not the Admin's, matching standard Git practices where the second committer must rebase or merge and resolve conflicts before their changes can be merged.

**Actors**: `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-commenter`

### 5.8 Search

#### Full-Text Search

- [ ] `p2` - **ID**: `cpt-cyberwiki-fr-fulltext-search`

The system **MUST** provide full-text search across all documents and spaces the requesting actor has access to, with results filterable by space and showing the document title, space name, a highlighted excerpt, and line number.

**Rationale**: Text search is a baseline requirement for any knowledge platform; without it, users cannot find documents they don't already know the path to.

**Actors**: `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-commenter`, `cpt-cyberwiki-actor-viewer`

#### Semantic (AI-Powered) Search

- [ ] `p2` - **ID**: `cpt-cyberwiki-fr-semantic-search`

The system **MUST** provide AI-powered semantic search using vector embeddings so that queries return conceptually relevant documents even when they do not share exact keywords with the query.

**Rationale**: Keyword search fails for exploratory queries and synonyms; semantic search dramatically improves the quality of results for engineering documentation, which is dense with jargon and acronyms.

**Actors**: `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-commenter`, `cpt-cyberwiki-actor-viewer`

### 5.9 JIRA Integration

#### Inline JIRA Issue Badges

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-jira-badge`

The system **MUST** render `[JIRA:KEY-123]` references in documents as inline status badges showing the issue key, summary, status, assignee, and priority; clicking the badge **MUST** open the JIRA issue in a new tab.

**Rationale**: Context-switching to JIRA to check a ticket's status is a constant interruption; inline badges eliminate the need to leave the document.

**Actors**: `cpt-cyberwiki-actor-viewer`, `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-jira`

#### JIRA Issue Views (Grid, Chart, Gantt)

- [ ] `p2` - **ID**: `cpt-cyberwiki-fr-jira-views`

The system **MUST** allow users to view JIRA issues associated with a space or document as a grid, a chart, or a Gantt diagram within the platform.

**Rationale**: Different actors need different perspectives on issue data: PMs need a timeline (Gantt), engineers need a flat list (grid), stakeholders need a summary (chart); providing all three removes the need to open JIRA for reporting.

**Actors**: `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-commenter`, `cpt-cyberwiki-actor-viewer`, `cpt-cyberwiki-actor-jira`

#### JIRA Issue Search

- [ ] `p2` - **ID**: `cpt-cyberwiki-fr-jira-search`

The system **MUST** allow users to search JIRA issues from within the platform without leaving the document context.

**Rationale**: Enables users to find and reference relevant JIRA tickets while authoring documents, reducing the need to switch applications.

**Actors**: `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-commenter`

### 5.10 Access Control

#### User Authentication

- [ ] `p1` - **ID**: `cpt-cyberwiki-fr-authentication`

The system **MUST** authenticate all users before granting access to any space or document; the platform **MUST** support at minimum username/password authentication and **SHOULD** support SSO/OIDC integration for teams using an identity provider.

**Rationale**: Authentication is required to inherit Git repository permissions; SSO reduces credential management overhead for engineering teams already using an identity provider.

**Actors**: `cpt-cyberwiki-actor-admin`, `cpt-cyberwiki-actor-editor`, `cpt-cyberwiki-actor-commenter`, `cpt-cyberwiki-actor-viewer`

---

## 6. Non-Functional Requirements

### 6.1 Module-Specific NFRs

#### Search Response Time

- [ ] `p1` - **ID**: `cpt-cyberwiki-nfr-search-latency`

The system **MUST** return search results (both full-text and semantic) in under 2 seconds for a corpus of up to 10,000 documents at p95.

**Threshold**: ≤ 2 000 ms at p95, corpus ≤ 10,000 documents

**Rationale**: Search latency above 2 seconds degrades the experience to the point where users abandon it and fall back to manual navigation.

#### Document Save Latency

- [ ] `p1` - **ID**: `cpt-cyberwiki-nfr-save-latency`

The system **MUST** complete a document save (validation + write) in under 3 seconds for documents up to 500 KB.

**Threshold**: ≤ 3 000 ms, document ≤ 500 KB

**Rationale**: A slow save loop breaks the editing flow and discourages frequent incremental saves.

#### Availability

- [ ] `p2` - **ID**: `cpt-cyberwiki-nfr-availability`

The system **MUST** maintain 99% uptime during business hours in the staging environment.

**Threshold**: 99% uptime, business hours

**Rationale**: Even in staging, unplanned downtime blocks the team's documentation workflows.

#### Recovery Objectives

- [ ] `p2` - **ID**: `cpt-cyberwiki-nfr-recovery`

The system **MUST** tolerate loss of the application database without losing any committed document content, as Git is the recovery source of truth; the RPO for the comment and embedding store is ≤ 24 hours; the RTO is ≤ 4 hours.

**Threshold**: RPO ≤ 24 h, RTO ≤ 4 h (staging)

**Rationale**: Without defined recovery objectives, the DESIGN team has no basis for choosing backup strategies or defining acceptable data loss windows.

#### User Experience Goals

- [ ] `p2` - **ID**: `cpt-cyberwiki-nfr-ux`

The system **MUST** be operable by non-engineers (product managers, designers) without prior Git knowledge; the core workflows (read document, leave comment, propose change) **MUST** be completable without consulting documentation.

**Threshold**: Core workflows completable by a non-engineer in under 5 minutes without documentation

**Rationale**: An explicit UX goal for non-engineers is required because they are primary actors; without it, the DESIGN team has no basis for UI architecture decisions.

**Note**: WCAG 2.1 AA accessibility compliance is not required in v1 (internal tool, known engineering user base); deferred to production deployment.

### 6.2 NFR Exclusions

- **Multi-region availability**: Not applicable in v1 — single-node staging deployment only.
- **Horizontal scalability under high load**: Not applicable in v1 — single-team usage, no public traffic.
- **GDPR / regulatory compliance**: Not in scope for v1; to be addressed before any production or multi-tenant deployment.

---

## 7. Public Library Interfaces

### 7.1 Public API Surface

Not applicable — Cyber Wiki is an end-user web application, not a library. It does not expose a programmatic API surface for external consumers in v1.

### 7.2 External Integration Contracts

Cyber Wiki depends on the following external integration contracts:

- **Git Provider**: Reads and writes document content over standard Git protocols (SSH/HTTPS). No custom API contract; standard Git wire protocol applies.
- **JIRA REST API**: Consumes JIRA issue data (status, assignee, priority, summary) via the JIRA Cloud/Server REST API; contract format TBD in DESIGN.
- **Embedding Service**: Sends document text and receives vector embeddings; contract format (input schema, vector dimensions, batch size) TBD in DESIGN.
- **Vector Database**: Stores and queries document embeddings for semantic search; query protocol and index format TBD in DESIGN.

---

## 8. Use Cases

### Edit and Commit a Document

- [ ] `p1` - **ID**: `cpt-cyberwiki-usecase-edit-commit`

**Actor**: `cpt-cyberwiki-actor-editor`

**Preconditions**:
- Editor is authenticated and has Editor role in the target space
- The target document exists and is synced with Git

**Main Flow**:
1. Editor opens the document in the browser
2. Editor switches to edit mode; live preview appears alongside the editor
3. Editor makes changes; validators run in the background and surface issues inline
4. Editor resolves any validation errors
5. Editor saves the change to a personal branch
6. Editor commits/merges the branch to main via the UI
7. System creates a Change Record and triggers a Git sync

**Postconditions**:
- Document content is updated in the Space and committed to the linked Git repository
- A Change Record is created with author, timestamp, and diff

**Alternative Flows**:
- **Validation failure**: System blocks save and highlights the failing validator; Editor must resolve before proceeding
- **Merge conflict**: System detects conflict during sync and notifies the Admin

---

## 9. Acceptance Criteria

- [ ] An Editor can open, edit, and commit a Markdown document entirely from the browser without a local Git client
- [ ] A document with a broken internal link cannot be saved until the link is resolved or the check is explicitly overridden
- [ ] Mermaid and draw.io diagrams render inline in the document viewer
- [ ] Semantic search returns relevant results for a natural-language query across a corpus of at least 1,000 documents
- [ ] `[JIRA:KEY-123]` references render as inline badges showing live status, assignee, and priority
- [ ] A Viewer cannot edit or propose changes to a document (access is denied)
- [ ] All document saves are reflected as commits in the linked Git repository within the configured sync interval

---

## 10. Dependencies

| Dependency | Description | Criticality |
|------------|-------------|-------------|
| Git Provider | Hosts the source repositories; required for Git sync | p1 |
| JIRA Instance | Provides issue metadata for inline badges and search | p2 |
| Vector Database | Stores document embeddings for semantic search | p1 |
| Embedding Service | Generates vector embeddings from document content | p1 |

---

## 11. Assumptions

- Teams operate a single self-hosted instance per team; multi-tenancy is not required in v1.
- The primary document format is Markdown; support for other formats is not in scope for v1.
- Git is always available as the underlying storage; the platform does not operate in an offline-first mode.
- JIRA integration is optional; teams without JIRA can use the platform without configuring it.
- The embedding/vector search service is available as an external dependency; the platform integrates with it rather than hosting its own model.
- Staging deployment is the only target environment for v1; production hardening is deferred.
- Expected team size: ≤ 50 registered users; ≤ 10 concurrent active editors; ≤ 30 concurrent viewers.
- Expected document corpus: up to 10,000 documents across all spaces in v1.
- Change Records and inline comments are retained for the lifetime of the Space; deleting a Space permanently removes all associated documents, comments, and change records.
- Individual comment deletion by end-users is not required in v1; Admin-only moderation is sufficient.

---

## 12. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Git sync conflicts corrupt document content | HIGH — data loss or silent overwrites | Implement conflict detection with Admin notification before applying any conflicting change |
| Semantic search quality is insufficient for domain-specific jargon | MEDIUM — users abandon search and fall back to manual browsing | Allow teams to tune embedding models or supplement with keyword search as a fallback |
| Validator false positives block legitimate saves | MEDIUM — Editor frustration, validation bypassed | All validators must support an explicit override with a reason logged to the Change Record |
| draw.io rendering adds significant bundle size or latency | LOW — slower page loads | Lazy-load the draw.io renderer only when a draw.io file is detected on the page |

---

## 13. Open Questions

| Question | Owner | Target Resolution |
|----------|-------|-------------------|
| Which embedding model and service will be used for semantic search? | TBD | Before DESIGN |
| Which JIRA API version (Cloud vs Server/Data Center) must be supported? | TBD | Before DESIGN |
| Should draw.io rendering be client-side (draw.io JS SDK) or server-side? | TBD | Before DESIGN |
| Should Git sync support webhook-triggered pushes in addition to polling? | TBD | Before DESIGN |
| What is the expected maximum document corpus size beyond the 10,000 target? | TBD | Before M1 |
