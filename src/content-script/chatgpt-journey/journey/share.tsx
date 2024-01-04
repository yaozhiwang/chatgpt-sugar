import { useMemo, useRef, useState } from "react"

import { Check, Edit, More, Spinner } from "@/components/icons"
import { useOutsideAlerter } from "@/lib/hooks"
import { classNames } from "@/lib/utils"

export type ShareOptions = {
  title: string
  shareName: boolean
  shareTimeline: boolean
}

export default function ShareDialog({
  imageData,
  error,
  date,
  options,
  onUpdateOptions
}: {
  imageData?: string
  error?: string
  date: Date
  options: ShareOptions
  onUpdateOptions: (options: ShareOptions) => void
}) {
  const loading = useMemo(() => {
    return !imageData && !error
  }, [imageData, error])

  function download(imageData: string) {
    const a = document.createElement("a")
    a.style.display = "none"
    a.href = imageData
    a.download = `ChatGPT-journey.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <>
      <div className="w-full">
        <p className="mb-6 text-gray-500">
          Download image to save your journey. Or share it to your friends.
        </p>
      </div>
      <div className="mb-4 w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50 shadow-[0_2px_12px_0px_rgba(0,0,0,0.08)] dark:border-gray-700 dark:bg-gray-800/90">
        <div className="relative w-full overflow-hidden pb-[100%]">
          <div className="absolute inset-0 overflow-auto bg-white dark:bg-gray-800">
            {error && (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <div className="flex flex-col gap-2 text-red-500">
                  <p className="text-xl font-medium">Error generating image</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <Spinner className="h-8 w-8" />
                <p className="text-token-text-tertiary text-sm">
                  Generating image for sharing...
                </p>
              </div>
            )}

            {imageData && <img src={imageData} alt="timeline image" />}
          </div>
        </div>
        <Options
          options={options}
          date={date}
          disabled={loading}
          onUpdate={onUpdateOptions}
        />
      </div>
      <div className="mt-5 flex flex-col justify-between gap-3 sm:mt-4 sm:flex-row-reverse">
        <button
          className={classNames(
            "btn",
            loading ? "btn-disabled" : "btn-primary"
          )}
          disabled={loading}
          onClick={() => {
            if (imageData) {
              download(imageData)
            }
          }}>
          Download image
        </button>
      </div>
    </>
  )
}

function Options({
  options,
  date,
  disabled,
  onUpdate
}: {
  options: ShareOptions
  date: Date
  disabled: boolean
  onUpdate: (options: ShareOptions) => void
}) {
  const [title, setTitle] = useState(options.title)
  const [shareName, setShareName] = useState(options.shareName)
  const [shareTimeline, setShareTimeline] = useState(options.shareTimeline)
  const prevTitle = useRef<string>(options.title)

  const [editTitle, setEditTitle] = useState(false)
  const [openOptions, setOpenOptions] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const optionsRef = useRef(null)

  useOutsideAlerter(optionsRef, () => {
    setOpenOptions(false)
  })

  return (
    <div className="flex h-full w-full rounded-b-lg border-t border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/90">
      <div className="flex-1 pr-1">
        <div className="justify-left flex min-h-[1.5rem] w-full items-center gap-2">
          {editTitle ? (
            <input
              ref={inputRef}
              type="text"
              className="-my-0.5 -ml-1 w-full border-none bg-transparent py-0.5 pl-1 focus:ring-gray-200 dark:focus:ring-gray-600"
              value={title}
              autoFocus={true}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  inputRef.current?.blur()
                }
              }}
              onChange={(e) => {
                setTitle(e.target.value)
              }}
              onBlur={() => {
                setEditTitle(false)
                const t = title.trim()
                setTitle(t)
                if (prevTitle.current !== t) {
                  onUpdate({ title: t, shareName, shareTimeline })
                  prevTitle.current = t
                }
              }}
            />
          ) : (
            <>
              <div>{title}</div>
              {!disabled && (
                <button
                  className="text-gray-500"
                  onClick={() => {
                    setEditTitle(true)
                    setTimeout(() => {
                      inputRef?.current?.focus()
                    })
                  }}>
                  <Edit className="icon-sm" />
                </button>
              )}
            </>
          )}
        </div>
        <div className="mt-1 text-gray-500">
          {date.toLocaleDateString("en-US", {
            weekday: undefined,
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </div>
      </div>
      <div
        ref={optionsRef}
        className="relative mb-auto mt-auto h-full flex-none">
        <button
          className="btn btn-neutral relative mb-auto mt-auto"
          onClick={() => {
            setOpenOptions(() => !openOptions)
          }}>
          <More className="" />
        </button>
        {openOptions && (
          <div className="absolute bottom-full right-0 z-50 mb-1 flex w-max flex-col gap-2 rounded-sm bg-white p-2 shadow-xl dark:bg-gray-800/90">
            <button
              className={classNames(
                "btn btn-neutral flex w-full items-center gap-2 border-0",
                disabled ? "btn-disabled" : "btn-neutral"
              )}
              disabled={disabled}
              onClick={() => {
                onUpdate({ title, shareName: !shareName, shareTimeline })
                setShareName(() => !shareName)
              }}>
              <Check
                className={classNames(
                  "h-6 w-6",
                  shareName ? "visible" : "invisible"
                )}
              />
              <div>Share your name</div>
            </button>
            <button
              className={classNames(
                "btn btn-neutral flex w-full items-center gap-2 border-0",
                disabled ? "btn-disabled" : "btn-neutral"
              )}
              disabled={disabled}
              onClick={() => {
                onUpdate({ title, shareName, shareTimeline: !shareTimeline })
                setShareTimeline(() => !shareTimeline)
              }}>
              <Check
                className={classNames(
                  "h-6 w-6",
                  shareTimeline ? "visible" : "invisible"
                )}
              />
              <div>Share your timeline</div>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
