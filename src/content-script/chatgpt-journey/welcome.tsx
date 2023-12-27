import React, { useState } from "react"
import ReactDOM from "react-dom/client"

import "@/index.css"

import Journey from "./journey"

export function renderJourney() {
  const welcomePanel = document.querySelector(
    'main div[role="presentation"] > .flex-1.overflow-hidden .relative.h-full'
  )
  welcomePanel?.classList.remove("relative")

  const welcome = welcomePanel?.querySelector(
    ".flex.h-full.flex-col.items-center.justify-center"
  )
  if (welcome) {
    render(welcome)
  }
}

function render(parent: Node) {
  const root = document.createElement("div")
  root.id = "sugar-journey-welcome-root"
  parent.appendChild(root)

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Welcome />
    </React.StrictMode>
  )
}

function Welcome({}) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <button
        className="btn btn-neutral group relative w-full whitespace-nowrap rounded-xl px-4 py-3 text-left text-gray-700 md:whitespace-normal dark:text-gray-300"
        onClick={() => {
          setShowModal(true)
        }}>
        🔍 Discover Your Journey with ChatGPT
      </button>
      {showModal && <Journey />}
    </div>
  )
}
