import * as React from 'react'
import faker from 'faker'
import {
  render,
  screen,
  userEvent,
  waitForLoadingToFinish,
  loginAsUser,
} from 'test/app-test-utils'
import {buildBook, buildListItem} from 'test/generate'
import {App} from 'app'
import * as listItemsDB from 'test/data/list-items'
import * as booksDB from 'test/data/books'
import {formatDate} from 'utils/misc'
import {server, rest} from 'test/server'

const apiURL = process.env.REACT_APP_API_URL

async function renderBookScreen({user, book, listItem} = {}) {
  user = typeof user === 'undefined' ? await loginAsUser() : user
  book = typeof book === 'undefined' ? await booksDB.create(buildBook()) : book
  listItem =
    typeof listItem === 'undefined'
      ? await listItemsDB.create(
          buildListItem({owner: user, book, finishDate: null}),
        )
      : listItem
  const route = `/book/${book.id}`
  return {
    ...(await render(<App />, {route, user})),
    user,
    book,
    listItem,
  }
}

test('renders all the book information', async () => {
  const {book} = await renderBookScreen({listItem: null})

  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
  expect(screen.getByRole('img', {name: /book cover/i})).toHaveAttribute(
    'src',
    book.coverImageUrl,
  )
  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('textbox', {name: /notes/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
})

test('can create a list item for the book', async () => {
  await renderBookScreen({listItem: null})

  const addToListButton = screen.getByRole('button', {name: /add to list/i})
  userEvent.click(addToListButton)
  expect(addToListButton).toBeDisabled()

  await waitForLoadingToFinish()

  expect(
    screen.getByRole('button', {name: /mark as read/i}),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', {name: /remove from list/i}),
  ).toBeInTheDocument()
  expect(screen.getByRole('textbox', {name: /notes/i})).toBeInTheDocument()

  const startDateNode = screen.getByLabelText(/start date/i)
  expect(startDateNode).toHaveTextContent(formatDate(new Date()))

  expect(
    screen.queryByRole('button', {name: /add to list/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
})

test('can remove a list item for the book', async () => {
  await renderBookScreen()

  const removeFromListButtom = screen.getByRole('button', {
    name: /remove from list/i,
  })
  userEvent.click(removeFromListButtom)
  expect(removeFromListButtom).toBeDisabled()
  await waitForLoadingToFinish()

  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()
})

test('can mark a list item as read', async () => {
  const {listItem} = await renderBookScreen()

  const markAsRead = screen.getByRole('button', {
    name: /mark as read/i,
  })
  userEvent.click(markAsRead)
  expect(markAsRead).toBeDisabled()
  await waitForLoadingToFinish()

  expect(
    screen.getByRole('button', {name: /mark as unread/i}),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
  expect(screen.getAllByRole('radio', {name: /star/i})).not.toHaveLength(0)

  const startAndFinishDateNode = screen.getByLabelText(/start and finish date/i)
  expect(startAndFinishDateNode).toHaveTextContent(
    `${formatDate(listItem.startDate)} — ${formatDate(new Date())}`,
  )
})

test('can edit a note', async () => {
  jest.useFakeTimers()
  const {listItem} = await renderBookScreen()

  const newNotes = faker.lorem.words()
  const notesTextarea = screen.getByRole('textbox', {name: /notes/i})

  userEvent.clear(notesTextarea)
  userEvent.type(notesTextarea, newNotes)

  await screen.findByLabelText(/loading/i)
  await waitForLoadingToFinish()

  expect(notesTextarea).toHaveValue(newNotes)
  expect(await listItemsDB.read(listItem.id)).toMatchObject({
    notes: newNotes,
  })
})

describe('Error cases', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterAll(() => {
    console.error.mockRestore()
  })

  test('shows an error message when the book fails to load', async () => {
    await renderBookScreen({book: {id: 'wrong'}, listItem: null})
    expect(
      (await screen.findByRole('alert')).textContent,
    ).toMatchInlineSnapshot(`"There was an error: Book not found"`)
  })

  test('note update failures are displayed', async () => {
    jest.useFakeTimers()
    const {listItem} = await renderBookScreen()

    server.use(
      rest.put(`${apiURL}/list-items/:listItemId`, async (req, res, ctx) =>
        res(ctx.status(400), ctx.json({status: 400, message: 'Oh no!'})),
      ),
    )

    const newNotes = faker.lorem.words()
    const notesTextarea = screen.getByRole('textbox', {name: /notes/i})

    userEvent.clear(notesTextarea)
    userEvent.type(notesTextarea, newNotes)
    await screen.findByLabelText(/loading/i)
    await waitForLoadingToFinish()

    expect(screen.getByRole('alert').textContent).toMatchInlineSnapshot(
      `"There was an error: Oh no!"`,
    )
    expect(await listItemsDB.read(listItem.id)).not.toMatchObject({
      notes: newNotes,
    })
  })
})
