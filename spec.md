# Feature Set 4: Protected Booking Admin Page

## Overview

Add a protected booking-management page at `/admin/bookings`. The page is rendered by the server, but its booking list is fetched and maintained by client-side JavaScript through the JSON API. Signed-out visitors are redirected to `/login`. A signed-in administrator can view and manage every booking; another signed-in user can view and manage only bookings that include a passenger whose email matches that user's email.

The page must support editing a booking and deleting it. Successful mutations update the visible list without a full-page reload. Authorization is enforced in the API/model request path as well as by the page middleware; hiding controls in the browser is not an authorization boundary.

The existing application stores bookings in the `confirmations` collection/array. In the current file-backed model, each record has `id`, `createdAt`, `scheduleId`, `tripId`, `ticketClass`, `selectedDay`, and `passengers[]`. Each passenger contains `firstName`, `lastName`, `email`, and `phone`. Keep the public booking identifier as `id`; the UI may label the records “bookings” while the existing persistence collection remains `confirmations`.

## Scope and Assumptions

- Authentication and session creation are prerequisites supplied by the application's authentication work. This feature consumes the authenticated user and role; it does not define password storage, registration, or an identity provider.
- The current repository does not yet contain login/session middleware or an admin dashboard route. Integrate with the project’s chosen authentication implementation. If that implementation has not been added, this feature must add the minimum login/session integration needed to establish `req.user`; do not treat a request-supplied email or role as identity.
- The authenticated principal is available server-side as `req.user = { id, email, role }`. `role` is `admin` for administrators and a non-admin value for ordinary users. Normalize email comparisons by trimming and lowercasing both values.
- The existing `confirmations` data shape remains the canonical booking schema. Do not introduce a duplicate bookings collection as part of this feature.
- The dashboard link is visible to administrators. Ordinary users can use `/admin/bookings` to manage their own bookings, but are not given access to the administrator dashboard.

## Data and Session Model

### Booking

Persisted record (existing model):

```json
{
	"id": "JRYTW6NZSY",
	"createdAt": "2026-09-21T18:24:23.881Z",
	"scheduleId": "11",
	"tripId": "romantic-gorge",
	"ticketClass": "standard",
	"selectedDay": "wednesday",
	"passengers": [
		{
			"firstName": "Draco",
			"lastName": "Dragon",
			"email": "draco.dragon@email.com",
			"phone": "1234567890"
		}
	]
}
```

`id` and `createdAt` are immutable through the update API. Editable booking fields are `scheduleId`, `tripId`, `ticketClass`, `selectedDay`, and `passengers`. Passenger updates replace the passenger array; validate that it is a non-empty array of objects with non-empty first name, last name, and email. Phone may be an empty string if the existing booking form permits it. Reject unknown properties and attempts to change `id` or `createdAt`.

### Authenticated session

The server-side session (or equivalent trusted auth context) must expose:

```json
{
	"user": {
		"id": "user-id",
		"email": "traveler@example.com",
		"role": "user"
	}
}
```

The session is established by the authentication system and is not populated from API request bodies. Booking ownership is true when at least one `booking.passengers[].email` equals `req.user.email` after trim/lowercase normalization. An administrator may access any booking regardless of passenger email.

## Page Routes

| Method and path | Access | Behavior and response |
| --- | --- | --- |
| `GET /login` | Public | Existing login page. The protected page redirects here when no authenticated user is present. Preserve a safe local return target, such as `returnTo=/admin/bookings`, after successful login. |
| `GET /admin` | Admin | Admin dashboard. Include a link to `/admin/bookings`. If this dashboard is not already supplied by the authentication work, add a minimal dashboard route/view as part of this feature. Non-admin users receive `403`; signed-out users are redirected to `/login`. |
| `GET /admin/bookings` | Any authenticated user | Render the booking management shell. Do not embed the booking list in server-rendered HTML; the page JavaScript fetches it from `GET /api/bookings`. Signed-out users receive a redirect to `/login?returnTo=%2Fadmin%2Fbookings`. |

