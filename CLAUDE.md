# Claw — Local Claude-Powered AI Agent

## Project Overview

**Claw** is an open, locally-running AI agent built on top of the Claude API. It runs entirely on a MacBook with no cloud backend — all agent logic, tooling, and state live locally. The project is currently greenfield / early-stage.

**Goal:** Build a capable, extensible autonomous agent that uses Claude as its reasoning engine and exposes a clean set of local tools for interacting with files, code, the shell, and other local resources.

## Tech Stack

- **Language:** Python 3.11+
- **Claude SDK:** `anthropic` (Anthropic Python SDK)
- **Package manager:** `uv` (preferred) — fallback to `pip`
- **Virtual environment:** `.venv` in project root
- **Config/secrets:** `.env` file (never commit)
- **Testing:** `pytest`
- **Models:** `claude-opus-4-6` for complex tasks, `claude-sonnet-4-6` as default

## Project Structure

```
Claw projects/
├── CLAUDE.md           # This file
├── main.py             # Agent entrypoint
├── agent/              # Core agentic loop logic
├── tools/              # Agent tool definitions (one file per tool/capability)
├── config/             # Configuration and prompts
├── tests/              # Test suite (mirrors src layout)
├── .env                # API keys and secrets (gitignored)
└── requirements.txt    # Python dependencies
```

## Key Commands

```bash
# First-time setup
uv venv && source .venv/bin/activate
uv pip install -r requirements.txt

# Run the agent
python main.py

# Run tests
pytest tests/

# Run a specific test
pytest tests/test_agent.py -v
```

## Code Style

- Follow PEP 8
- Use type hints on all function signatures
- Max line length: 100 characters
- Prefer `dataclasses` or `pydantic` models for structured data — avoid raw dicts for anything non-trivial
- Use `snake_case` for variables and functions, `PascalCase` for classes
- Keep functions small and single-purpose

## Agent Architecture

- Claw runs an **agentic loop**: send message → receive tool calls → execute tools → loop until done
- **Tool use is central** — every agent capability is expressed as a tool in `tools/`
- Each tool module should define: the tool schema (JSON) and the Python function that executes it
- The agent loop lives in `agent/` and is responsible for message history, tool dispatch, and termination
- Prefer explicit over implicit — tool definitions should have clear, descriptive names and docstrings

## Development Principles

- **Local-first:** No external services or cloud state unless strictly necessary
- **Minimal dependencies:** Add packages only when they provide clear value
- **Secrets in `.env`:** `ANTHROPIC_API_KEY` and any other secrets go in `.env`, never hardcoded
- **Modular tools:** Each tool in its own file under `tools/` — easy to add, remove, or disable
- **Test incrementally:** Write tests for tool functions; integration tests for the agent loop

## Environment

- Platform: macOS (Apple Silicon MacBook)
- Shell: zsh
- Python managed via `uv` or system Python 3.11+
