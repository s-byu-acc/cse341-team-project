import { describe, expect, test } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/stations', () => {
  test('returns seeded stations with their expected fields', async () => {
    const response = await request(app).get('/api/stations');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toHaveLength(12);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'nagoya',
          name: 'Nagoya Station',
          prefecture: 'Aichi',
          region: 'central',
          facilities: expect.arrayContaining(['restaurant', 'shop', 'restroom']),
          description: 'Major transportation hub in central Japan.'
        })
      ])
    );
  });

  test('returns one station by ID', async () => {
    const response = await request(app).get('/api/stations/toyama');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 'toyama',
      name: 'Toyama Station',
      prefecture: 'Toyama',
      region: 'central',
      facilities: expect.arrayContaining(['restaurant', 'shop', 'restroom']),
      description: 'Gateway to the Northern Alps.'
    });
  });

  test('returns 404 for an unknown station ID', async () => {
    const response = await request(app).get('/api/stations/not-a-station');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Station not found' });
  });
});

describe('Trip station relationships', () => {
  test('seeded trip station references resolve to real station records', async () => {
    const tripResponse = await request(app).get('/api/trips/alpine-panorama');
    expect(tripResponse.status).toBe(200);

    const originResponse = await request(app).get(`/api/stations/${tripResponse.body.startStation}`);
    const destinationResponse = await request(app).get(`/api/stations/${tripResponse.body.endStation}`);

    expect(originResponse.status).toBe(200);
    expect(destinationResponse.status).toBe(200);
    expect(originResponse.body).toMatchObject({ id: 'nagoya', name: 'Nagoya Station' });
    expect(destinationResponse.body).toMatchObject({ id: 'toyama', name: 'Toyama Station' });
  });

  test('returns the origin and destination stations for a selected trip', async () => {
    const response = await request(app).get('/api/trips/alpine-panorama/stations');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      tripId: 'alpine-panorama',
      origin: { id: 'nagoya', name: 'Nagoya Station' },
      destination: { id: 'toyama', name: 'Toyama Station' }
    });
  });
});