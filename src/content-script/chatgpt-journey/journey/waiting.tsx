import { useEffect, useState } from "react"

import { Spinner } from "@/components/icons"

import { JourneyData, collectJourneyData } from "../data"

export default function Waiting({
  onGenerated
}: {
  onGenerated: (data: JourneyData) => void
}) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  const generate = async () => {
    setGenerating(true)
    try {
      const data = await collectJourneyData()
      onGenerated(data)
    } catch (err) {
      console.error(err)
      setError((err as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    generate()
  }, [])

  return (
    <div className="prose dark:prose-invert flex w-full flex-col items-center">
      <p className="pt-4">
        Crafting your ChatGPT Journey, please hold on for a moment...
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
      {generating && (
        <div className="not-prose flex flex-col items-center gap-2">
          <Spinner className="h-8 w-8" />
          <p className="text-token-text-tertiary text-sm">
            It may take some time to collect the data if you had lots of
            conversations...
          </p>
        </div>
      )}
      {error && <p className="text-base text-red-500">{error} </p>}
    </div>
  )
}
