# CyberWiki

Collaborative documentation platform with Git integration - convert your git code to a docs portal.

## Multi-Repo Workspace Structure

This repository contains documentation and deployment scripts for the CyberWiki project. The actual source code is organized in separate repositories:

- **Backend**: `.workspace-sources/cyberfabric/cyber-wiki-back` - Django REST API
- **Frontend**: `.workspace-sources/cyberfabric/cyber-wiki-front` - React web application
- **Docs**: `docs/` - Technical specifications and design documents

## Quick Start

### Prerequisites

- Python 3.14+
- Node.js 18+ (for frontend)
- Git

### Running Locally

From this repository root:

```bash
./scripts/run-local.sh
```

This will:
1. Start the backend on http://localhost:8000
2. Start the frontend on http://localhost:3000 (if available)
3. Auto-create admin user (admin/admin)

### First Time Setup

1. **Clone the workspace sources** (if not already cloned):
   ```bash
   cd .workspace-sources/cyberfabric
   git clone https://github.com/cyberfabric/cyber-wiki-back
   git clone https://github.com/cyberfabric/cyber-wiki-front
   ```

2. **Setup backend**:
   ```bash
   cd .workspace-sources/cyberfabric/cyber-wiki-back
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   ```

3. **Setup frontend** (when available):
   ```bash
   cd .workspace-sources/cyberfabric/cyber-wiki-front
   npm install
   ```

4. **Run from main repo**:
   ```bash
   cd /path/to/cyber-wiki
   ./scripts/run-local.sh
   ```

## Repository Structure

```
cyber-wiki/                          # Main repo (this one)
├── docs/                            # Technical documentation
│   └── specs/                       # Design specifications
│       ├── backend/DESIGN.md        # Backend architecture
│       ├── frontend/DESIGN.md       # Frontend architecture
│       ├── PRD.md                   # Product requirements
│       └── GAPS.md                  # Implementation gaps
├── scripts/                         # Deployment & utility scripts
│   └── run-local.sh                 # Local development runner
├── .workspace-sources/              # Linked source repositories
│   └── cyberfabric/
│       ├── cyber-wiki-back/         # Backend Django app
│       └── cyber-wiki-front/        # Frontend React app
└── .cypilot-workspace.toml          # Workspace configuration
```

## Documentation

- **[Product Requirements](docs/specs/PRD.md)** - Feature requirements and use cases
- **[Backend Design](docs/specs/backend/DESIGN.md)** - Backend architecture and API design
- **[Frontend Design](docs/specs/frontend/DESIGN.md)** - Frontend architecture and components
- **[Implementation Gaps](docs/specs/GAPS.md)** - Current implementation status

## Development

### Backend

See [Backend README](.workspace-sources/cyberfabric/cyber-wiki-back/README.md) for detailed backend development instructions.

Key endpoints:
- API: http://localhost:8000/api/
- Admin: http://localhost:8000/admin/
- API Docs: http://localhost:8000/api/docs/

### Frontend

See Frontend README (when available) for frontend development instructions.

## Architecture

CyberWiki is built with:
- **Backend**: Django 5.2 + Django REST Framework
- **Frontend**: React (planned)
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Git Integration**: GitPython for repository operations

## Contributing

This is a multi-repo workspace. When making changes:
1. Backend changes go in `.workspace-sources/cyberfabric/cyber-wiki-back`
2. Frontend changes go in `.workspace-sources/cyberfabric/cyber-wiki-front`
3. Documentation and deployment scripts go in this main repo
