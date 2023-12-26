import React, { useState } from "react"
import ReactDOM from "react-dom/client"

import { Spinner } from "@/components/icons"
import "@/index.css"
import { getAllConversations } from "@/lib/api"

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

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  const generate = async () => {
    setGenerating(true)
    try {
      const conversations = await getAllConversations()
      console.log(conversations)
    } catch (err) {
      console.error(err)
      setError((err as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <button
        className="btn btn-neutral group relative w-full whitespace-nowrap rounded-xl px-4 py-3 text-left text-gray-700 md:whitespace-normal dark:text-gray-300"
        onClick={() => {
          setShowModal(true)
          generate()
        }}>
        🔍 Discover Your Journey with ChatGPT
      </button>
      {showModal && (
        <div className="absolute left-0 top-0 z-30 h-screen w-full bg-white dark:bg-[rgba(52,53,65,1)]">
          <div className="mx-auto mt-[56px] justify-center px-4 py-2 text-base md:gap-6">
            <div className="mx-auto flex flex-1 gap-3 text-base md:max-w-3xl md:px-5 lg:max-w-[40rem] lg:px-1 xl:max-w-[48rem] xl:px-5">
              {generating && (
                <div className="prose dark:prose-invert flex w-full flex-col items-center">
                  <p className="pt-4">
                    Crafting your ChatGPT Journey, please hold on for a
                    moment...
                  </p>
                  <div>
                    Your data is 100% secure and private.
                    <ul>
                      <li> Everything runs locally on your computer.</li>
                      <li> No data is uploaded.</li>
                      <li>
                        The code is{" "}
                        <a
                          href="https://github.com/yaozhiwang/chatgpt-sugar/"
                          target="_blank">
                          open source
                        </a>
                        .
                      </li>
                    </ul>
                  </div>
                  <Spinner className="h-8 w-8" />
                  {error && <p className="text-base text-red-500">{error} </p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
