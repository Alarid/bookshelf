import {queryCache} from 'react-query'
import {server, rest} from 'test/server'
import {logout} from 'auth-provider'
import {client} from '../api-client'

const apiURL = process.env.REACT_APP_API_URL

jest.mock('react-query')
jest.mock('auth-provider')

test('calls fetch at the endpoint with the arguments for GET requests', async () => {
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  server.use(
    rest.get(`${apiURL}/${endpoint}`, (req, res, ctx) => {
      return res(ctx.json(mockResult))
    }),
  )

  const response = await client(endpoint)
  expect(response).toEqual(mockResult)
})

test('adds auth token when a token is provided', async () => {
  const token = 'fake-token'
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  let request
  server.use(
    rest.get(`${apiURL}/${endpoint}`, (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )

  await client(endpoint, {token})
  expect(request.headers.get('Authorization')).toBe(`Bearer ${token}`)
})

test('allows for config overrides', async () => {
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  let request
  server.use(
    rest.put(`${apiURL}/${endpoint}`, (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )

  const config = {
    method: 'PUT',
    headers: {'Content-Type': 'fake-type'},
  }
  await client(endpoint, config)
  expect(request.headers.get('Content-Type')).toBe(
    config.headers['Content-Type'],
  )
})

test('when data is provided, it is stringified and the method defaults to POST', async () => {
  const endpoint = 'test-endpoint'
  server.use(
    rest.post(`${apiURL}/${endpoint}`, (req, res, ctx) => {
      return res(ctx.json(req.body))
    }),
  )

  const mockData = {
    someData: 'value',
  }
  const result = await client(endpoint, {data: mockData})
  expect(result).toEqual(mockData)
})

test('when the response is not ok, the promise is rejected', async () => {
  const endpoint = 'test-endpoint'
  const testError = {message: 'some error'}
  server.use(
    rest.get(`${apiURL}/${endpoint}`, (req, res, ctx) => {
      return res(ctx.status(500), ctx.json(testError))
    }),
  )

  await expect(client(endpoint)).rejects.toEqual(testError)
})

test('the user gets logged out when the server respond with a 401', async () => {
  const endpoint = 'test-endpoint'
  server.use(
    rest.get(`${apiURL}/${endpoint}`, (req, res, ctx) => {
      return res(ctx.status(401), ctx.json({message: 'some error'}))
    }),
  )

  const result = await client(endpoint).catch(e => e)
  expect(result.message).toMatchInlineSnapshot(`"Please re-authenticate."`)
  expect(queryCache.clear).toHaveBeenCalledTimes(1)
  expect(logout).toHaveBeenCalledTimes(1)
})
