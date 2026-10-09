import { describe, expect, test } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/stations', () => {
  test('returns seeded stations with their expected fields', async () => {
    const response = await request(app).get('/api/stations');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'nagoya',
          name: 'Nagoya Station',
          prefecture: 'Aichi',
          region: 'central',
          facilities: expect.arrayContaining(['restaurant', 'tourist_info']),
          description: expect.any(String)
        })
      ])
    );
  });

  test('returns one station by id', async () => {
    const response = await request(app).get('/api/stations/nagoya');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 'nagoya',
      name: 'Nagoya Station',
      prefecture: 'Aichi',
      region: 'central',
      description: 'Major transportation hub in central Japan.'
    });
    expect(response.body.facilities).toEqual(
      expect.arrayContaining(['restaurant', 'shop', 'restroom'])
    );
  });

  test('returns not found for an unknown station id', async () => {
    const response = await request(app).get('/api/stations/not-a-station');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Station not found' });
  });
});

describe('trip station relationships', () => {
  test('trip station references resolve to seeded station records', async () => {
    const tripResponse = await request(app).get('/api/trips/alpine-panorama');

    expect(tripResponse.status).toBe(200);
    expect(tripResponse.body).toMatchObject({
      id: 'alpine-panorama',
      startStation: 'nagoya',
      endStation: 'toyama'
    });

    const originResponse = await request(app).get(
      `/api/stations/${tripResponse.body.startStation}`
    );
    const destinationResponse = await request(app).get(
      `/api/stations/${tripResponse.body.endStation}`
    );

    expect(originResponse.status).toBe(200);
    expect(destinationResponse.status).toBe(200);
    expect(originResponse.body.id).toBe(tripResponse.body.startStation);
    expect(destinationResponse.body.id).toBe(tripResponse.body.endStation);
  });

  test('returns both station records connected to the selected trip', async () => {
    const response = await request(app).get('/api/trips/alpine-panorama/stations');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      tripId: 'alpine-panorama',
      stations: {
        origin: expect.objectContaining({
          id: 'nagoya',
          name: 'Nagoya Station'
        }),
        destination: expect.objectContaining({
          id: 'toyama',
          name: 'Toyama Station'
        })
      }
    });
  });
});