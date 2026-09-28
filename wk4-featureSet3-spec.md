# Feature Set 3: Protected User Admin Page Specification

## 1. Overall Feature Description
This feature provides a secured administrative interface for managing users in the Kizuna Rail application. It includes a protected dashboard where authorized users can view, update, and delete user accounts. The UI updates dynamically without page refreshes using client-side JavaScript (`fetch` API).

## 2. Data Model, Session, and Roles
*   **Data Model:** Relies on the `User` schema (to be implemented in Feature 1), containing `_id`, `displayName`, `username`, `email`, `passwordHash`, and `role`.
*   **Roles:** 
    *   `admin`: Can view, update, and delete ALL users.
    *   `standard` (or any non-admin): Can only view, update, and delete THEIR OWN user information.
*   **Session Data:** Requires `req.session.user` to be populated to verify authentication status and role.

## 3. Page Routes and API Endpoints

| Route/Endpoint | Method | Description | Auth Requirement |
| :--- | :--- | :--- | :--- |
| `/admin/users` | GET | Renders the User Admin EJS page. | `requirePageLogin` |
| `/api/users` | GET | Returns JSON list of users. | `requireApiLogin` |
| `/api/users/:id` | PUT | Updates a specific user. Requires JSON body (email, role, etc.). | `requireApiLogin`, Role logic |
| `/api/users/:id` | DELETE | Deletes a specific user. | `requireApiLogin`, Role logic |

*   **Success Status:** `200 OK` for GET, PUT, DELETE.
*   **Error Status:** `401 Unauthorized` (not logged in), `403 Forbidden` (wrong role), `404 Not Found` (user doesn't exist), `500 Server Error`.

## 4. User Experience (UX) Matrix
*   **Signed-out User:** Redirected to the login page when accessing `/admin/users`. API calls return `401 Unauthorized`.
*   **Signed-in Standard User:** Sees only their own account on the Admin Page. Can only update/delete their own record.
*   **Signed-in Admin:** Sees a table of all registered users. Can update or delete any user on the list.

## 5. Detailed Test Plan
1.  **Direct Access Test:** Navigate to `/admin/users` while logged out (expected: bypass for now due to commented middleware, eventually redirect to login).
2.  **Dynamic Load Test:** Open the page; verify the user list loads automatically via a client-side fetch call.
3.  **Update Test:** Click "Edit" on a user, change their display name, and submit. Verify the table updates instantly without a full page reload.
4.  **Delete Test:** Click "Delete" on a user. Verify the user disappears from the table instantly without a full page reload.