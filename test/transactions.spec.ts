import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'

import { app } from '../src/app'

describe('Transactions', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New transaction',
      type: 'credit',
      amount: 1000,
    })

    expect(response.status).toBe(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionsResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        type: 'credit',
        amount: 1000,
      })

    const cookies = createTransactionsResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 1000,
      }),
    ])
  })

  it('should be able to get a specifc transaction', async () => {
    const createTransactionsResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        type: 'credit',
        amount: 1000,
      })

    const cookies = createTransactionsResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionsResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)

    expect(getTransactionsResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 1000,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const createTransactionsResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        type: 'credit',
        amount: 5000,
      })

    const cookies = createTransactionsResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'New transaction',
        type: 'debit',
        amount: 2000,
      })

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)

    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    })
  })
})