For page requests, signed-out access redirects with `302 Found`; authenticated but unauthorized access returns a rendered `403 Forbidden` page (or the app's standard 403 response). The login return target must be a relative local path; reject external redirect targets.

## JSON API

All endpoints below are mounted under `/api`. JSON error responses use `{ "error": "Human-readable message" }`. API requests never redirect to HTML login pages: missing authentication returns JSON `401`.

### List bookings

`GET /api/bookings`

Authentication required. Administrators receive all bookings. Other authenticated users receive only records where their email matches a passenger email. The server performs this filtering; clients cannot widen it with query parameters.

Success: `200 OK`

```json
{
	"bookings": [
		{
			"id": "JRYTW6NZSY",
			"createdAt": "2026-09-21T18:24:23.881Z",
			"scheduleId": "11",
			"tripId": "romantic-gorge",
			"ticketClass": "standard",
			"selectedDay": "wednesday",
			"passengers": [
				{
					"firstName": "Draco",
					"lastName": "Dragon",
					"email": "draco.dragon@email.com",
					"phone": "1234567890"
				}
			]
		}
	]
}
```

An authorized user with no matching bookings receives `200 OK` and `{ "bookings": [] }`. Missing/invalid authentication returns `401 Unauthorized`.

### Update a booking

`PUT /api/bookings/:bookingId`

Authentication required. The caller must be an administrator or a passenger on the selected booking. Send all editable fields as a complete replacement, which avoids ambiguous partial passenger edits:

```json
{
	"scheduleId": "11",
	"tripId": "romantic-gorge",
	"ticketClass": "standard",
	"selectedDay": "wednesday",
	"passengers": [
		{
			"firstName": "Draco",
			"lastName": "Dragon",
			"email": "draco.dragon@email.com",
			"phone": "1234567890"
		}
	]
}
```

Success: `200 OK`, returning `{ "booking": <updated booking> }`. Preserve the existing `id` and `createdAt`. Validation errors return `400 Bad Request`; missing authentication returns `401 Unauthorized`; a booking that does not exist returns `404 Not Found`; an authenticated caller who is neither an admin nor a passenger receives `403 Forbidden`. Persistence failures return `500 Internal Server Error` with a generic error message (details are logged server-side).

### Delete a booking

`DELETE /api/bookings/:bookingId`

Authentication required. The caller must be an administrator or a passenger on the selected booking. No request body is required.

Success: `200 OK` with `{ "message": "Booking deleted", "id": "JRYTW6NZSY" }`. Missing authentication returns `401 Unauthorized`; a nonexistent booking returns `404 Not Found`; a caller who does not own the booking and is not an admin receives `403 Forbidden`; persistence failures return `500 Internal Server Error`.

For both mutation endpoints, load the booking and authorize against its currently stored passenger list before changing or deleting it. Do not authorize an update based on the passenger list supplied in the request. This prevents a user from taking ownership by first changing the booking's email address.

## User Experience and Authorization

- **Signed out:** Visiting `/admin/bookings` redirects to the login page and preserves the local return path. API calls return `401` JSON. No booking details are rendered or exposed in the page response.
- **Signed-in administrator:** `/admin` shows the protected-bookings link. `/admin/bookings` loads every booking. Edit and delete actions are available for every row. Successful changes replace/remove the corresponding row immediately and show a concise success state; failures show an error and keep the current row/list intact.
- **Signed-in non-admin:** `/admin` is forbidden and the admin dashboard link is not shown. `/admin/bookings` loads only bookings containing a passenger with the user's email. Edit and delete actions are available only for those records. Attempts to use another booking's identifier through the API receive `403` (or `404` if the booking does not exist).
- **Loading and empty states:** The list shows a loading indicator while fetching. A successful empty response shows an explicit “No bookings found” state. Fetch or mutation errors are announced accessibly and do not silently clear existing rows.
- **Mutation flow:** Confirm deletion before sending the request. Disable the affected row's controls while a mutation is pending to prevent duplicate submissions. After update, render the server-returned booking; after delete, remove the row. Do not require a page reload.
- **Data safety:** Escape passenger and booking values when rendering. Never trust client-supplied role/email values or rely on disabled/hidden controls for authorization.

## Implementation Boundaries

- Add model functions to retrieve bookings visible to a user, find a booking by ID, update editable fields, and delete by ID. Keep storage access in the model rather than embedding it in route handlers.
- Add controller functions for listing, updating, and deleting bookings. Controllers handle validation and HTTP status/JSON response mapping.
- Add API routes for `GET /bookings`, `PUT /bookings/:bookingId`, and `DELETE /bookings/:bookingId`, protected by authentication middleware. Mutation authorization must be checked against stored data.
- Add a protected page route and view for `/admin/bookings`, client-side JavaScript for loading/rendering/mutations, and the admin dashboard link.
- Use the project's current persistence abstraction consistently. If the JSON-backed model is still the active booking store, operations must persist through its existing save mechanism; do not write directly to the JSON file from the controller.

## Test Plan

### Model and authorization tests

- Listing as admin returns every confirmation, including bookings with no passenger matching the admin email.
- Listing as an ordinary user returns only bookings with at least one matching passenger email; comparison ignores email case and surrounding whitespace.
- A user matching any one passenger in a multi-passenger booking is treated as an owner.
- Updating a booking changes editable fields while preserving `id` and `createdAt`.
- Deleting a booking removes it from storage and subsequent lists.
- Updating/deleting as an owner succeeds; updating/deleting a non-owned booking as a non-admin is denied; an admin may update/delete either booking.
- A request that tries to change `id` or `createdAt`, includes unknown fields, or has invalid/missing editable values is rejected without modifying stored data.
- Updating a booking to include the caller as a passenger does not grant permission unless the caller was already an owner (or admin) before the update.

### API tests

- `GET /api/bookings` without authentication returns `401` JSON; an admin receives all bookings; a user receives only owned bookings; no matches returns `200` with an empty array.
- `PUT /api/bookings/:bookingId` returns `200` and the updated booking for an authorized valid request; returns `400`, `401`, `403`, `404`, or `500` for the corresponding invalid, unauthenticated, unauthorized, missing, or persistence-failure case.
- `DELETE /api/bookings/:bookingId` returns `200` for authorized deletion and the corresponding `401`, `403`, `404`, or `500` response for failure cases.
- API failures return JSON and do not redirect to the login page.
- Client-supplied `email` or `role` values cannot change the authenticated identity or authorization result.

### Page and client tests

- Signed-out `GET /admin/bookings` redirects to `/login` with a safe local return target; signed-in user receives the page; admin dashboard allows admins and rejects signed-in non-admins.
- The dashboard renders the `/admin/bookings` link for admins and omits it for non-admins.
- The booking list is populated by a client-side API request, not embedded in the initial page response.
- The client renders loading, empty, and error states.
- A successful edit updates the corresponding visible booking without navigation or reload; an edit failure leaves the prior booking visible and reports the error.
- A successful confirmed delete removes the row without reload; canceling confirmation makes no API request; a delete failure leaves the row visible and reports the error.
- Exercise both admin and ordinary-user sessions in browser-level coverage to verify the visible records/actions match the server-enforced scope.
