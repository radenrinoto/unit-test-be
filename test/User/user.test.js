const request = require('supertest');
const app = require('../../index');
const { sequelize } = require('../../models/index');
const { queryInterface } = sequelize;
const { GenerateToken } = require('../../helpers/GenerateToken');

const dummyUser = {
  fullName: 'dummy',
  email: 'dummy@mail.com',
  password: 'password123',
  confirmPassword: 'password123'
};

let token;
let id;

beforeAll((done) => {
  request(app)
  .post('/api/user/register')
  .send(dummyUser)
  .then(({ body }) => {
    const dataUser = {
      id: body.data.id,
      fullName: body.data.fullName,
      email: body.data.email,
      role_id: 1,
    };
    const { refreshToken } = GenerateToken(dataUser);
    token = refreshToken;
    id = body.data.id;
    done()
  })
  .catch((err) => {
    done(err)
  })
})

afterAll((done) => {
  queryInterface.bulkDelete('Users', null, {})
  .then(() => {
    done()
  })
  .catch((err) => {
    done(err)
  })
})

describe('Get Users', () => {
  test('Success get Users with status 200', (done) => {
    request(app)
    .get('/api/user')
    .set('authorization', `Bearer ${token}`)
    .then(({ body }) => {
      expect(body.status).toBe(200);
      expect(body).toHaveProperty('data');
      expect(body.data[0]).toHaveProperty('id');
      expect(body.data[0].email).toEqual(dummyUser.email);
      done();
    })
    .catch((err) => {
      done(err)
    })
  })
})

describe('Create User', () => {
  test('Success Create User with status 201', (done) => {
    const user = {
      fullName: 'adam',
      email: 'adam@mail.com',
      password: 'password123',
      confirmPassword: 'password123',
    };
    request(app)
    .post('/api/user/register')
    .send(user)
    .then(({ body }) => {
      expect(body.status).toBe(201);
      expect(body.data.fullName).toEqual(user.fullName);
      expect(body.data.email).toEqual(user.email);
      done()
    })
    .catch((err) => {
      done(err)
    })
  })
  test('Failed create user with status 400', (done) => {
    request(app)
    .post('/api/user/register')
    .send(dummyUser)
    .then(({ body }) => {
      expect(body.status).toBe(400)
      expect(body.message).toEqual('User Already Exist')
      expect(body.data).toBe(null)
      done()
    })
    .catch((err) => {
      done(err)
    })
  })
  test('Failed Create User: Validation Error with status 400', (done) => {
    const user = {
      fullName: 'ad',
      email: 'ad@mail.com',
      password: 'password123',
      confirmPassword: 'password123',
    };
    request(app)
    .post('/api/user/register')
    .send(user)
    .then(({ body }) => {
      expect(body.status).toBe(400);
      expect(body.message).toBe('"fullName" length must be at least 3 characters long');
      done()
    })
    .catch((err) => {
      done(err)
    })
  })
})


