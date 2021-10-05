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

test('renders all the book information', async () => {
  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`
  await render(<App />, {route})

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
  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`
  await render(<App />, {route})

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
  const user = await loginAsUser()
  const book = await booksDB.create(buildBook())
  await listItemsDB.create(buildListItem({owner: user, book}))
  const route = `/book/${book.id}`
  await render(<App />, {user, route})

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
  const user = await loginAsUser()
  const book = await booksDB.create(buildBook())
  const listItem = await listItemsDB.create(
    buildListItem({owner: user, book, finishDate: null}),
  )
  const route = `/book/${book.id}`
  await render(<App />, {user, route})

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
  const user = await loginAsUser()
  const book = await booksDB.create(buildBook())
  const listItem = await listItemsDB.create(buildListItem({owner: user, book}))
  const route = `/book/${book.id}`
  await render(<App />, {user, route})

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
