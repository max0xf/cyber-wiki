# Technical Design — Backend


<!-- toc -->

- [1. Architecture Overview](#1-architecture-overview)
  - [1.1 Technology Stack](#11-technology-stack)
  - [1.2 Project Structure](#12-project-structure)
  - [1.3 Application Modules](#13-application-modules)
  - [1.4 Architectural Vision](#14-architectural-vision)
  - [1.5 Architecture Drivers](#15-architecture-drivers)
  - [1.6 Requirements Traceability Matrix](#16-requirements-traceability-matrix)
  - [1.7 Architecture Layers](#17-architecture-layers)
- [2. Authentication & Authorization](#2-authentication--authorization)
  - [2.1 Authentication Mechanisms](#21-authentication-mechanisms)
  - [2.2 User Roles](#22-user-roles)
  - [2.3 SSO/OIDC Support](#23-ssooidc-support)
- [3. Principles & Constraints](#3-principles--constraints)
  - [3.1 Design Principles](#31-design-principles)
  - [3.2 Constraints](#32-constraints)
- [4. Data Models](#4-data-models)
  - [4.1 User Management Models](#41-user-management-models)
  - [4.2 Wiki Models](#42-wiki-models)
  - [4.3 Git Provider Models](#43-git-provider-models)
- [5. Technical Architecture](#5-technical-architecture)
  - [5.1 Domain Model](#51-domain-model)
  - [5.2 Component Model](#52-component-model)
  - [5.3 API Contracts](#53-api-contracts)
  - [5.4 Internal Dependencies](#54-internal-dependencies)
  - [5.5 External Dependencies](#55-external-dependencies)
  - [5.6 Interactions & Sequences](#56-interactions--sequences)
  - [5.7 Database schemas & tables](#57-database-schemas--tables)
- [6. Additional context](#6-additional-context)
  - [6.1 Use Case Realizations](#61-use-case-realizations)
  - [6.2 Core Logic & Algorithms](#62-core-logic--algorithms)
  - [6.3 Configuration](#63-configuration)
  - [6.4 Error Handling Strategy](#64-error-handling-strategy)
  - [6.5 Performance Optimizations](#65-performance-optimizations)
- [7. Traceability](#7-traceability)

<!-- /toc -->

- [ ] `p3` - **ID**: `cpt-cyberwiki-design-backend`
## 1. Architecture Overview

### 1.1 Technology Stack

**Core Framework:**
- Django 5.2.9 — Web framework
- Django REST Framework 3.16.1 — REST API layer
- Python 3.14

**Key Libraries:**
- `drf-spectacular` 0.27.2 — OpenAPI schema generation and Swagger UI
- `Authlib` 1.6.9 — OIDC/SSO authentication
- `GitPython` 3.1.44 — Git repository operations
- `APScheduler` 3.10.4 — Background sync tasks
- `cryptography` 44.0.2 — Token encryption (Fernet)
- `PyYAML` 6.0.1 — Configuration parsing
- `requests` 2.32.5 — HTTP client for external APIs
- `gunicorn` 23.0.0 — WSGI production server
- `django-cors-headers` 4.6.0 — CORS support
- `django-brotli` 0.2.1 — Brotli compression

**Database:**
- SQLite (development, CI)
- PostgreSQL (production) via `psycopg2-binary` 2.9.10

**Testing:**
- `pytest` 8.3.4 + `pytest-django` 4.9.0 + `pytest-mock` 3.14.0 + `pytest-cov` 4.1.0

### 1.2 Project Structure

```
src/backend/
├── config/                    # Django project settings
│   ├── settings.py           # Main configuration
│   ├── urls.py               # Root URL routing
│   └── wsgi.py               # WSGI application
├── users/                     # User management app
│   ├── models.py             # User, Profile, Tokens, Preferences
│   ├── views.py              # User management APIs
│   ├── auth_views.py         # Authentication endpoints
│   ├── auth_urls.py          # Auth URL routing
│   ├── urls.py               # User management URL routing
│   ├── token_authentication.py  # Bearer token auth
│   └── permissions.py        # Role-based permissions
├── wiki/                      # Wiki/document management app
│   ├── models.py             # Space, Document, Comment, Changes
│   ├── views.py              # Wiki CRUD APIs
│   ├── views_comments.py     # File comment APIs
│   ├── views_user_changes.py # User changes APIs
│   ├── tree_builder.py       # Tree construction logic
│   ├── title_extractor.py    # Title extraction from markdown
│   ├── config_parser.py      # .cyberwiki.yml parser
│   └── urls.py               # Wiki URL routing
├── git_provider/              # Git provider abstraction
│   ├── base.py               # Abstract provider interface
│   ├── factory.py            # Provider factory
│   ├── models.py             # GitToken (encrypted credentials)
│   ├── providers/
│   │   ├── github.py         # GitHub implementation
│   │   └── bitbucket_server.py  # Bitbucket Server implementation
│   ├── views.py              # Git provider APIs
│   └── urls.py               # Git provider URL routing
├── source_provider/           # Source abstraction layer
│   ├── base.py               # SourceAddress, BaseSourceProvider
│   ├── git_source.py         # Git source implementation
│   ├── views.py              # Source provider APIs
│   └── urls.py               # Source provider URL routing
├── enrichment_provider/       # Enrichment system
│   ├── base.py               # BaseEnrichmentProvider interface
│   ├── comment_enrichment.py # Comment enrichments
│   ├── pr_enrichment.py      # PR diff enrichments
│   ├── local_changes_enrichment.py  # User changes enrichments
│   ├── views.py              # Enrichment APIs
│   └── urls.py               # Enrichment URL routing
├── debug_cache/               # Debug/caching utilities
├── data/                      # Runtime data directory
│   └── db.sqlite3            # SQLite database (dev)
├── manage.py                  # Django management script
└── requirements.txt           # Python dependencies
```

### 1.3 Application Modules

| Module | Responsibility |
|--------|---------------|
| **users** | User authentication, roles, profiles, API tokens, favorites, recent repos, view mode preferences |
| **wiki** | Spaces, documents, inline comments, change history, pending changes, git sync, repository trees |
| **git_provider** | Abstract interface for Git hosting providers (GitHub, Bitbucket Server), repository operations, PR diffs |
| **source_provider** | Universal source addressing (`SourceAddress`), source content retrieval, abstraction over git providers |
| **enrichment_provider** | Extensible enrichment system (comments, PR diffs, local changes), dual mapping (raw/rendered) |
| **debug_cache** | Development utilities for caching API responses |

### 1.4 Architectural Vision

The CyberWiki backend is built with Django 5.2 and Django REST Framework, acting as a stateless API server and background sync engine. It abstracts Git repositories and file systems into a unified document graph and enrichment layer. 

The architecture is designed around the concept of "Enrichments" — metadata overlays on top of universally identifiable source addresses — allowing for non-destructive collaboration (comments, diffs) on code and documentation.

### 1.5 Architecture Drivers

#### Functional Drivers

| Requirement | Design Response |
|-------------|------------------|
| `cpt-cyberwiki-fr-repository-sync` | APScheduler for periodic background pulls, with `GitPython` abstraction via the `git_provider` app. |
| `cpt-cyberwiki-fr-dual-navigation` | Tree building abstraction (`tree_builder.py`, `title_extractor.py`) supporting both raw Developer Mode and processed Document Mode. |
| `cpt-cyberwiki-fr-enrichment-api` | Extensible `BaseEnrichmentProvider` system, with specific implementations for Comments, PRs, and Local Changes. |

#### NFR Allocation

| NFR ID | NFR Summary | Allocated To | Design Response | Verification Approach |
|--------|-------------|--------------|-----------------|----------------------|
| `cpt-cyberwiki-nfr-extensibility` | Easy to add new metadata types | Architecture | `EnrichmentProvider` interface pattern | Code review |
| `cpt-cyberwiki-nfr-portability` | Database agnostic | Infrastructure | Django ORM (`DATABASE_URL` for SQLite/Postgres) | CI Testing |

### 1.6 Requirements Traceability Matrix

This section maps all PRD requirements to backend design components and implementation status.

#### Navigation & Browsing Requirements

| Requirement ID | Priority | Requirement Summary | Design Component(s) | Status | Design Section |
|----------------|----------|---------------------|---------------------|--------|----------------|
| `cpt-cyberwiki-fr-browse-spaces` | p1 | Browse spaces and navigate to documents | `wiki.models.Space`, `wiki.views`, Repository API | [ ] Not Started | Section 5.3 |
| `cpt-cyberwiki-fr-single-repo-entry` | p2 | Configurable single-repo entry page | Configuration setting, Frontend routing | [ ] Not Started | Section 6 |
| `cpt-cyberwiki-fr-left-nav-dual-mode` | p1 | Dual-mode navigation (Document/File Tree) | `tree_builder.py`, Mode persistence in `UserProfile` | [x] Designed | Section 4.2 |
| `cpt-cyberwiki-fr-document-index` | p1 | Configurable document index per space | `config_parser.py`, `.cyberwiki.yml` schema | [x] Designed | Section 6 |
| `cpt-cyberwiki-fr-title-extraction` | p1 | Title extraction rules | `title_extractor.py`, Markdown/frontmatter parsing | [x] Designed | Section 6 |

#### Editing Requirements

| Requirement ID | Priority | Requirement Summary | Design Component(s) | Status | Design Section |
|----------------|----------|---------------------|---------------------|--------|----------------|
| `cpt-cyberwiki-fr-live-edit` | p1 | In-browser editing with live preview | Frontend responsibility, Backend save API | [ ] Not Started | Section 5.3 |
| `cpt-cyberwiki-fr-standard-formatting` | p1 | Standard formatting controls | Frontend responsibility | N/A | N/A |
| `cpt-cyberwiki-fr-date-shortcut` | p1 | Date insertion via `//` shortcut | Frontend responsibility | N/A | N/A |
| `cpt-cyberwiki-fr-date-badge-rendering` | p1 | Date badge rendering | Frontend responsibility | N/A | N/A |
| `cpt-cyberwiki-fr-user-tag-search-shortcut` | p1 | User search/tagging via `@` shortcut | User search API, `users.views` | [ ] Not Started | Section 5.3 |
| `cpt-cyberwiki-fr-mention-task-sync-discovery` | p3 | Scan synced Markdown for mentions/tasks | Sync service, Markdown parser, `wiki.models.Mention`, `wiki.models.Task` | [ ] Not Started | TBD |
| `cpt-cyberwiki-fr-mention-entity-badge-render` | p3 | Mention entity storage and badge rendering | `wiki.models.Mention`, Mention API | [ ] Not Started | TBD |
| `cpt-cyberwiki-fr-mention-index` | p3 | Mention index view | Mention query API, `users.views` | [ ] Not Started | TBD |
| `cpt-cyberwiki-fr-task-extraction-checkbox` | p3 | Task extraction from checkbox lines | `wiki.models.Task`, Markdown checkbox parser | [ ] Not Started | TBD |
| `cpt-cyberwiki-fr-task-dashboard` | p3 | Task dashboard with filters | Task query API, `wiki.views` | [ ] Not Started | TBD |
| `cpt-cyberwiki-fr-smart-edit-highlight-new-text` | p1 | Highlight newly typed text | Frontend responsibility | N/A | N/A |
| `cpt-cyberwiki-fr-smart-edit-ai-refine` | p2 | AI text refinement | AI service integration, Refinement API | [ ] Not Started | TBD |

#### Comments Requirements

| Requirement ID | Priority | Requirement Summary | Design Component(s) | Status | Design Section |
|----------------|----------|---------------------|---------------------|--------|----------------|
| `cpt-cyberwiki-fr-inline-comments` | p1 | Inline commenting on documents | `wiki.models.FileComment`, `wiki.views_comments` | [x] Designed | Section 4.2 |
| `cpt-cyberwiki-fr-comment-persistence` | p1 | Comment persistence across content changes | `FileComment.source_address`, Line anchoring algorithm | [x] Designed | Section 4.2 |
| `cpt-cyberwiki-fr-comment-threads` | p2 | Threaded comment replies | `FileComment.parent`, Thread query logic | [x] Designed | Section 4.2 |
| `cpt-cyberwiki-fr-comment-storage` | p1 | Database-native comment storage | `wiki.models.FileComment`, PostgreSQL/SQLite | [x] Designed | Section 4.2 |
| `cpt-cyberwiki-fr-comment-line-anchoring` | p1 | Line-level comment anchoring | `SourceAddress` URI, Line range storage | [x] Designed | Section 4.2 |
| `cpt-cyberwiki-fr-mention-notification-preferences` | p3 | User notification preferences | `users.models.UserProfile.notification_prefs`, Notification service | [ ] Not Started | TBD |
| `cpt-cyberwiki-fr-admin-default-notification-channels` | p3 | Admin default notification channels | Configuration settings, Admin panel | [ ] Not Started | TBD |

#### Change Management Requirements

| Requirement ID | Priority | Requirement Summary | Design Component(s) | Status | Design Section |
|----------------|----------|---------------------|---------------------|--------|----------------|
| `cpt-cyberwiki-fr-inline-pending-changes` | p1 | Display inline pending changes | `wiki.models.UserChange`, Enrichment integration | [x] Designed | Section 4.2 |
| `cpt-cyberwiki-fr-save-commit` | p1 | Save and commit workflow | `wiki.views`, Git commit API, `GitPython` | [ ] Not Started | Section 5.3 |
| `cpt-cyberwiki-fr-pending-changes` | p1 | Pending changes workflow | `wiki.models.UserChange`, Approval workflow | [x] Designed | Section 4.2 |
| `cpt-cyberwiki-fr-change-approval` | p1 | Approve/reject pending changes | `wiki.views_user_changes`, Workflow state machine | [ ] Not Started | Section 5.3 |
| `cpt-cyberwiki-fr-change-history` | p1 | Immutable change history | `wiki.models.UserChange`, Audit log | [x] Designed | Section 4.2 |

#### Rich Previews Requirements

| Requirement ID | Priority | Requirement Summary | Design Component(s) | Status | Design Section |
|----------------|----------|---------------------|---------------------|--------|----------------|
| `cpt-cyberwiki-fr-markdown-preview` | p1 | Markdown preview rendering | Frontend responsibility, Raw content API | N/A | N/A |
| `cpt-cyberwiki-fr-diagram-preview` | p1 | Sequence diagram rendering | Frontend responsibility | N/A | N/A |
| `cpt-cyberwiki-fr-drawio-preview` | p2 | Draw.io diagram preview | Frontend responsibility | N/A | N/A |
| `cpt-cyberwiki-fr-table-rendering` | p1 | Table rendering | Frontend responsibility | N/A | N/A |
| `cpt-cyberwiki-fr-custom-visuals` | p3 | Custom visual components | Frontend responsibility | N/A | N/A |

#### Validation Requirements

| Requirement ID | Priority | Requirement Summary | Design Component(s) | Status | Design Section |
|----------------|----------|---------------------|---------------------|--------|----------------|
| `cpt-cyberwiki-fr-link-checker` | p1 | Link validation before save | `wiki.validators.LinkValidator`, Pre-save hook | [ ] Not Started | TBD |
| `cpt-cyberwiki-fr-schema-validation` | p2 | Schema validation for structured docs | `wiki.validators.SchemaValidator`, JSON Schema | [ ] Not Started | TBD |
| `cpt-cyberwiki-fr-custom-validators` | p2 | Custom validator plugins | `wiki.validators` plugin registry | [ ] Not Started | TBD |

#### Git Synchronization Requirements

| Requirement ID | Priority | Requirement Summary | Design Component(s) | Status | Design Section |
|----------------|----------|---------------------|---------------------|--------|----------------|
| `cpt-cyberwiki-fr-git-sync` | p1 | Bidirectional Git synchronization | `wiki.models.GitSyncConfig`, APScheduler, `GitPython` | [x] Designed | Section 6 |
| `cpt-cyberwiki-fr-conflict-detection` | p1 | Conflict detection and resolution | Conflict detection algorithm, Merge strategy | [ ] Not Started | TBD |

#### Search Requirements

| Requirement ID | Priority | Requirement Summary | Design Component(s) | Status | Design Section |
|----------------|----------|---------------------|---------------------|--------|----------------|
| `cpt-cyberwiki-fr-fulltext-search` | p2 | Full-text search across documents | Search index, `wiki.views.search`, PostgreSQL full-text | [ ] Not Started | TBD |
| `cpt-cyberwiki-fr-semantic-search` | p2 | AI-powered semantic search | Vector embeddings, Similarity search API | [ ] Not Started | TBD |

#### JIRA Integration Requirements

| Requirement ID | Priority | Requirement Summary | Design Component(s) | Status | Design Section |
|----------------|----------|---------------------|---------------------|--------|----------------|
| `cpt-cyberwiki-fr-jira-badge` | p1 | Inline JIRA status badges | JIRA API client, Badge data API, `integrations.jira` | [ ] Not Started | TBD |
| `cpt-cyberwiki-fr-jira-views` | p2 | JIRA views (grid, chart, Gantt) | JIRA query API, Data transformation | [ ] Not Started | TBD |
| `cpt-cyberwiki-fr-jira-search` | p2 | JIRA issue search within app | JIRA search proxy API | [ ] Not Started | TBD |

#### Authentication Requirements

| Requirement ID | Priority | Requirement Summary | Design Component(s) | Status | Design Section |
|----------------|----------|---------------------|---------------------|--------|----------------|
| `cpt-cyberwiki-fr-authentication` | p1 | User authentication | `users.auth_views`, Session + Bearer token auth | [x] Designed | Section 2.1 |
| `cpt-cyberwiki-fr-vcs-authentication` | p1 | VCS provider authentication | `git_provider.models.GitToken`, Fernet encryption | [x] Designed | Section 2.1, 4.3 |

#### VCS Integration Requirements

| Requirement ID | Priority | Requirement Summary | Design Component(s) | Status | Design Section |
|----------------|----------|---------------------|---------------------|--------|----------------|
| `cpt-cyberwiki-fr-vcs-backend` | p1 | Pluggable VCS backend (GitHub/Bitbucket) | `git_provider.base.BaseGitProvider`, Provider factory | [x] Designed | Section 6 |
| `cpt-cyberwiki-fr-vcs-interface` | p1 | Abstract VCS provider interface | `BaseGitProvider` abstract class, Provider implementations | [x] Designed | Section 6 |
| `cpt-cyberwiki-fr-repo-listing` | p1 | Repository listing | `git_provider.views.list_repositories`, Provider API | [ ] Not Started | Section 5.3 |
| `cpt-cyberwiki-fr-file-tree-navigation` | p1 | File tree navigation | `tree_builder.py`, Repository tree API | [x] Designed | Section 6 |
| `cpt-cyberwiki-fr-file-content-display` | p1 | File content display | `source_provider` API, Raw content retrieval | [x] Designed | Section 5.1 |
| `cpt-cyberwiki-fr-pr-listing` | p1 | Pull request listing | `git_provider` PR API, Provider implementations | [ ] Not Started | Section 5.3 |
| `cpt-cyberwiki-fr-pr-diff-review` | p3 | PR diff review | `enrichment_provider.pr_enrichment`, Diff API | [x] Designed | Section 6 |
| `cpt-cyberwiki-fr-git-blame` | p2 | Git blame integration | `GitPython` blame, Blame API endpoint | [ ] Not Started | TBD |
| `cpt-cyberwiki-fr-api-token-management` | p2 | API token management | `users.models.ApiToken`, Token CRUD API | [x] Designed | Section 4.1 |

#### Non-Functional Requirements

| Requirement ID | Priority | Requirement Summary | Design Component(s) | Status | Design Section |
|----------------|----------|---------------------|---------------------|--------|----------------|
| `cpt-cyberwiki-nfr-search-latency` | p1 | Search results < 2s | Database indexing, Query optimization, Caching | [ ] Not Started | TBD |
| `cpt-cyberwiki-nfr-save-latency` | p1 | Save/commit < 60s | Async task queue, Background commit processing | [ ] Not Started | TBD |
| `cpt-cyberwiki-nfr-repo-list-performance` | p2 | Fast repository list loading | Pagination, Caching, Provider API optimization | [ ] Not Started | TBD |
| `cpt-cyberwiki-nfr-availability` | p2 | 99% uptime target | Health checks, Graceful degradation | [ ] Not Started | TBD |
| `cpt-cyberwiki-nfr-recovery` | p2 | <5min recovery time | Automated restart, Database backups | [ ] Not Started | TBD |
| `cpt-cyberwiki-nfr-credential-security` | p1 | Secure credential storage | Fernet encryption, `GitToken` model, Environment variables | [x] Designed | Section 4.3 |

#### Use Cases

| Use Case ID | Priority | Use Case Summary | Involved Components | Status | Design Section |
|-------------|----------|------------------|---------------------|--------|----------------|
| `cpt-cyberwiki-usecase-edit-commit` | p1 | Edit and commit a document | `wiki.views`, Git commit workflow, `GitPython` | [ ] Not Started | TBD |
| `cpt-cyberwiki-usecase-auth-configure` | p1 | Authenticate and configure Git credentials | `users.auth_views`, `git_provider.views`, `GitToken` | [x] Designed | Section 2.1 |
| `cpt-cyberwiki-usecase-browse-repo` | p1 | Browse repository file tree | `tree_builder.py`, Repository tree API, `wiki.views` | [x] Designed | Section 6 |
| `cpt-cyberwiki-usecase-view-file-comments` | p1 | View file content with inline comments | `enrichment_provider`, `wiki.views_comments`, Comment API | [x] Designed | Section 6 |
| `cpt-cyberwiki-usecase-view-pr` | p1 | View PRs and navigate to VCS provider | `git_provider` PR API, External link generation | [ ] Not Started | Section 5.3 |

**Traceability Summary:**
- Total Requirements: 68
- Designed: 20 (29.4%)
- Not Started: 36 (52.9%)
- N/A (Frontend): 12 (17.6%)
- Priority 1 (p1): 37 total, 16 designed (43.2%)
- Priority 2 (p2): 15 total, 0 designed (0%)
- Priority 3 (p3): 11 total, 1 designed (9.1%)
- Use Cases: 5 total, 3 designed (60%)

### 1.7 Architecture Layers

| Layer | Responsibility | Technology |
|-------|---------------|------------|
| API | REST endpoints, OpenAPI schema | DRF, drf-spectacular |
| Application | Tree building, Title extraction, Providers | Python, `tree_builder.py` |
| Domain | Models: User, Repository, Enrichment, Comment | Django ORM |
| Infrastructure | Git operations, Background tasks | GitPython, APScheduler |

## 2. Authentication & Authorization

### 2.1 Authentication Mechanisms

**Dual Authentication Support:**

1. **Session Cookie Authentication** (Browser)
   - Django session-based auth
   - Cookie: `sessionid`
   - CSRF protection via `csrftoken` cookie
   - Used by frontend SPA

2. **Bearer Token Authentication** (API/CLI)
   - Custom token in `Authorization: Bearer <token>` header
   - Stored in `ApiToken` model
   - Generated via `secrets.token_urlsafe(48)`
   - Used for programmatic access

**Implementation:**
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'users.token_authentication.BearerTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
}
```

### 2.2 User Roles

**Role Hierarchy:**
```python
class UserRole(models.TextChoices):
    ADMIN = 'admin'        # Full system access
    EDITOR = 'editor'      # Create/edit documents
    COMMENTER = 'commenter'  # Read + comment
    VIEWER = 'viewer'      # Read-only
    GUEST = 'guest'        # Unauthenticated comments
```

**Permission Matrix:**

| Action | Admin | Editor | Commenter | Viewer | Guest |
|--------|-------|--------|-----------|--------|-------|
| View documents | ✅ | ✅ | ✅ | ✅ | ✅ (public) |
| Create/edit documents | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete documents | ✅ | ✅ | ❌ | ❌ | ❌ |
| Add comments | ✅ | ✅ | ✅ | ❌ | ✅ (public) |
| Resolve comments | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approve pending changes | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Configure git sync | ✅ | ❌ | ❌ | ❌ | ❌ |

### 2.3 SSO/OIDC Support

**Configuration:**
```bash
SSO_ENABLED=true
OIDC_CLIENT_ID=<client-id>
OIDC_CLIENT_SECRET=<client-secret>
OIDC_DISCOVERY_URL=https://sso.example.com/.well-known/openid-configuration
```

**Flow:**
1. User clicks "Login with SSO"
2. Redirect to OIDC provider
3. Callback to `/oauth/callback`
4. Exchange code for tokens
5. Create/update user in Django
6. Establish session

**Implementation:** Uses `Authlib` library for OIDC protocol handling.

---

## 3. Principles & Constraints

### 3.1 Design Principles

#### Universal Source Addressing

- [ ] `p2` - **ID**: `cpt-cyberwiki-principle-source-address`

All resources in the wiki must be addressable via a custom URI scheme (e.g., `git://repo-id/path/to/file`). This decouples enrichments from the physical file storage.

#### Extensible Enrichment Pipeline

- [ ] `p2` - **ID**: `cpt-cyberwiki-principle-enrichment-pipeline`

New types of overlays (security alerts, linters, etc.) must be implementable by adding a new `EnrichmentProvider` without altering the core document models or API contracts.

### 3.2 Constraints

#### Dual Authentication

- [ ] `p2` - **ID**: `cpt-cyberwiki-constraint-auth`

The system must support both session cookies (for the browser frontend) and Bearer tokens (for API/CLI access) simultaneously on all protected routes.

## 4. Data Models

### 4.1 User Management Models

**UserProfile:**
```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=UserRole.choices)
    sso_provider = models.CharField(max_length=50, null=True)
    last_sso_login = models.DateTimeField(null=True)
    settings = models.JSONField(default=dict)  # User preferences
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**ApiToken:**
```python
class ApiToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)  # "CLI Access", "CI/CD"
    token = models.CharField(max_length=64, unique=True)
    last_used_at = models.DateTimeField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @staticmethod
    def generate_token() -> str:
        return secrets.token_urlsafe(48)
```

**FavoriteRepository:**
```python
class FavoriteRepository(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    repository_id = models.CharField(max_length=255)  # "projectkey_reposlug"
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [['user', 'repository_id']]
```

**RecentRepository:**
```python
class RecentRepository(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    repository_id = models.CharField(max_length=255)
    last_viewed_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [['user', 'repository_id']]
        ordering = ['-last_viewed_at']
```

**RepositoryViewMode:**
```python
class RepositoryViewMode(models.Model):
    class ViewMode(models.TextChoices):
        DEVELOPER = 'developer'  # Raw file tree
        DOCUMENT = 'document'    # Filtered doc tree
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    repository_id = models.CharField(max_length=255)
    view_mode = models.CharField(max_length=20, choices=ViewMode.choices)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = [['user', 'repository_id']]
```

### 4.2 Wiki Models

**FileComment:**
```python
class FileComment(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open'
        RESOLVED = 'resolved'
    
    class AnchoringStatus(models.TextChoices):
        ANCHORED = 'anchored'  # Comment still at original location
        MOVED = 'moved'        # Line moved, comment re-anchored
        OUTDATED = 'outdated'  # Cannot re-anchor
        DELETED = 'deleted'    # Line deleted
    
    # User and source
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    source_uri = models.CharField(max_length=500, db_index=True, null=True)
    
    # Git repository information
    git_provider = models.CharField(max_length=50)  # 'github', 'bitbucket_server'
    project_key = models.CharField(max_length=255)
    repo_slug = models.CharField(max_length=255)
    branch = models.CharField(max_length=255)
    file_path = models.CharField(max_length=1000)
    
    # Raw mapping (line-based)
    line_start = models.PositiveIntegerField(null=True)
    line_end = models.PositiveIntegerField(null=True)
    
    # Rendered mapping (block-based)
    block_id = models.CharField(max_length=200, null=True)
    block_type = models.CharField(max_length=50, null=True)
    
    # Line anchoring (for tracking comments when code changes)
    line_content = models.TextField(blank=True)
    line_content_hash = models.CharField(max_length=64, blank=True)
    context_before = models.JSONField(default=list)  # 2-3 lines before
    context_after = models.JSONField(default=list)   # 2-3 lines after
    file_version_hash = models.CharField(max_length=40, blank=True)
    commit_sha = models.CharField(max_length=40, blank=True)
    original_line_number = models.PositiveIntegerField(null=True)
    anchoring_status = models.CharField(max_length=20, choices=AnchoringStatus.choices)
    computed_line_number = models.PositiveIntegerField(null=True)
    
    # Comment content
    text = models.TextField()
    is_resolved = models.BooleanField(default=False)
    
    # Threading
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True)
    thread_id = models.CharField(max_length=100, null=True, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**UserChange:**
```python
class UserChange(models.Model):
    class Status(models.TextChoices):
        ADDED = 'added'        # Pending changes
        COMMITTED = 'committed'  # Committed to PR
        REJECTED = 'rejected'  # Discarded
    
    repository_full_name = models.CharField(max_length=255)  # "REAL/cyber-repo"
    file_path = models.CharField(max_length=1024)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    original_content = models.TextField()
    modified_content = models.TextField()
    diff_hunks = models.JSONField(default=list)  # Unified diff format
    status = models.CharField(max_length=20, choices=Status.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Space, Document, GitSyncConfig:**
```python
class Space(models.Model):
    slug = models.SlugField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Document(models.Model):
    space = models.ForeignKey(Space, on_delete=models.CASCADE)
    title = models.CharField(max_length=500)
    path = models.CharField(max_length=1000)
    content = models.TextField(blank=True)
    doc_type = models.CharField(max_length=20)  # 'markdown', 'code'
    git_path = models.CharField(max_length=1000, blank=True)
    git_branch = models.CharField(max_length=255, default='main')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class GitSyncConfig(models.Model):
    space = models.OneToOneField(Space, on_delete=models.CASCADE)
    repo_url = models.CharField(max_length=1000)
    branch = models.CharField(max_length=255, default='main')
    base_path = models.CharField(max_length=1000, default='/')
    direction = models.CharField(max_length=20)  # 'git_to_wiki', 'wiki_to_git', 'bidirectional'
    status = models.CharField(max_length=20)  # 'synced', 'conflict', 'pending', 'error'
    last_sync_at = models.DateTimeField(null=True)
```

### 4.3 Git Provider Models

**GitToken:**
```python
class GitToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    provider = models.CharField(max_length=32)  # 'github', 'bitbucket_server'
    base_url = models.CharField(max_length=255, null=True)  # For self-hosted
    confluence_url = models.CharField(max_length=255, null=True)
    jira_url = models.CharField(max_length=255, null=True)
    jira_email = models.EmailField(max_length=255, null=True)
    
    # Encrypted tokens (Fernet encryption)
    _token = models.BinaryField(null=True, db_column='token')
    _zta_token = models.BinaryField(null=True, db_column='zta_token')
    _confluence_token = models.BinaryField(null=True, db_column='confluence_token')
    _jira_token = models.BinaryField(null=True, db_column='jira_token')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def set_token(self, plaintext: str) -> None:
        """Encrypt and store token."""
        self._token = Fernet(encryption_key).encrypt(plaintext.encode())
    
    def get_token(self) -> str | None:
        """Decrypt and return token."""
        if not self._token:
            return None
        return Fernet(encryption_key).decrypt(bytes(self._token)).decode()
```

---

## 5. Technical Architecture

### 5.1 Domain Model

**Technology**: Django ORM

**Core Entities**:

| Entity | Description | Schema |
|--------|-------------|--------|
| User | User accounts, roles, and preferences | `users/models.py` |
| Repository | Git repository configuration and sync state | `wiki/models.py` |
| FileComment | Inline comment data linked to a SourceAddress | `enrichment_provider/models.py` |
| GitSyncConfig | Credentials and configuration for repository sync | `git_provider/models.py` |

### 5.2 Component Model

#### Enrichment Provider System

- [ ] `p2` - **ID**: `cpt-cyberwiki-component-enrichment-provider`

##### Why this component exists

To provide a generalized, unified way to attach various types of metadata to source files across different repositories.

##### Responsibility scope

Aggregating enrichments from multiple sub-providers (`CommentEnrichmentProvider`, `PREnrichmentProvider`) and formatting them into a standard dual-mapped payload (`RawMapping` and `RenderedMapping`).

##### Responsibility boundaries

Does not handle Git syncing or file parsing directly.

##### Related components (by ID)

- `cpt-cyberwiki-component-git-provider` — depends on for PR diffs.

#### Tree Builder

- [ ] `p2` - **ID**: `cpt-cyberwiki-component-tree-builder`

##### Why this component exists

To transform flat directory structures into hierarchical navigation trees suitable for the frontend.

##### Responsibility scope

Parsing `.cyberwiki.yml`, filtering paths, extracting human-readable titles (`title_extractor.py`), and generating `TreeNode` structures based on the requested mode (Developer vs Document).

##### Responsibility boundaries

Does not handle HTTP requests or database persistence.

### 5.3 API Contracts

- **Contracts**: `cpt-cyberwiki-contract-backend-api`
- **Technology**: REST (Django REST Framework)
- **Location**: `/api/schema/` (drf-spectacular)

**Endpoints Overview**:

| Method | Path | Description | Stability |
|--------|------|-------------|-----------|
| `GET/POST` | `/api/auth/*` | Login, logout, SSO | stable |
| `GET/PUT` | `/api/user_management/v1/*` | User preferences | stable |
| `GET` | `/api/wiki/repositories/{id}/tree/` | Repository file/document tree | stable |
| `GET/POST` | `/api/enrichments/` | Fetch and interact with enrichments | stable |

### 5.4 Internal Dependencies

| Dependency Module | Interface Used | Purpose |
|-------------------|----------------|----------|
| `wiki` | ORM / Functions | Depends on `git_provider` to access raw files for tree building. |
| `enrichment_provider` | ORM / Interface | Depends on `users` for comment authorship and auth. |

### 5.5 External Dependencies

| Dependency Module | Interface Used | Purpose |
|-------------------|---------------|---------|
| Git Servers | Git Protocol / HTTP | Cloning and pulling remote repositories (via `GitPython`). |
| OIDC Provider | Authlib | SSO authentication (if enabled). |

### 5.6 Interactions & Sequences

#### Enrichment Request Flow

**ID**: `cpt-cyberwiki-seq-fetch-enrichments`

```mermaid
sequenceDiagram
    Frontend->>API: GET /api/enrichments/?source_uri=...
    API->>ProviderSystem: query_all_providers(source_uri)
    ProviderSystem->>CommentProvider: fetch(source_uri)
    ProviderSystem->>PRProvider: fetch(source_uri)
    ProviderSystem-->>API: Unified Enrichment Payload
    API-->>Frontend: JSON Response
```

### 5.7 Database schemas & tables

For detailed schema, refer to Django migrations in `users`, `wiki`, `git_provider`, and `enrichment_provider` apps.

## 6. Additional context

- **Stack**: Django 5.2, Python, SQLite (dev) / PostgreSQL (prod).
- **Background Tasks**: APScheduler runs within the Django process (or as a separate worker) to pull repository updates periodically.
- **Left Menu Navigation & Tree Building**: The backend supports two navigation modes for repositories (Developer Mode and Document Mode). Key components include `tree_builder.py` for constructing hierarchical tree structures, `config_parser.py` for parsing `.cyberwiki.yml` repository configuration, and `title_extractor.py` for extracting human-readable titles from markdown files.

### 6.1 Use Case Realizations

This section shows how each PRD use case flows through the backend architecture.

#### 6.1.1 Use Case: Edit and Commit a Document
**ID**: `cpt-cyberwiki-usecase-edit-commit`

**Backend Flow**:
1. Receive save request: `POST /api/wiki/documents/:docId/commit`
2. Validate content using `LinkValidator` and `SchemaValidator`
3. Create `UserChange` record with status='pending'
4. If approval workflow enabled, await admin approval
5. On approval, commit to Git using `git_provider` abstraction
6. Update `Space.last_sync_at`

**Components**: `wiki.views`, `wiki.models.UserChange`, `git_provider.factory`

**Requirements**: `cpt-cyberwiki-fr-save-commit`, `cpt-cyberwiki-fr-pending-changes`, `cpt-cyberwiki-fr-change-approval`

#### 6.1.2 Use Case: Authenticate and Configure Git Credentials
**ID**: `cpt-cyberwiki-usecase-auth-configure`

**Backend Flow**:
1. User authentication via `POST /api/auth/login` or OIDC flow
2. Save Git credentials: `POST /api/git-provider/credentials`
3. Encrypt token with Fernet cipher
4. Store in `GitToken` model
5. Test connection via provider API

**Components**: `users.auth_views`, `git_provider.views`, `git_provider.models.GitToken`

**Requirements**: `cpt-cyberwiki-fr-authentication`, `cpt-cyberwiki-fr-vcs-authentication`, `cpt-cyberwiki-nfr-credential-security`

#### 6.1.3 Use Case: Browse Repository File Tree
**ID**: `cpt-cyberwiki-usecase-browse-repo`

**Backend Flow**:
1. Fetch repository metadata: `GET /api/repositories/:id`
2. Build file tree: `tree_builder.build_file_tree()` for raw directory structure
3. Build document tree: `tree_builder.build_document_tree()` + `title_extractor.extract_title()` for titled hierarchy
4. Persist view mode preference in `UserProfile`

**Components**: `wiki.views`, `tree_builder.py`, `title_extractor.py`, `config_parser.py`

**Requirements**: `cpt-cyberwiki-fr-browse-spaces`, `cpt-cyberwiki-fr-file-tree-navigation`, `cpt-cyberwiki-fr-document-index`, `cpt-cyberwiki-fr-title-extraction`

#### 6.1.4 Use Case: View File Content with Inline Comments
**ID**: `cpt-cyberwiki-usecase-view-file-comments`

**Backend Flow**:
1. Fetch file content: `source_provider.git_source.get_content()`
2. Fetch enrichments: `enrichment_provider.views.get_enrichments()`
3. Query `FileComment` records for source address
4. Return comments with line anchoring data
5. On new comment: Create `FileComment` with line range

**Components**: `source_provider.git_source`, `enrichment_provider.comment_enrichment`, `wiki.models.FileComment`

**Requirements**: `cpt-cyberwiki-fr-file-content-display`, `cpt-cyberwiki-fr-inline-comments`, `cpt-cyberwiki-fr-comment-line-anchoring`

#### 6.1.5 Use Case: View PRs and Navigate to VCS Provider
**ID**: `cpt-cyberwiki-usecase-view-pr`

**Backend Flow**:
1. List PRs: `git_provider.list_pull_requests()`
2. Fetch PR diff: `git_provider.get_pull_request_diff()`
3. Map diff to enrichments via `pr_enrichment.py`
4. Return PR metadata with external URL

**Components**: `git_provider.providers.github/bitbucket_server`, `enrichment_provider.pr_enrichment`

**Requirements**: `cpt-cyberwiki-fr-pr-listing`, `cpt-cyberwiki-fr-pr-diff-review`, `cpt-cyberwiki-fr-vcs-backend`

---

### 6.2 Core Logic & Algorithms

#### 6.2.1 Comment Line Anchoring Algorithm

**Purpose**: Persist comment positions across content changes using fuzzy matching

```python
def anchor_comment(comment: FileComment, old_content: str, new_content: str):
    old_lines = old_content.split('\n')
    context = old_lines[max(0, comment.line_start-3):comment.line_end+3]
    
    new_lines = new_content.split('\n')
    best_match_line = find_best_match(context, new_lines)
    
    if best_match_line:
        offset = best_match_line - comment.line_start
        comment.line_start += offset
        comment.line_end += offset
    else:
        comment.stale = True
    comment.save()
```

**Requirements**: `cpt-cyberwiki-fr-comment-line-anchoring`, `cpt-cyberwiki-fr-comment-persistence`

#### 6.2.2 Git Sync Conflict Detection

**Purpose**: Detect conflicts between local changes and remote commits

```python
def detect_conflicts(space: Space) -> List[Conflict]:
    pending_changes = UserChange.objects.filter(space=space, status='pending')
    provider = get_provider(space.repo_url)
    remote_commits = provider.get_commits_since(space.last_sync_at)
    
    conflicts = []
    for change in pending_changes:
        if has_remote_changes(change, remote_commits):
            try:
                merged = three_way_merge(change.base, change.content, remote)
                change.content = merged
            except MergeConflict:
                conflicts.append(change)
    return conflicts
```

**Requirements**: `cpt-cyberwiki-fr-conflict-detection`, `cpt-cyberwiki-fr-git-sync`

#### 6.2.3 Title Extraction Strategy

**Purpose**: Extract document titles using configurable strategies

```python
def extract_title(file_path: str, strategy: str) -> str:
    if strategy == 'first_heading':
        return extract_first_markdown_heading(file_path)
    elif strategy == 'frontmatter':
        return extract_yaml_frontmatter_title(file_path)
    elif strategy == 'filename':
        return os.path.splitext(os.path.basename(file_path))[0].replace('_', ' ').title()
    return file_path
```

**Requirements**: `cpt-cyberwiki-fr-title-extraction`

---

### 6.3 Configuration

#### 6.3.1 Environment Variables

```bash
# Django settings
SECRET_KEY=<random-secret-key>
DEBUG=False
DATABASE_URL=postgresql://user:pass@localhost/cyberwiki

# Encryption
ENCRYPTION_KEY=<fernet-key>

# OIDC (optional)
OIDC_PROVIDER_URL=https://auth.example.com
OIDC_CLIENT_ID=cyberwiki
OIDC_CLIENT_SECRET=<secret>

# Git sync
SYNC_INTERVAL_MINUTES=5
```

#### 6.3.2 Repository Configuration (.cyberwiki.yml)

```yaml
# Document index configuration
document_index:
  included_extensions: ['.md', '.mdx', '.rst']
  excluded_paths: ['**/node_modules/**', '**/.git/**']
  title_strategy: 'first_heading'  # or 'frontmatter', 'filename'
  frontmatter_field: 'title'
  
# Custom ordering (optional)
custom_order:
  - path: 'README.md'
    title: 'Overview'
  - section: 'Architecture'
    children:
      - 'docs/architecture/overview.md'
      - 'docs/architecture/components.md'
```

---

### 6.4 Error Handling Strategy

#### 6.4.1 API Error Responses

**Standard Format**:
```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": {},
  "timestamp": "2026-04-01T22:35:00Z"
}
```

**Error Codes**:
- `AUTH_REQUIRED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (422)
- `CONFLICT` (409)
- `INTERNAL_ERROR` (500)

#### 6.4.2 Git Provider Retry Logic

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
def call_git_api(url: str):
    response = requests.get(url)
    if response.status_code in [429, 502, 503]:
        raise TransientError()
    return response.json()
```

**Requirements**: `cpt-cyberwiki-nfr-availability`, `cpt-cyberwiki-nfr-recovery`

---

### 6.5 Performance Optimizations

#### 6.5.1 Database Query Optimization

```python
# Select related for joins
comments = FileComment.objects.filter(
    source_address=addr
).select_related('user', 'parent').prefetch_related('replies')

# Database indexes
class Meta:
    indexes = [
        models.Index(fields=['source_address', 'line_start']),
        models.Index(fields=['user', 'created_at'])
    ]
```

**Requirements**: `cpt-cyberwiki-nfr-search-latency`, `cpt-cyberwiki-nfr-save-latency`

#### 6.5.2 Caching Strategy

```python
from django.core.cache import cache

def get_file_tree(repo_id: int):
    cache_key = f'file_tree:{repo_id}'
    tree = cache.get(cache_key)
    if tree is None:
        tree = build_file_tree(repo_id)
        cache.set(cache_key, tree, timeout=300)
    return tree
```

**Requirements**: `cpt-cyberwiki-nfr-repo-list-performance`

#### 6.5.3 Background Task Processing

```python
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()
scheduler.add_job(
    func=sync_all_repositories,
    trigger=IntervalTrigger(minutes=5),
    id='sync_repositories'
)
scheduler.start()
```

**Requirements**: `cpt-cyberwiki-fr-git-sync`

## 7. Traceability

- **Features**: Repository Sync, Tree Building, Enrichment API
