# Codex AI Agent Onboarding Guide

## Overview

This document serves as a comprehensive guide for Codex AI agents and new team members working with the Oculus Dei project. It outlines the repository structure, development workflow, and code standards to enable effective collaboration.

---

## Project Overview

**Oculus Dei** is a comprehensive life management system designed to adapt a person's life schedule and goals in response to their evolving intentions. 

> **[PROJECT_SPECIFIC_DETAIL]** *Add 2-3 sentences describing the specific purpose and value proposition of your project.*

The system is built around several core capabilities:
- Project registration and impact analysis
- Adaptive planning and schedule optimization
- Episodic memory storage and retrieval
- Self-reflection and insight generation

---

## Repository Structure

```
OculusDei.ai/
├── backend/                # Backend implementation
│   ├── agent/              # Agent coordination layer
│   ├── api/                # REST API endpoints
│   ├── core/               # Core business logic
│   └── memory/             # Memory storage and retrieval
├── docs/                   # Documentation
│   └── architecture.md     # Architectural overview
├── frontend/               # Frontend implementation (if applicable)
│   └── components/         # UI components
├── tests/                  # Test suite
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
├── .github/                # GitHub workflows
├── AGENTS.md               # This file (agent onboarding)
└── README.md               # Project README
```

> **[PROJECT_SPECIFIC_DETAIL]** *Adjust the directory structure to match your actual project organization.*

### Key Modules

- **Backend/Core**: Contains the core business logic including project registry and life optimizer
- **Backend/Memory**: Implements the memory storage, retrieval, and reflection capabilities
- **Backend/Agent**: Coordinates system responses and manages reflection scheduling
- **Backend/API**: Provides REST endpoints for interacting with the system

> **[PROJECT_SPECIFIC_DETAIL]** *Add any additional modules or replace these with your project's specific components.*

---

## Development Environment Setup

### Prerequisites

- Python 3.9+
- Node.js 16+ (if applicable for frontend)
- Docker (optional, for containerization)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/OculusDei.ai.git
cd OculusDei.ai
```

2. Set up a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with appropriate values
```

> **[PROJECT_SPECIFIC_DETAIL]** *Add any additional setup steps or requirements specific to your project.*

---

## Build and Test Commands

### Running the Application

```bash
# Start the backend server
python -m backend.api.main

# Start the frontend development server (if applicable)
cd frontend
npm run dev
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test categories
pytest tests/unit/
pytest tests/integration/

# Run tests with coverage
pytest --cov=backend
```

### Code Quality Checks

```bash
# Run linting
flake8 backend tests

# Run type checking
mypy backend

# Run formatting
black backend tests
```

### Build and Deployment

```bash
# Build Docker containers
docker-compose build

# Deploy locally with Docker
docker-compose up -d
```

> **[PROJECT_SPECIFIC_DETAIL]** *Customize the commands to match your project's actual run, test, and build procedures.*

---

## Code Style Guidelines

### Python Guidelines

- Use **PEP 8** for code style
- Maximum line length: 88 characters (compatible with Black formatter)
- Use meaningful variable and function names
- Write docstrings for all public modules, functions, classes, and methods
- Type hints should be used for all function parameters and return types

### Naming Conventions

- **Classes**: CamelCase (e.g., `ProjectRegistry`, `MemoryStore`)
- **Functions/Methods**: snake_case (e.g., `get_memory_entries`, `analyze_impact`)
- **Variables**: snake_case (e.g., `memory_store`, `project_id`)
- **Constants**: UPPER_CASE (e.g., `DEFAULT_REFLECTION_INTERVAL`)
- **Private methods/attributes**: Prefix with underscore (e.g., `_private_method`)

### Code Organization

- Keep modules focused on a single responsibility
- Limit file length to 500 lines when practical
- Order imports: standard library, third-party, local application
- Group related functionality in classes or modules

### Documentation

- All public functions must have docstrings following Google style:
```python
def function(param1: str, param2: int) -> bool:
    """
    Short description of function.
    
    Args:
        param1: Description of first parameter
        param2: Description of second parameter
        
    Returns:
        Description of return value
    
    Raises:
        ExceptionType: When and why this exception is raised
    """
```

> **[PROJECT_SPECIFIC_DETAIL]** *Add any project-specific style guidelines or override the above as needed.*

---

## Contribution Workflow

### Branch Naming Convention

- Features: `feature/short-description`
- Bugfixes: `fix/issue-description`
- Documentation: `docs/what-is-changing`
- Refactoring: `refactor/what-is-changing`

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style/formatting changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat(memory): add retrieval by metadata functionality

Implement the ability to search memory entries by metadata fields.
This enables more precise querying of the memory store.

Closes #123
```

### Pull Request Process

1. Create a branch from `main` using the naming convention above
2. Make your changes, committing regularly with appropriate messages
3. Write or update tests for your changes
4. Push your branch and create a Pull Request (PR)
5. Fill in the PR template with all required information
6. Request reviews from appropriate team members
7. Address review comments and update the PR
8. Once approved, merge into `main` (squash preferred for cleaner history)

### CI/CD Pipeline

All PRs trigger the following automated checks:
- Linting (flake8)
- Type checking (mypy)
- Unit tests (pytest)
- Integration tests

All checks must pass before a PR can be merged.

> **[PROJECT_SPECIFIC_DETAIL]** *Customize the CI/CD pipeline description to match your actual setup.*

---

## Instructions for Codex AI

When working with this repository, Codex AI should:

1. **Understand the Architecture**: Read the `docs/architecture.md` file to understand the system design and component interactions.

2. **Follow the Style Guide**: Adhere to the code style guidelines above for all generated code.

3. **Include Tests**: Add or update tests for any code changes, aiming for good test coverage.

4. **Document Changes**: Add appropriate docstrings and comments for any new or modified code.

5. **Respect Component Boundaries**: Maintain clear separation of concerns between system components.

6. **Preserve Core Design Principles**: Ensure changes align with the project's core design principles:
   - Adaptive Intelligence
   - Episodic Awareness
   - Reflective Cognition
   - Intention Preservation
   - Transparency

7. **Add Type Hints**: Ensure all function parameters and return values have appropriate type annotations.

8. **Check for Edge Cases**: Consider and handle potential edge cases and error conditions.

When creating PRs, Codex should:
- Follow the branch naming conventions
- Use conventional commit messages
- Fill out the PR template completely
- Link to any relevant issues
- Clearly describe the changes and their purpose

---

## Troubleshooting Common Issues

> **[PROJECT_SPECIFIC_DETAIL]** *Add common issues and their solutions that team members or AI agents might encounter.*

---

## Additional Resources

- [Project Documentation](./docs/)
- [Python Style Guide (PEP 8)](https://www.python.org/dev/peps/pep-0008/)
- [Conventional Commits](https://www.conventionalcommits.org/)

> **[PROJECT_SPECIFIC_DETAIL]** *Add links to any additional resources that would be helpful.* 