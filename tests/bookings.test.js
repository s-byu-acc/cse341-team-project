import { describe, test, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { getDb } from '../src/db/connect.js';

/* A: SET-UP TEST AND VEFIFY ADMIN & USER ARE LOGIN  */
//Global variables to hold our authentication cookies for the tests
let adminCookie;
let customerCookie;

// 1. Updated helper: Now uses 'identifier' instead of 'email' to match auth.js
const loginAndGetCookie = async (identifier, password) => {
  const response = await request(app)
    .post('/login')
    .send({ identifier, password });
  
  // A successful login returns a 302 Redirect with the session cookie
  return response.headers['set-cookie'];
};

beforeEach(async () => {
  const db = getDb();
  
  // 1. Seed Bookings (includes the 'id' field fix)
  // 2. Seed Bookings into BOTH collections to satisfy native MongoDB and Mongoose
  const seedData = [
    {
      id: 'TEST-CUSTOMER-01',
      bookingCode: 'TEST-CUSTOMER-01',
      scheduleId: '1',
      tripId: 'alpine-panorama',
      ticketClass: 'premium',
      selectedDay: 'monday',
      passengers: [{ firstName: 'John', lastName: 'Doe', email: 'customer@kizunarail.com', phone: '000-000-0000' }],
      totalAmount: 10000,
      createdAt: new Date('2026-10-01T10:00:00Z')
    },
    {
      id: 'TEST-OTHER-02',
      bookingCode: 'TEST-OTHER-02',
      scheduleId: '2',
      tripId: 'sakura-valley',
      ticketClass: 'standard',
      selectedDay: 'tuesday',
      passengers: [{ firstName: 'Jane', lastName: 'Smith', email: 'other@kizunarail.com', phone: '111-111-1111' }],
      totalAmount: 5000,
      createdAt: new Date('2026-10-02T10:00:00Z')
    }
  ];

  await db.collection('confirmations').insertMany(seedData);
  await db.collection('bookings').insertMany(seedData);

  // 2. Updated Registration: Matches the exact fields in auth.js
  await request(app).post('/register').send({
    displayName: 'Admin User',
    username: 'adminuser',
    email: 'admin@kizunarail.com',
    password: 'Password123!',
    confirmPassword: 'Password123!'
  });
  
  await request(app).post('/register').send({
    displayName: 'Customer User',
    username: 'customeruser',
    email: 'customer@kizunarail.com',
    password: 'Password123!',
    confirmPassword: 'Password123!'
  });

  // 3. Promote Admin in Database
  const adminRole = await db.collection('roles').findOne({ name: 'admin' });
  if (adminRole) {
    await db.collection('users').updateOne(
      { email: 'admin@kizunarail.com' },
      { $set: { role: adminRole._id } }
    );
  }

  // 4. Log in and capture cookies
  adminCookie = await loginAndGetCookie('admin@kizunarail.com', 'Password123!');
  customerCookie = await loginAndGetCookie('customer@kizunarail.com', 'Password123!');
});

/* TEMPORARY TEST TO VERIFY COOKIES AND SESSION */
// describe('Setup Verification', () => {
//   test('successfully seeds database and generates auth cookies', () => {
//     expect(adminCookie).toBeDefined();
//     expect(customerCookie).toBeDefined();
    
//     expect(adminCookie[0]).toBeTypeOf('string');
//     expect(customerCookie[0]).toBeTypeOf('string');

//     console.log('Admin Cookie captured successfully:', adminCookie);
//   });
// });

/* B. TEST FOR PR 1 */
describe('PR 1: Read Operations (GET /api/bookings)', () => {
  // test-1 expected 401 user not found/not login
  test('returns 401 Unauthorized if no session cookie is provided', async () => {
    const response = await request(app).get('/api/bookings');

    expect(response.status).toBe(401);
  });

  //test-2 expected 200-success login-customer user can retriever their own booking
  //by seeing one seed-data
  test('allows standard customer to retrieve only their own bookings', async () => {
    const response = await request(app)
      .get('/api/bookings')
      .set('Cookie', customerCookie);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);
    
    // Customer should only see 1 booking (their own)
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].bookingCode).toBe('TEST-CUSTOMER-01');
  });

  //test-3 expected 200-success Admin user should see all two seed data 
  test('allows admin user to retrieve all bookings across all users', async () => {
    const response = await request(app)
      .get('/api/bookings')
      .set('Cookie', adminCookie);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    
    // Admin sees all 2 seeded bookings
    expect(response.body.data).toHaveLength(2);
  });

  //test-4 expected 200-success user retrieve single booking-ID
  test('allows user to retrieve a single booking by bookingCode if authorized', async () => {
    const response = await request(app)
      .get('/api/bookings/TEST-CUSTOMER-01')
      .set('Cookie', customerCookie);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('bookingCode', 'TEST-CUSTOMER-01');
    expect(response.body.ticketClass).toBe('premium');
  });

  //test-5 expected 403-forbidden user has no access
  test('returns 403 Forbidden when customer tries to access another user single booking', async () => {
    const response = await request(app)
      .get('/api/bookings/TEST-OTHER-02')
      .set('Cookie', customerCookie);

    expect(response.status).toBe(403);
  });

  //test-6 expected 404-Not-found for booking-id/code that doesn't exist. 
  test('returns 404 Not Found for a non-existent bookingCode', async () => {
    const response = await request(app)
      .get('/api/bookings/NON-EXISTENT-99')
      .set('Cookie', adminCookie);

    expect(response.status).toBe(404);
  });
});