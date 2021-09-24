/** @jsx jsx */
import {jsx} from '@emotion/core'

import React from 'react'
import VisuallyHidden from '@reach/visually-hidden'

import {Dialog, CircleButton} from './lib'

const ModalContext = React.createContext()

const callAll =
  (...fns) =>
  (...args) =>
    fns.forEach(fn => fn && fn(...args))

function Modal({children}) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <ModalContext.Provider value={{isOpen, setIsOpen}}>
      {children}
    </ModalContext.Provider>
  )
}

function ModalDismissButton({children: button}) {
  const {setIsOpen} = React.useContext(ModalContext)
  return React.cloneElement(button, {
    onClick: callAll(() => setIsOpen(false), button.props.onClick),
  })
}

function ModalOpenButton({children: button}) {
  const {setIsOpen} = React.useContext(ModalContext)
  return React.cloneElement(button, {
    onClick: callAll(() => setIsOpen(true), button.props.onClick),
  })
}

function ModalContentsBase(props) {
  const {isOpen, setIsOpen} = React.useContext(ModalContext)
  return (
    <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} {...props} />
  )
}

function ModalContents({title, children, ...props}) {
  return (
    <ModalContentsBase {...props}>
      <div css={{display: 'flex', justifyContent: 'flex-end'}}>
        <ModalDismissButton>
          <CircleButton>
            <VisuallyHidden>Close</VisuallyHidden>
            <span aria-hidden>×</span>
          </CircleButton>
        </ModalDismissButton>
      </div>
      <h3 css={{textAlign: 'center', fontSize: '2em'}}>{title}</h3>
      {children}
    </ModalContentsBase>
  )
}

export {
  Modal,
  ModalDismissButton,
  ModalOpenButton,
  ModalContentsBase,
  ModalContents,
}
