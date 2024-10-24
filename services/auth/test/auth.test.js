'use strict';

const { test } = require('tap');
const { build } = require('../helper');  // Assuming you have a helper to build the app
const authController = require('../src/controllers/authController'); // Reference your controller

test('POST /api/auth/signup - Register a new user', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/signup',
    payload: {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123"
    }
  });

  t.equal(res.statusCode, 201, 'User should be created successfully');
});

test('POST /api/auth/login - Login user', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      email: "john.doe@example.com",
      password: "password123"
    }
  });

  t.equal(res.statusCode, 200, 'User should be able to log in');
  t.match(res.payload, /Login successful/, 'Should return login success message');
});
