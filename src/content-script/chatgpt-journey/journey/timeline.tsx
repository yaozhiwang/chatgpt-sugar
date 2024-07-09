import { useMemo } from "react"

import { User } from "@/lib/api"
import { ROOT_URL } from "@/lib/config"
import { classNames } from "@/lib/utils"

import { Event, JourneyData, JourneyStats } from "../data"

type DisplayEvent = Omit<Event, "date"> & { date: Date | string; left: boolean }

export default function Timeline({
  data,
  showUser,
  showEvents
}: {
  data: JourneyData
  showUser: boolean
  showEvents: boolean
}) {
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
      link: ROOT_URL,
      left: false
    })
    return events
  }, [data])

  return (
    <div className="flex w-full flex-col items-center gap-8 px-2 py-5">
      <Header user={showUser ? data.user : null} stats={data.stats} />
      <Stats stats={data.stats} />
      {showEvents && <Events events={events} />}
    </div>
  )
}

function Header({ user, stats }: { user: User | null; stats: JourneyStats }) {
  return (
    <div className="flex w-full flex-col items-center">
      {user && (
        <>
          <div className="gizmo-shadow-stroke flex h-20 w-20 items-center justify-center overflow-hidden rounded-full">
            <div className="relative flex">
              <img alt="user photo" src={user.picture} />
            </div>
          </div>
          <div className="mt-2 w-full text-center text-lg font-bold">
            {user.name}
          </div>
        </>
      )}
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
  const data = [
    {
      total: { value: stats.conversations.total, title: "Total Conversations" },
      elements: [
        {
          value: Math.round(stats.conversations.total / stats.activeDays),
          title: "Conversations per day"
        },
        {
          value: Math.round(stats.messages.total / stats.conversations.total),
          title: "Messages per conversation"
        },
        {
          value: stats.conversations.shared,
          title: "Shared conversations"
        },
        {
          value: stats.conversations.archived,
          title: "Archived conversations"
        }
      ]
    },
    {
      total: { value: stats.messages.total, title: "Total messages" },
      elements: [
        {
          value: stats.messages.gpt4,
          title: "GPT4 messsages"
        },
        {
          value: stats.messages.total - stats.messages.gpt4,
          title: "GPT-3.5 Messages"
        }
      ],
      details: [
        {
          value: stats.messages.voice,
          title: "Voice messages"
        },
        {
          value: stats.messages.vision,
          title: "Messages with Vision"
        },
        {
          value: stats.messages.image,
          title: "Image messages"
        },
        {
          value: stats.messages.webBrowser,
          title: "Messages browsing Web"
        },
        {
          value: stats.messages.codeInterpreter,
          title: "Messages using Python"
        },
        {
          value: stats.messages.file,
          title: "Messages with File"
        }
      ]
    }
  ]

  let plusMessages = 0
  for (const [key, value] of Object.entries(stats.messages)) {
    if (key === "total") {
      continue
    }

    plusMessages += value
  }

  const totalGPTs =
    stats.gpts.mine.public +
    stats.gpts.mine.private +
    stats.gpts.thirdParty.total

  return (
    <div className="flex w-full flex-col gap-4">
      {plusMessages > 0 ? (
        <>
          {data.map(({ total, elements, details }, i) => (
            <div
              key={i}
              className="border-token-border-medium flex w-full flex-col gap-8 rounded-lg border px-2 py-4">
              <div className="flex w-full flex-col items-center gap-2">
                <p className="text-3xl font-bold text-green-600">
                  {total.value}
                </p>
                <p className="w-full text-center text-sm font-normal">
                  {total.title}
                </p>
              </div>

              {elements && (
                <div className="grid w-full grid-cols-2 gap-y-4">
                  {elements.map((item, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <p className="text-2xl font-bold text-green-600">
                        {item.value}
                      </p>
                      <p className="w-full text-center text-sm font-normal">
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {details && (
                <div className="grid w-full grid-cols-3 gap-y-4">
                  {details.map((item, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <p className="text-xl font-medium text-green-600">
                        {item.value}
                      </p>
                      <p className="w-full text-center text-sm font-normal">
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        <div className="border-token-border-medium flex w-full flex-col gap-8 rounded-lg border px-2 py-4">
          <div className="grid w-full grid-cols-2">
            {data.map(({ total }, i) => (
              <div key={i} className="flex w-full flex-col items-center gap-2">
                <p className="text-3xl font-bold text-green-600">
                  {total.value}
                </p>
                <p className="w-full text-center text-sm font-normal">
                  {total.title}
                </p>
              </div>
            ))}
          </div>

          <div className="grid w-full grid-cols-2 gap-y-4">
            {data[0].elements.map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <p className="text-xl font-medium text-green-600">
                  {item.value}
                </p>
                <p className="w-full text-center text-sm font-normal">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {totalGPTs > 0 && (
        <div className="border-token-border-medium flex w-full flex-col rounded-lg border px-2 py-4">
          <div className="flex w-full flex-col items-center gap-2">
            <p className="text-3xl font-bold text-green-600">{totalGPTs}</p>
            <p className="w-full text-center text-sm font-normal">Total GPTs</p>
          </div>
          <div className="grid w-full grid-cols-3 gap-y-4 pt-8">
            <div className="col-span-2">
              <div className="flex w-full flex-col items-center gap-2">
                <p className="text-2xl font-bold text-green-600">
                  {stats.gpts.mine.public + stats.gpts.mine.private}
                </p>
                <p className="w-full text-center text-sm font-normal">
                  GPTs created
                </p>
              </div>
            </div>
            <div className="border-token-border-medium col-span-1 border-l">
              <div className="flex w-full flex-col items-center gap-2">
                <p className="text-2xl font-bold text-green-600">
                  {stats.gpts.thirdParty.total}
                </p>
                <p className="w-full text-center text-sm font-normal">
                  third-party GPTs
                </p>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-3 gap-y-4">
            <div className="flex flex-col items-center pt-8">
              <p className="text-xl font-medium text-green-600">{`${stats.gpts.mine.public}/${stats.gpts.mine.private}`}</p>
              <p className="w-full text-center text-sm font-normal">
                {"public/private"}
              </p>
            </div>
            <div className="flex flex-col items-center pt-8">
              <p className="text-xl font-medium text-green-600">{`${stats.gpts.mine.chats.public}/${stats.gpts.mine.chats.private}`}</p>
              <div className="w-full text-center text-sm font-normal">
                <p>chats</p>
                <p>{"(public/private)"}</p>
              </div>
            </div>
            <div className="border-token-border-medium flex flex-col items-center border-l pt-8">
              <p className="text-xl font-medium text-green-600">
                {stats.gpts.thirdParty.chats}
              </p>
              <p className="w-full text-center text-sm font-normal">chats</p>
            </div>
          </div>
        </div>
      )}
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
