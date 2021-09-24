import React from 'react'

import {Dialog} from './lib'

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

function ModalContents(props) {
  const {isOpen, setIsOpen} = React.useContext(ModalContext)
  return (
    <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} {...props} />
  )
}

export {Modal, ModalDismissButton, ModalOpenButton, ModalContents}
