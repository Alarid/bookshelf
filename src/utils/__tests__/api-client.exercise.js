import {server, rest} from 'test/server'
import {client} from '../api-client'
const apiURL = process.env.REACT_APP_API_URL

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

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
