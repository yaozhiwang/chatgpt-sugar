import { useMemo } from "react"

import { classNames } from "@/lib/utils"

import { Event, JourneyData, JourneyStats } from "../data"

type DisplayEvent = Omit<Event, "date"> & { date: Date | string; left: boolean }

export default function Timeline({ data }: { data: JourneyData }) {
  const events = useMemo(() => {
    const events: DisplayEvent[] = []
    let i = 0,
      j = 0
    while (i < data.events.chatgpt.length && j < data.events.user.length) {
      if (
        data.events.chatgpt[i].date.getTime() <=
        data.events.user[j].date.getTime()
      ) {
        events.push({ ...data.events.chatgpt[i], left: true })
        i++
      } else {
        events.push({ ...data.events.user[j], left: false })
        j++
      }
    }

    if (i < data.events.chatgpt.length) {
      data.events.chatgpt.slice(i).forEach((e) => {
        return events.push({ ...e, left: true })
      })
    }

    if (j < data.events.user.length) {
      data.events.user.slice(j).forEach((e) => {
        return events.push({ ...e, left: false })
      })
    }

    events.push({
      name: "",
      date: "Today",
      description:
        "Your journey hasn't ended. Continue to discover and engage with ChatGPT’s evolving landscape.",
      link: "https://chat.openai.com/",
      left: false
    })
    return events
  }, [data])

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <h2 className="text-xl font-medium md:text-2xl">My ChatGPT Journey</h2>
      <Stats stats={data.stats} />
      <Events events={events} />
    </div>
  )
}

function Stats({ stats }: { stats: JourneyStats }) {
  return (
    <div className="mx-auto flex flex-col gap-0 text-base">
      <p>
        Engaged with ChatGPT for{" "}
        <span className="text-lg text-green-600">{stats.age}</span>{" "}
        {`day${stats.age > 1 ? "s" : ""}`}
      </p>
      <p>
        Initiated{" "}
        <span className="text-lg text-green-600">
          {stats.totalConversations}
        </span>{" "}
        {`conversation${stats.totalConversations > 1 ? "s" : ""}`}
      </p>
      {stats.totalShared > 0 && (
        <p>
          Shared{" "}
          <span className="text-lg text-green-600">{stats.totalShared}</span>{" "}
          {`conversation${stats.totalShared > 1 ? "s" : ""}`}
        </p>
      )}
      <p className="mt-4">
        Composed{" "}
        <span className="text-lg text-green-600">{stats.totalMessages}</span>{" "}
        {`messsage${stats.totalMessages > 1 ? "s" : ""} `} in total
      </p>
      {stats.totalGPT4Messages > 0 && (
        <p className="ml-4">
          <span className="text-lg text-green-600">
            {stats.totalGPT4Messages}
          </span>{" "}
          {`messsage${stats.totalGPT4Messages > 1 ? "s" : ""} `} with GPT-4
        </p>
      )}
      {stats.totalVisionMessages > 0 && (
        <p className="ml-4">
          <span className="text-lg text-green-600">
            {stats.totalVisionMessages}
          </span>{" "}
          {`messsage${stats.totalVisionMessages > 1 ? "s" : ""} `} using GPT-4
          Vision
        </p>
      )}
      {stats.totalImageMessages > 0 && (
        <p className="ml-4">
          <span className="text-lg text-green-600">
            {stats.totalImageMessages}
          </span>{" "}
          {`image${stats.totalImageMessages > 1 ? "s" : ""} `}
          created with DALL-E 3
        </p>
      )}
    </div>
  )
}

function Events({ events }: { events: DisplayEvent[] }) {
  return (
    <div className="relative my-10 h-full w-full overflow-hidden">
      <div className="absolute right-1/2 h-full border-2" />
      {events.map((event, i) => (
        <div
          key={i}
          className={classNames(
            "mb-8 flex w-full items-center justify-between",
            event.left ? "flex-row-reverse" : "flex-row"
          )}>
          <div className="w-5/12"></div>
          <a
            className={classNames(
              "w-5/12 rounded-xl px-8 py-4",
              event.link ? "hover:bg-gray-50 dark:hover:bg-gray-700" : "",
              event.left ? "text-right" : "text-left"
            )}
            href={event.link}
            target="_blank"
            rel="noreferrer">
            <p className="mb-3 text-base text-yellow-300">
              {typeof event.date === "string"
                ? event.date
                : event.date.toLocaleDateString("en-US", {
                    weekday: undefined,
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
            </p>
            <h4 className="mb-3 text-lg font-bold md:text-2xl">{event.name}</h4>
            <p className="text-sm leading-snug md:text-base">
              {event.description}
            </p>
          </a>
        </div>
      ))}
    </div>
  )
}
