import { useMemo } from "react"

import { User } from "@/lib/api"
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
    <div className="flex w-full flex-col items-center gap-8 px-2 py-5">
      <Header user={data.user} stats={data.stats} />
      <Stats stats={data.stats} />
      <Events events={events} />
    </div>
  )
}

function Header({ user, stats }: { user: User; stats: JourneyStats }) {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="gizmo-shadow-stroke flex h-20 w-20 items-center justify-center overflow-hidden rounded-full">
        <div className="relative flex">
          <img alt="user photo" src={user.picture} />
        </div>
      </div>
      <div className="mt-2 w-full text-center text-lg font-bold">
        {user.name}
      </div>
      <div className="w-full text-center text-sm font-normal">
        🌟 Enjoying the journey for{" "}
        <span className="text-base font-medium text-green-600">
          {stats.age}
        </span>{" "}
        days and counting!
      </div>
      <div className="w-full text-center text-sm font-normal">
        Engaged on{" "}
        <span className="text-base font-medium text-green-600">
          {stats.activeDays}
        </span>{" "}
        of those days
      </div>
    </div>
  )
}

function Stats({ stats }: { stats: JourneyStats }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="border-token-border-medium flex w-full flex-col gap-4 rounded-lg border px-2 py-4">
        <div className="flex w-full flex-col items-center gap-2">
          <p className="text-3xl font-bold text-green-600">
            {stats.totalConversations}
          </p>
          <p className="w-full text-center text-sm font-normal">
            Total conversations
          </p>
        </div>
        <div className="grid w-full grid-cols-1 md:!grid-cols-3">
          <div className="flex flex-col items-center">
            <p className="text-xl font-medium text-green-600">
              {Math.round(stats.totalConversations / stats.activeDays)}
            </p>
            <p className="w-full text-center text-sm font-normal">
              Conversations per day
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xl font-medium text-green-600">
              {Math.round(stats.totalMessages / stats.totalConversations)}
            </p>
            <p className="w-full text-center text-sm font-normal">
              Messages per conversation
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xl font-bold text-green-600">
              {stats.totalShared}
            </p>
            <p className="w-full text-center text-sm font-normal">
              Shared conversations
            </p>
          </div>
        </div>
      </div>
      <div className="border-token-border-medium flex w-full flex-col gap-4 rounded-lg border px-2 py-4">
        <div className="flex w-full flex-col items-center gap-2">
          <p className="text-3xl font-bold text-green-600">
            {stats.totalMessages}
          </p>
          <p className="w-full text-center text-sm font-normal">
            Total messages
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-y-4 md:!grid-cols-3">
          <div className="flex w-full flex-col items-center">
            <p className="text-xl font-medium text-green-600">
              {stats.totalGPT4Messages}
            </p>
            <p className="w-full text-center text-sm font-normal">
              GPT4 messsages
            </p>
          </div>
          <div className="flex w-full flex-col items-center">
            <p className="text-xl font-medium text-green-600">
              {stats.totalVisionMessages}
            </p>
            <p className="w-full text-center text-sm font-normal">
              Messages with Vision
            </p>
          </div>
          <div className="flex w-full flex-col items-center">
            <p className="text-xl font-bold text-green-600">
              {stats.totalImageMessages}
            </p>
            <p className="w-full text-center text-sm font-normal">
              Images created
            </p>
          </div>
          <div className="flex w-full flex-col items-center">
            <p className="text-xl font-bold text-green-600">
              {stats.totalVoiceMessages}
            </p>
            <p className="w-full text-center text-sm font-normal">
              Voice Messages
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Events({ events }: { events: DisplayEvent[] }) {
  return (
    <div className="relative mt-10 h-full w-full overflow-hidden">
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
            <p className="mb-3 text-base text-green-600">
              {typeof event.date === "string"
                ? event.date
                : event.date.toLocaleDateString("en-US", {
                    weekday: undefined,
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
            </p>
            <h4 className="mb-3 text-lg font-bold md:text-xl">{event.name}</h4>
            <p className="text-sm leading-snug md:text-base">
              {event.description}
            </p>
          </a>
        </div>
      ))}
    </div>
  )
}
