import { useEffect, useState } from "react"

import { Dialog } from "@/components/dialog"
import { Share } from "@/components/icons"
import { detectTheme } from "@/lib/utils"
import { useToPng } from "@hugocxl/react-to-image"

import { JourneyData } from "../data"
import ShareDialog, { ShareOptions } from "./share"
import Timeline from "./timeline"
import Waiting from "./waiting"

export default function Journey() {
  const [journeyData, setJourneData] = useState<JourneyData>()

  const [openDialog, setOpenDialog] = useState(false)

  const [date] = useState(new Date())
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    title: "My ChatGPT Journey",
    shareName: false,
    shareTimeline: false
  })
  const [imageData, setImageData] = useState<string>()
  const [imageError, setImageError] = useState<string>()

  const [showImage, setShowImage] = useState(false)
  const [_, convertToPng, timelineRef] = useToPng<HTMLDivElement>({
    backgroundColor: detectTheme() === "dark" ? "#000000" : "#FFFFFF",
    onSuccess: (data) => {
      setImageData(data)
      setShowImage(false)
    },
    onError: (error) => {
      setImageError(error)
      setShowImage(false)
    }
  })

  const startConvertImage = () => {
    setImageError("")
    setImageData("")
    setShowImage(true)
    setTimeout(() => {
      convertToPng()
    })
  }

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
              startConvertImage()
            }}>
            <Share className="icon-md" />
          </button>
        )}
      </div>
      <div className="mx-auto justify-center px-4 py-2 text-base md:gap-6">
        <div className="mx-auto flex flex-1 gap-3 text-base md:max-w-3xl md:px-5 lg:max-w-[40rem] lg:px-1 xl:max-w-[48rem] xl:px-5">
          {journeyData ? (
            <div ref={timelineRef}>
              {showImage && (
                <p className="pb-3 pt-8 text-center text-xl font-bold">
                  {shareOptions.title}
                </p>
              )}
              <Timeline
                data={journeyData}
                showUser={!showImage || shareOptions.shareName}
                showEvents={!showImage || shareOptions.shareTimeline}
              />
              {showImage && (
                <p className="text-token-text-tertiary px-3 pb-4 pt-2 text-right text-sm">
                  Generated on{" "}
                  {date.toLocaleDateString("en-US", {
                    weekday: undefined,
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}{" "}
                  by https://chatgptsugar.xyz
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
          children={
            <ShareDialog
              options={shareOptions}
              date={date}
              imageData={imageData}
              error={imageError}
              onUpdateOptions={(options) => {
                setShareOptions(options)
                startConvertImage()
              }}
            />
          }
          title="Share your journey"
          onClose={() => {
            setOpenDialog(false)
          }}
        />
      )}
    </div>
  )
}
