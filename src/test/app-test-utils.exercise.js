import {render, screen, waitForElementToBeRemoved} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {AppProviders} from 'context'
import * as usersDB from 'test/data/users'
import * as auth from 'auth-provider'
import {buildUser} from 'test/generate'

async function loginAsUser(userProperties) {
  const user = buildUser(userProperties)
  await usersDB.create(user)
  const authUser = await usersDB.authenticate(user)
  window.localStorage.setItem(auth.localStorageKey, authUser.token)
  return authUser
}

async function waitForLoadingToFinish() {
  await waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ])
}

async function customRender(ui, {route = '/list', user, ...renderOptions}) {
  user = typeof user === 'undefined' ? await loginAsUser() : user
  window.history.pushState({}, 'The React Bookshelf App', route)
  const renderUtils = render(ui, {wrapper: AppProviders, ...renderOptions})
  await waitForLoadingToFinish()
  return {user, ...renderUtils}
}

export * from '@testing-library/react'
export {customRender as render, userEvent, loginAsUser, waitForLoadingToFinish}
