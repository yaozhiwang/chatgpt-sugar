import { ReactNode, useRef } from "react"

import { useOutsideAlerter } from "@/lib/hooks"

export function Dialog({
  title,
  children,
  onClose
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const wrapperRef = useRef(null)

  useOutsideAlerter(wrapperRef, () => {
    onClose()
  })

  return (
    <div className="fixed inset-0 z-40 bg-black/50 dark:bg-gray-600/70">
      <div className="grid h-full w-full grid-cols-[10px_1fr_10px] grid-rows-[minmax(10px,_1fr)_auto_minmax(10px,_1fr)] overflow-y-auto md:grid-rows-[minmax(20px,_1fr)_auto_minmax(20px,_1fr)]">
        <div
          ref={wrapperRef}
          role="dialog"
          className="relative left-1/2 col-auto col-start-2 row-auto row-start-2 w-full max-w-[550px] -translate-x-1/2 rounded-xl bg-white text-left shadow-xl transition-all dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-black/10 px-4 pb-4 pt-5 sm:p-6 dark:border-white/10">
            <div className="flex">
              <div className="flex items-center">
                <div className="flex grow flex-col gap-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">
                    {title}
                  </h3>
                </div>
              </div>
            </div>
            <button
              className="text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => {
                onClose()
              }}>
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="20"
                width="20"
                xmlns="http://www.w3.org/2000/svg">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
