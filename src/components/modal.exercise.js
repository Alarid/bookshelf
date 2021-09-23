import React from 'react'

import {Dialog} from './lib'

const ModalContext = React.createContext()

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
    onClick() {
      setIsOpen(false)
    },
  })
}

function ModalOpenButton({children: button}) {
  const {setIsOpen} = React.useContext(ModalContext)
  return React.cloneElement(button, {
    onClick() {
      setIsOpen(true)
    },
  })
}

// 🐨 create a ModalContents component which renders the Dialog.
// Set the isOpen prop and the onDismiss prop should set isOpen to close
// 💰 be sure to forward along the rest of the props (especially children).
function ModalContents(props) {
  const {isOpen, setIsOpen} = React.useContext(ModalContext)
  return (
    <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} {...props} />
  )
}

export {Modal, ModalDismissButton, ModalOpenButton, ModalContents}
