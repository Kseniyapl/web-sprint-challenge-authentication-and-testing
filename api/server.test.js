const request = require('supertest')
const server = require('./server')
const db = require('../data/dbConfig')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

beforeEach(async () => {
  await request(server).post('/api/auth/register')
    .send({
      username: "12345",
      password: "12345"
    })
})
afterAll(async () => {
  await db.destroy() 
})


test('[0] sanity', () => {
  expect(true).toBe(true)
})
describe('Auth router', () => {
  describe('[POST] /register', () => {
    it('causes a user to be added to the database', async () => {
      const users = await db('users')
      expect(users).toHaveLength(1)
    })
    it('responds with the new user', async () => {
      const users = await db('users')
      expect(users[0].username).toEqual("12345")
    })
    it('responds with the new user', async () => {
      const users = await db('users')
      expect(users[0].username).not.toEqual("1234")
    })
    it('responds with the new user', async () => {
      const users = await db('users')
      expect(users[0].password).not.toEqual("1234")
    })
  })
})
describe('[POST] /login', () => {
  it('causes a user to login' , async () => {
    const res = await request(server).post('/api/auth/login').send({ username: '12345', password: '12345' })
    expect(res.body.message).toMatch(/welcome back, 12345/i)
  }, 750)
  it('responds with message on invalid credentials', async () => {
    let res = await request(server).post('/api/auth/login').send({ username: '1234', password: '1234' })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe("Invalid credentials")
    })
  })

describe('[GET] /api/jokes', () => {
  it('gets jokes', async () => {
    let res = await request(server).post('/api/auth/login').send({ username: '12345', password: '12345' })
    res = await request(server).get('/api/jokes').set('Authorization', res.body.token)
    expect(res.body).toMatchObject([
      {
        "id": "0189hNRf2g",
        "joke": "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later."
      },
      {
        "id": "08EQZ8EQukb",
        "joke": "Did you hear about the guy whose whole left side was cut off? He's all right now."
      },
      {
        "id": "08xHQCdx5Ed",
        "joke": "Why didn’t the skeleton cross the road? Because he had no guts."
      },
    ])
  })
  it('did not get jokes', async () => {
    const res = await request(server).get('/api/jokes')
    expect(res.body.message).toMatch('we want token')
  }, 750)
})