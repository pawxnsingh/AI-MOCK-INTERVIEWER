# Parser Service Documentation

This document provides a detailed overview of the `ParserService` class, which is responsible for parsing documents using the LlamaParse service. It supports both synchronous and asynchronous parsing.

## Table of Contents
- [`parse_document`](#parse_document)
- [`async_parse_document`](#async_parse_document)

---

### `parse_document`
Parses a document synchronously.

- **Parameters**:
  - `media_id`: The integer ID of the media record in the database.
  - `media_uuid`: The UUID of the media file.
- **Process**:
  1. Initializes the `LlamaParse` client.
  2. Retrieves the file path from the `MediaManagementService`.
  3. Calls the `load_data` method of the parser to process the document.
  4. Saves the parsed text into the `parsed_results` table in the database, linking it to the original upload.
  5. Updates the parsing status on the `uploads` table to `COMPLETED`.
- **Returns**: The parsed text as a string.

### `async_parse_document`
Initiates an asynchronous parsing job for a document.

- **Parameters**:
  - `media_id`: The integer ID of the media record.
  - `media_uuid`: The UUID of the media file.
- **Process**:
  1. Creates a unique `job_id` and registers it.
  2. Spawns a background task to perform the parsing.
  3. The background task follows the same parsing and database update logic as the synchronous version.
  4. The status of the job can be tracked via the `job_registry`.
- **Returns**: The `job_id` for the asynchronous parsing task.
