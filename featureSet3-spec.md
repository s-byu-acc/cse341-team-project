# Specification: Week03 Assignment Feature Set 3 - Bookings Management

## 1. Overview

This feature transitions booking management from temporary file-based storage (`confirmations`) to a persistent MongoDB database using Mongoose. It exposes a RESTful JSON API endpoint for bookings, updates EJS controllers to interact with the new Mongoose model, and introduces an admin dashboard (`/bookings-admin`) powered by client-side dynamic hydration.

## 2. Data Model (`src/models/schemas/bookings.js`)

Team Database: `Kizuna-rail-db`
Collection Name: `bookings`

| Field         | Type     | Required     | Description                                                    |
| :------------ | :------- | :----------- | :------------------------------------------------------------- |
| `_id`         | ObjectId | Auto         | Unique document identifier                                     |
| `bookingCode` | String   | Yes (Unique) | Human-readable confirmation code (e.g., `BK-89A12`)            |
| `scheduleId`  | String   | Yes          | Associated train schedule ID                                   |
| `routeId`     | String   | Yes          | Associated route ID                                            |
| `ticketClass` | String   | Yes          | Selected ticket class (e.g., `first`, `standard`, `premium`)   |
| `selectedDay` | String   | Yes          | Scheduled travel day                                           |
| `passengers`  | Array    | Yes          | Array of passenger objects (firstName, lastName, email, phone) |
| `totalAmount` | Number   | Yes          | Calculated total price for the booking                         |
| `createdAt`   | Date     | Auto         | Timestamp of creation (default: `Date.now`)                    |

## 3. Endpoints & Routes

### API Routes (`src/routes/api-routes.js`)

- **GET `/api/bookings`**
  - **Description:** Returns all bookings stored in MongoDB.
  - **Swagger Info:** Tagged under `Bookings`,

* returning HTTP status 200 with an array of booking objects,
* HTTP status 500 on database failure.

### EJS Page Routes (`src/routes/ejs-routes.js`)

- **GET `/routes/booking/:scheduleId`**: Renders the booking form (`src/views/routes/booking.ejs`).
- **POST `/routes/book`**: Processes booking submission, creates document in DB, and redirects to `/routes/confirmation/:confirmationId`.
- **GET `/routes/confirmation/:confirmationId`**: Renders confirmation page (`src/views/routes/confirm.ejs`).
- **GET `/bookings-admin`**: Renders admin dashboard (`src/views/bookings.ejs`).

## 4. Test Plan

1. **API Retrieval:** Call `GET http://localhost:3000/api/bookings`  and verify JSON array response.
2. **Booking Submission:** Fill out customer form on `/routes/booking/:scheduleId`, submit, and confirm redirect to `/routes/confirmation/:bookingCode`.
3. **Database Verification:** Verify new entry in MongoDB `bookings` collection.
4. **Admin Dashboard Hydration:** Visit `/bookings-admin` and verify bookings render dynamically via JavaScript `fetch`.
