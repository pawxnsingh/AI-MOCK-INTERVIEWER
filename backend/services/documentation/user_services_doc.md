# User Services Documentation

This document provides a detailed overview of the user-related services, which handle the business logic for user creation, profile management, and referrals.

## Table of Contents
- [`create_or_get_user`](#create_or_get_user)
- [`get_user_profile`](#get_user_profile)
- [`link_referral_code`](#link_referral_code)
- [`get_all_referred_users`](#get_all_referred_users)

---

### `create_or_get_user`
Creates a new user or retrieves an existing one based on their Google ID and email.

- **Parameters**:
  - `user_data`: A dictionary containing `user_google_id`, `email`, and `username`.
- **Process**:
  1. Generates a deterministic UUID for the user.
  2. Checks if a user with the same UUID, email, or username already exists.
  - If the user is new, it creates a new `User` record with default values, including 20 free credits and a unique referral code.
  - If the user exists, it updates their `last_login` time.
- **Returns**: A dictionary containing the `userId` and a `user` object with profile details.

### `get_user_profile`
Retrieves the profile information for a given user UUID.

- **Parameters**: `user_uuid`.
- **Process**:
  - Fetches the user from the database.
  - If the user belongs to an organization, it retrieves the organization's name.
  - Updates the user's `last_login` time.
- **Returns**: A dictionary containing the user's detailed profile information.

### `link_referral_code`
Links a user's account with a referral code.

- **Parameters**:
  - `user_uuid`: The UUID of the user to link.
  - `to_refer_code`: The referral code to apply.
- **Process**:
  - Adds the referral code to the user's `referred_code` field if it's not already set.
- **Returns**: A success or informational message.

### `get_all_referred_users`
Retrieves a list of all users who have used the current user's referral code.

- **Parameters**: `user_uuid`.
- **Returns**: A dictionary containing the user's referral code, the total number of referrals, and a list of the referred users.
