# Media Management Service Documentation

This document provides a detailed overview of the `MediaManagementService` class, which handles all aspects of media file management, including ingestion, storage, retrieval, and deletion.

## Table of Contents
- [`ingest_media`](#ingest_media)
- [`get_media_metadata`](#get_media_metadata)
- [`get_media_file`](#get_media_file)
- [`delete_media`](#delete_media)
- [`get_media_content`](#get_media_content)

---

### `ingest_media`
Ingests a media file into the system.

- **Parameters**:
  - `file_binary`: The binary content of the file.
  - `file_name`: The original name of the file.
  - `user_uuid`: The UUID of the user uploading the file.
  - `to_parse`: A boolean indicating if the file should be parsed.
- **Process**:
  1. Calculates a SHA256 hash of the file content.
  2. Generates a deterministic UUID for the media based on the file hash and user UUID.
  3. Saves the file to the `data/raw` directory.
  4. Stores metadata about the file in a `mediaMap.json` file and in the `uploads` database table.
  5. Checks for existing files to avoid duplicates.
- **Returns**: A tuple `(is_exists, result_dict)`, where `is_exists` is a boolean indicating if the file already existed, and `result_dict` contains the `mediaId` and metadata.

### `get_media_metadata`
Retrieves metadata for a specific media file.

- **Parameters**: `media_uuid`.
- **Returns**: A dictionary containing the file's metadata.

### `get_media_file`
Retrieves the binary content of a media file.

- **Parameters**: `media_uuid`.
- **Process**:
  - Retrieves metadata to find the file path.
  - Reads the file from the disk.
  - Verifies the file's integrity by comparing its hash with the stored hash.
- **Returns**: The binary content of the file.

### `delete_media`
Deletes a media file and its associated metadata.

- **Parameters**: `media_uuid`.
- **Process**:
  - Deletes the file from the `data/raw` directory.
  - Removes the corresponding entry from `mediaMap.json`.
- **Note**: This does not delete the record from the `uploads` database table, which is handled separately.

### `get_media_content`
Retrieves the content of a media file as a UTF-8 string.

- **Parameters**: `media_uuid`.
- **Returns**: A dictionary containing the file's content and metadata.
- **Raises**: `ValueError` if the file is not valid UTF-8 text.
