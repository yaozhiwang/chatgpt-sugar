import { useEffect, useState } from "react"

import { Dialog } from "@/components/dialog"
import { Share, Spinner } from "@/components/icons"
import { detectTheme } from "@/lib/utils"
import { useToPng } from "@hugocxl/react-to-image"

import { JourneyData } from "../data"
import Timeline from "./timeline"
import Waiting from "./waiting"

export default function Journey() {
  const [journeyData, setJourneData] = useState<JourneyData>()

  const [openDialog, setOpenDialog] = useState(false)

  const [imageData, setImageData] = useState<string>()
  const [imageError, setImageError] = useState<string>()
  const [showFooter, setShowFooter] = useState(false)
  const [_, convertToPng, timelineRef] = useToPng<HTMLDivElement>({
    backgroundColor: detectTheme() === "dark" ? "#000000" : "#FFFFFF",
    onSuccess: (data) => {
      setImageData(data)
      setShowFooter(false)
    },
    onError: (error) => {
      setImageError(error)
      setShowFooter(false)
    }
  })

  useEffect(() => {
    const listener = () => {
      window.location.assign("/")
    }
    const newChatButtons = document.querySelectorAll("a[href='/']")
    newChatButtons.forEach((btn) => {
      btn.addEventListener("click", listener)
    })

    return () => {
      newChatButtons.forEach((btn) => {
        btn.removeEventListener("click", listener)
      })
    }
  }, [])

  return (
    <div className="text-token-text-primary absolute left-0 top-0 z-30 min-h-screen w-full bg-white dark:bg-gray-800">
      <div className="sticky top-0 z-10 mb-1.5 flex h-14 items-center justify-between bg-white p-2 font-semibold dark:bg-gray-800">
        <div className="px-3 py-2 text-lg font-medium">ChatGPT Journey</div>
        {journeyData && (
          <button
            className="btn btn-neutral btn-small border-token-border-medium relative flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-lg border focus:ring-0"
            onClick={() => {
              setOpenDialog(true)
              setImageError("")
              setImageData("")
              setShowFooter(true)
              setTimeout(() => {
                convertToPng()
              })
            }}>
            <Share className="icon-md" />
          </button>
        )}
      </div>
      <div className="mx-auto justify-center px-4 py-2 text-base md:gap-6">
        <div className="mx-auto flex flex-1 gap-3 text-base md:max-w-3xl md:px-5 lg:max-w-[40rem] lg:px-1 xl:max-w-[48rem] xl:px-5">
          {journeyData ? (
            <div ref={timelineRef}>
              <Timeline data={journeyData} />
              {showFooter && (
                <p className="px-3 py-2 text-right text-sm">
                  Craft your unique ChatGPT journey at https://chatgptsugar.xyz
                </p>
              )}
            </div>
          ) : (
            <Waiting onGenerated={setJourneData} />
          )}
        </div>
      </div>
      {openDialog && (
        <Dialog
          children={<ShareDialog imageData={imageData} error={imageError} />}
          title="Share your journey"
          onClose={() => {
            setOpenDialog(false)
          }}
        />
      )}
    </div>
  )
}

function ShareDialog({
  imageData,
  error
}: {
  imageData?: string
  error?: string
}) {
  function download(imageData: string) {
    const a = document.createElement("a")
    a.style.display = "none"
    a.href = imageData
    a.download = `ChatGPT-journey.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  if (!imageData) {
    return (
      <div className="flex min-w-80 flex-col items-center justify-center">
        <Spinner className="h-8 w-8" />
        <p className="text-token-text-tertiary text-sm">
          Generating image for sharing...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-w-80 flex-col items-center">
        <div className="flex flex-col gap-2 text-red-500">
          <p className="text-xl font-medium">Error generating image</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4">
      <img className="rounded-xl border" src={imageData} alt="timeline image" />
      <button
        className="btn btn-primary relative m-auto"
        onClick={() => {
          download(imageData)
        }}>
        Download image
      </button>
    </div>
  )
}
