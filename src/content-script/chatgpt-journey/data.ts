import {
  Conversation,
  getAllConversations,
  getConversation,
  getSharedConversationsCount,
  getUser
} from "@/lib/api"

export type Event = {
  date: Date
  name: string
  descriptoin?: string
  link?: string
  data?: { numMessages?: number }
}

export type JourneyStats = {
  age: number
  totalConversations: number
  totalShared: number
  totalMessages: number
  totalGPT4Messages: number
  totalVisionMessages: number
  totalImageMessages: number
}

export type JourneyData = {
  stats: JourneyStats
  events: {
    chatgpt: Event[]
    user: Event[]
  }
}

const ChatGPTEvents: Event[] = [
  {
    date: new Date("2022-11-30"),
    name: "ChatGPT launch",
    link: "https://openai.com/blog/chatgpt"
  },
  {
    date: new Date("2023-02-01"),
    name: "ChatGPT Plus launch",
    link: "https://openai.com/blog/chatgpt-plus"
  },
  {
    date: new Date("2023-03-23"),
    name: "ChatGPT plugins launch",
    link: "https://openai.com/blog/chatgpt-plugins"
  },
  {
    date: new Date("2023-05-18"),
    name: "ChatGPT app for iOS launch",
    link: "https://openai.com/blog/introducing-the-chatgpt-app-for-ios"
  },
  {
    date: new Date("2023-07-20"),
    name: "Introducing custom instructions",
    link: "https://openai.com/blog/custom-instructions-for-chatgpt"
  },
  {
    date: new Date("2023-09-25"),
    name: "GPT-4V launch",
    link: "https://openai.com/blog/chatgpt-can-now-see-hear-and-speak"
  },
  {
    date: new Date("2023-10-09"),
    name: "DALL·E 3 launch",
    link: "https://openai.com/blog/dall-e-3-is-now-available-in-chatgpt-plus-and-enterprise"
  },
  {
    date: new Date("2023-11-06"),
    name: "GPTs launch",
    link: "https://openai.com/blog/introducing-gpts"
  }
]

export async function collectJourneyData(): Promise<JourneyData> {
  const conversationList = await getAllConversations()

  const conversations: Conversation[] = []
  for (const conversation of conversationList) {
    conversations.push(await getConversation(conversation.id))
  }

  const { stats, events } = await collectStatsAndUserEvents(conversations)

  return {
    stats,
    events: {
      chatgpt: ChatGPTEvents,
      user: events
    }
  }
}

enum UserEventName {
  First = "First Conversation",
  Longest = "Longest Conversation",
  Milestone100 = "100th Conversation",
  Milestone1000 = "1000th Conversation",
  FirstGPT4 = "First GPT-4 Conversation",
  FirstVision = "First Conversation with Vision",
  FirstImage = "First Conversation with DALLE"
}

type UserEvent = {
  name: UserEventName
  date?: Date
  conversationId?: string
  data?: { numMessages?: number }
}

async function collectStatsAndUserEvents(
  conversations: Conversation[]
): Promise<{ stats: JourneyStats; events: Event[] }> {
  const totalShared = await getSharedConversationsCount()
  const user = await getUser()

  const stats: JourneyStats = {
    age: Math.ceil(
      (Date.now() - user.created.getTime()) / (1000 * 60 * 60 * 24)
    ),
    totalConversations: conversations.length,
    totalShared,
    totalMessages: 0,
    totalGPT4Messages: 0,
    totalVisionMessages: 0,
    totalImageMessages: 0
  }

  const userEvents: { [key in UserEventName]: UserEvent } = {
    [UserEventName.First]: {
      name: UserEventName.First,
      date: conversations[0]?.create_time,
      conversationId: conversations[0]?.id
    },
    [UserEventName.Milestone100]: {
      name: UserEventName.Milestone100,
      date: conversations[99]?.create_time,
      conversationId: conversations[99]?.id
    },
    [UserEventName.Milestone1000]: {
      name: UserEventName.Milestone1000,
      date: conversations[999]?.create_time,
      conversationId: conversations[999]?.id
    },
    [UserEventName.Longest]: {
      name: UserEventName.Longest,
      data: { numMessages: 0 }
    },
    [UserEventName.FirstGPT4]: {
      name: UserEventName.FirstGPT4
    },
    [UserEventName.FirstVision]: {
      name: UserEventName.FirstVision
    },
    [UserEventName.FirstImage]: {
      name: UserEventName.FirstImage
    }
  }

  const dailyMessages: { [key: string]: number } = {}

  for (const conversation of conversations) {
    let numMessages = 0
    let numGPT4Messages = 0
    let numVisionMessages = 0
    let numImageMessages = 0
    for (const msgId in conversation.mapping) {
      const message = conversation.mapping[msgId].message
      if (!message || message.author?.role === "system") {
        continue
      }

      switch (message.author?.role) {
        case "user":
          if (message.content?.content_type === "multimodal_text") {
            numVisionMessages += 1

            const firstVision = userEvents[UserEventName.FirstVision]
            if (!firstVision.conversationId) {
              firstVision.conversationId = conversation.id
              firstVision.date = conversation.create_time
            }
          }
          numMessages += 1

          const date = message.create_time.toDateString()
          if (dailyMessages[date]) {
            dailyMessages[date] += 1
          } else {
            dailyMessages[date] = 1
          }
          break
        case "assistant":
          if (
            message.content?.content_type === "code" &&
            message.content?.recipient === "dalle.text2im"
          ) {
            // message that GPT-4 sends to DALLE
            continue
          }
          if (message.metadata?.model_slug === "gpt-4") {
            numGPT4Messages += 1

            const firstGPT4 = userEvents[UserEventName.FirstGPT4]
            if (!firstGPT4.conversationId) {
              firstGPT4.conversationId = conversation.id
              firstGPT4.date = conversation.create_time
            }
          }
          break
        case "tool":
          if (
            message.author?.name === "dalle.text2im" &&
            // there is an extra message from DALLE to GPT-4 with content_type === "text",
            // we exclude it
            message.content?.content_type === "multimodal_text"
          ) {
            numImageMessages += 1

            const firstImage = userEvents[UserEventName.FirstImage]
            if (!firstImage.conversationId) {
              firstImage.conversationId = conversation.id
              firstImage.date = conversation.create_time
            }
          }
      }
    }

    const longest = userEvents[UserEventName.Longest]
    if (numMessages > longest.data!.numMessages!) {
      longest.data!.numMessages = numMessages
      longest.conversationId = conversation.id
      longest.date = conversation.create_time
    }

    stats.totalMessages += numMessages
    stats.totalGPT4Messages += numGPT4Messages
    stats.totalVisionMessages += numVisionMessages
    stats.totalImageMessages += numImageMessages
  }

  const events = userEventsToEvents(Object.values(userEvents))

  if (Object.keys(dailyMessages).length > 0) {
    const maxActiveDate: Event = {
      name: "Most Active Day",
      date: new Date(),
      data: { numMessages: 0 }
    }
    for (const d in dailyMessages) {
      if (dailyMessages[d] > maxActiveDate.data?.numMessages!) {
        maxActiveDate.data!.numMessages = dailyMessages[d]
        maxActiveDate.date = new Date(d)
      }
    }

    events.push(maxActiveDate)
  }

  return { stats, events }
}

function userEventsToEvents(userEvents: UserEvent[]): Event[] {
  return userEvents
    .filter((u) => u.date)
    .map((u) => {
      return {
        date: u.date!,
        name: u.name,
        link: `https://chat.openai.com/c/${u.conversationId}`,
        data: u.data
      }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}
