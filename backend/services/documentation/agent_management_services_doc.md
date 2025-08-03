# Agent Management Services Documentation

This document provides a detailed overview of the `AgentManagementServices` class, which is responsible for managing the lifecycle of AI agents in the system. This includes creating, updating, deleting, retrieving, and setting agents as active.

## Table of Contents
- [`create_agent`](#create_agent)
- [`update_agent`](#update_agent)
- [`delete_agent`](#delete_agent)
- [`get_agents`](#get_agents)
- [`set_agent_as_active`](#set_agent_as_active)

---

### `create_agent`
Creates a new agent in the database.

- **Parameters**:
  - `args`: A dictionary containing:
    - `name`: The base name of the agent.
    - `version`: The version of the agent (defaults to "1.0.0").
    - `prompt`: The system prompt for the agent.
    - `llmConfig`: Configuration for the language model.
    - `org_id`: Optional ID of the organization this agent belongs to.
- **Process**:
  - Constructs a standardized agent name by combining the name and version.
  - Generates a UUID for the agent.
  - Checks if an agent with the same name and version already exists.
  - If not, it creates and saves the new agent.
- **Returns**: A tuple `(success, message_dict)`.

### `update_agent`
Updates an existing agent or creates a new version if the specified version does not exist.

- **Parameters**:
  - `args`: A dictionary containing the fields to update, such as `name`, `version`, `prompt`, `llmConfig`, and `org_id`.
- **Process**:
  - If an agent with the given name and version exists, it updates its properties.
  - If the version does not exist but other versions of the agent do, it creates a new agent with the specified version.
- **Returns**: A tuple `(success, message_dict)`.

### `delete_agent`
Deletes an agent from the database.

- **Parameters**:
  - `args`: A dictionary containing `agentUuid`.
- **Process**:
  - Finds the agent by its UUID.
  - Prevents deletion if the agent is currently active.
  - Deletes the agent record from the database.
- **Returns**: `True` on successful deletion.

### `get_agents`
Retrieves all agents from the database and groups them by their base name.

- **Process**:
  - Fetches all agent records.
  - Organizes them into a dictionary where keys are agent names and values are lists of different versions of that agent.
- **Returns**: A dictionary of all agents.

### `set_agent_as_active`
Sets a specific agent version as the active one for its group.

- **Parameters**:
  - `args`: A dictionary containing either `agentUuid` or both `name` and `version`.
- **Process**:
  - Finds the agent to be activated.
  - Deactivates any currently active version of the same agent.
  - Sets the selected agent's `is_active` flag to `True`.
- **Returns**: A tuple `(success, message_dict)`.
