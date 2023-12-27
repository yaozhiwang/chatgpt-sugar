import { useState } from "react"

import { JourneyData } from "../data"
import Timeline from "./timeline"
import Waiting from "./waiting"

export default function Journey() {
  const [journeyData, setJourneData] = useState<JourneyData>()

  return (
    <div className="absolute left-0 top-0 z-30 h-screen w-full bg-white dark:bg-[rgba(52,53,65,1)]">
      <div className="mx-auto mt-[56px] justify-center px-4 py-2 text-base md:gap-6">
        <div className="mx-auto flex flex-1 gap-3 text-base md:max-w-3xl md:px-5 lg:max-w-[40rem] lg:px-1 xl:max-w-[48rem] xl:px-5">
          {journeyData ? (
            <Timeline data={journeyData} />
          ) : (
            <Waiting onGenerated={setJourneData} />
          )}
        </div>
      </div>
    </div>
  )
}
