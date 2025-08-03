# Agent Services Documentation

This document provides a detailed overview of the `AgentServices` class, which is responsible for executing AI agents to perform specific tasks. The primary method is `generic_agent`, which can run any registered agent.

## Table of Contents
- [`generic_agent`](#generic_agent)

---

### `generic_agent`
Executes a specified AI agent with a given context and returns the result.

- **Parameters**:
  - `args`: A dictionary containing:
    - `uuid` (optional): The UUID of the agent to execute.
    - `name` (optional): The name of the agent to execute. If `uuid` is not provided, the active version of the agent with this name will be used.
    - `context`: The input context or data for the agent to process.
- **Process**:
  1. **Agent Selection**:
     - It retrieves the specified agent from the database, either by its UUID or by finding the active version of an agent with the given name.
  2. **Prompt and Configuration**:
     - It loads the agent's system prompt and determines the expected response format based on the agent's name.
  3. **LLM Call**:
     - It calls the `generate_with_gemini` function, passing the agent's prompt and the input context.
  4. **Response Handling**:
     - It captures metadata about the LLM call (e.g., token usage).
     - It attempts to parse the LLM's response as JSON. If that fails, it returns the raw text.
- **Returns**: A tuple containing:
  - The processed result from the agent (either a dictionary or a string).
  - A dictionary of metadata about the LLM call.
- **Raises**:
  - `ValueError`: If the specified agent is not found in the database.
