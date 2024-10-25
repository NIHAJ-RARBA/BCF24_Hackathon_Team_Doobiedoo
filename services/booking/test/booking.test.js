// booking.test.js
const request = require('supertest');
const app = require('../src/app'); // Assuming your Express app is exported from app.js

describe('Booking API', () => {
  it('POST /api/bookings/book-ticket - Create a new booking', async () => {
    const res = await request(app)
      .post('/api/bookings/book-ticket')
      .send({
        userId: 1,
        trainId: 1,
        seatId: "A1-01"
      });

    // expect(res.statusCode).toEqual(201);  // Expect success on booking creation
    // expect(res.body).toHaveProperty('message', 'Ticket booked successfully');
  });

  it('GET /api/bookings/health - Check if the service is running', async () => {
    const res = await request(app).get('/api/bookings/health');
    // expect(res.statusCode).toEqual(200);
    // expect(res.text).toBe('Booking service is up and running');
  });
});
