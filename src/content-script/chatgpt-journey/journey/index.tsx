import { useState } from "react"

import { Dialog } from "@/components/dialog"
import { Share } from "@/components/icons"
import { useToPng } from "@hugocxl/react-to-image"

import { JourneyData } from "../data"
import Timeline from "./timeline"
import Waiting from "./waiting"

export default function Journey() {
  const [journeyData, setJourneData] = useState<JourneyData>()

  const [openDialog, setOpenDialog] = useState(false)
  const [imageData, setImageData] = useState<string>()
  const [state, convertToPng, timelineRef] = useToPng<HTMLDivElement>({
    onSuccess: (data) => {
      setImageData(data)
    }
  })

  return (
    <div className="text-token-text-primary absolute left-0 top-0 z-30 w-full bg-white dark:bg-gray-800">
      <div className="sticky top-0 z-10 mb-1.5 flex h-14 items-center justify-between bg-white p-2 font-semibold dark:bg-gray-800">
        <div className="px-3 py-2 text-lg font-medium">ChatGPT Journey</div>
        <button
          className="btn btn-neutral btn-small border-token-border-medium relative flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-lg border focus:ring-0"
          onClick={() => setOpenDialog(true)}>
          <Share className="icon-md" />
        </button>
      </div>
      <div className="mx-auto justify-center px-4 py-2 text-base md:gap-6">
        <div className="mx-auto flex flex-1 gap-3 text-base md:max-w-3xl md:px-5 lg:max-w-[40rem] lg:px-1 xl:max-w-[48rem] xl:px-5">
          {journeyData ? (
            <div ref={timelineRef}>
              <Timeline data={journeyData} />
            </div>
          ) : (
            <Waiting onGenerated={setJourneData} />
          )}
        </div>
      </div>
      {openDialog && (
        <Dialog
          children={
            <ShareDialog convertToPng={convertToPng} imageData={imageData} />
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

function ShareDialog({
  convertToPng,
  imageData
}: {
  convertToPng: () => void
  imageData?: string
}) {
  return (
    <div className="flex flex-col">
      {imageData && <img src={imageData} />}
      <button
        className="btn btn-primary relative m-auto"
        onClick={() => {
          convertToPng()
        }}>
        Download image
      </button>
    </div>
  )
}
