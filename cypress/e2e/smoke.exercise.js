import {buildUser} from '../support/generate'

function navigateTo(link) {
  cy.findByRole('navigation').within(() => {
    cy.findByRole('link', {name: link}).click()
  })
}

describe('smoke', () => {
  it('should allow a typical user flow', () => {
    const user = buildUser()

    cy.visit('/')
    cy.findByRole('button', {name: /register/i}).click()

    cy.findByRole('dialog').within(() => {
      cy.findByRole('textbox', {name: /username/i}).type(user.username)
      cy.findByLabelText(/password/i).type(user.password)
      cy.findByRole('button', {name: /register/i}).click()
    })

    navigateTo(/discover/i)

    const bookTitle = 'voice of war'
    const bookTitleRegExp = new RegExp(bookTitle, 'i')
    cy.findByRole('main').within(() => {
      cy.findByRole('searchbox').type(`${bookTitle}{enter}`)
      cy.findByRole('listitem', {name: bookTitleRegExp}).within(() => {
        cy.findByRole('button', {name: /add to list/i}).click()
      })
    })

    navigateTo(/reading/i)

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 1)
      cy.findByRole('listitem').within(() => {
        cy.findByRole('link', {name: bookTitleRegExp}).click()
      })
    })

    cy.findByRole('main').within(() => {
      cy.findByRole('textbox', {name: /notes/i}).type('Some text')
      cy.findByLabelText(/loading/i).should('exist')
      cy.findByRole(/loading/i).should('not.exist')

      cy.findByRole('button', {name: /mark as read/i}).click()
      cy.findByRole('radio', {name: /5 stars/i}).click({force: true})
    })

    navigateTo(/finished books/i)

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 1)
      cy.findByRole('listitem').within(() => {
        cy.findByRole('radio', {name: /5 stars/i}).should('be.checked')
        cy.findByRole('link', {name: bookTitleRegExp}).click()
      })
    })

    cy.findByRole('main').within(() => {
      cy.findByRole('button', {name: /remove from list/i}).click()
      cy.findByRole('textbox', {name: /notes/i}).should('not.exist')
      cy.findByRole('radio', {name: /stars/i}).should('not.exist')
    })

    navigateTo(/finished books/i)

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 0)
    })
  })
})
