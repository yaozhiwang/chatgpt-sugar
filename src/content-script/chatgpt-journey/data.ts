import {
  Conversation,
  User,
  getConversations,
  getSharedConversations,
  getUser,
  listAllConversations
} from "@/lib/api"

export type Event = {
  date: Date
  name: string
  description?: string
  link?: string
}

export type JourneyStats = {
  age: number
  activeDays: number
  totalConversations: number
  totalShared: number
  totalMessages: number
  totalGPT4Messages: number
  totalVisionMessages: number
  totalImageMessages: number
  totalVoiceMessages: number
  totalWebBrowserMessages: number
  totalCodeInterpreterMessages: number
}

export type JourneyData = {
  user: User
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
    link: "https://openai.com/blog/chatgpt",
    description: "Cake day of ChatGPT"
  },
  {
    date: new Date("2023-02-01"),
    name: "ChatGPT Plus launch",
    link: "https://openai.com/blog/chatgpt-plus",
    description: "Get get access to GPT-4, DALL-E 3 and GPTs"
  },
  {
    date: new Date("2023-03-23"),
    name: "ChatGPT plugins launch",
    link: "https://openai.com/blog/chatgpt-plugins",
    description: "Web Browser, Code Interpreter and third-party services"
  },
  /*
  {
    date: new Date("2023-05-18"),
    name: "ChatGPT app for iOS launch",
    link: "https://openai.com/blog/introducing-the-chatgpt-app-for-ios"
  },
  */
  {
    date: new Date("2023-07-20"),
    name: "Introducing custom instructions",
    link: "https://openai.com/blog/custom-instructions-for-chatgpt",
    description: "Set your preferences, and ChatGPT will keep them in mind."
  },
  {
    date: new Date("2023-09-25"),
    name: "Roll Out Voice and Image Capabilities",
    link: "https://openai.com/blog/chatgpt-can-now-see-hear-and-speak",
    description: "Have voice conversation, and chat about images"
  },
  {
    date: new Date("2023-10-09"),
    name: "DALL·E 3 launch",
    link: "https://openai.com/blog/dall-e-3-is-now-available-in-chatgpt-plus-and-enterprise",
    description: "Create unique images from a simple conversation"
  },
  {
    date: new Date("2023-11-06"),
    name: "GPTs launch",
    link: "https://openai.com/blog/introducing-gpts",
    description: "Create your own versions of ChatGPT without coding"
  }
]

export async function collectJourneyData(): Promise<JourneyData> {
  const conversationList = await listAllConversations()

  const conversations = await getConversations(
    conversationList.map((c) => c.id)
  )

  const { user, stats, events } = await collectStatsAndUserEvents(conversations)

  return {
    user,
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
  FirstImage = "Create First Image with DALLE",
  FirstVoice = "First Voice Conversation",
  FirstWebBrowser = "First Web Browser Conversation",
  FirstCodeInterpreter = "First Code Interpreter Conversation"
}

type UserEventDataType = { numMessages?: number }
class UserEvent {
  name: UserEventName
  date?: Date
  conversationId?: string
  data?: UserEventDataType

  constructor({
    name,
    date,
    conversationId,
    data
  }: {
    name: UserEventName
    date?: Date
    conversationId?: string
    data?: UserEventDataType
  }) {
    this.name = name
    this.date = date
    this.conversationId = conversationId
    this.data = data
  }

  getDescription(): string {
    switch (this.name) {
      case UserEventName.First:
        return "Where it all began."
      case UserEventName.Milestone100:
        return "Established a strong friendship with ChatGPT."
      case UserEventName.Milestone1000:
        return "ChatGPT became an indispensable partner to you."
      case UserEventName.Longest:
        return `Your marathon session spanned ${this.data?.numMessages} messages.`
      case UserEventName.FirstGPT4:
        return "First leap into the future, get the most accurate answer."
      case UserEventName.FirstVision:
        return "Welcome to the era of multimodal AI."
      case UserEventName.FirstImage:
        return "Realize your dream of becoming an artist."
      case UserEventName.FirstVoice:
        return "Speak to ChatGPT using your voice."
      case UserEventName.FirstWebBrowser:
        return "Get up-to-date information from Web with ChatGPT."
      case UserEventName.FirstCodeInterpreter:
        return "Unleash the power of Python in ChatGPT."
    }
  }
}

async function collectStatsAndUserEvents(
  conversations: Conversation[]
): Promise<{ user: User; stats: JourneyStats; events: Event[] }> {
  const shared = await getSharedConversations({ limit: 1 })
  const user = await getUser()

  const stats: JourneyStats = {
    age: Math.ceil(
      (Date.now() - user.created.getTime()) / (1000 * 60 * 60 * 24)
    ),
    activeDays: 0,
    totalConversations: conversations.length,
    totalShared: shared.total,
    totalMessages: 0,
    totalGPT4Messages: 0,
    totalVisionMessages: 0,
    totalImageMessages: 0,
    totalVoiceMessages: 0,
    totalWebBrowserMessages: 0,
    totalCodeInterpreterMessages: 0
  }

  const userEvents: { [key in UserEventName]: UserEvent } = {
    [UserEventName.First]: new UserEvent({
      name: UserEventName.First,
      date: conversations[0]?.create_time,
      conversationId: conversations[0]?.id
    }),
    [UserEventName.Milestone100]: new UserEvent({
      name: UserEventName.Milestone100,
      date: conversations[99]?.create_time,
      conversationId: conversations[99]?.id
    }),
    [UserEventName.Milestone1000]: new UserEvent({
      name: UserEventName.Milestone1000,
      date: conversations[999]?.create_time,
      conversationId: conversations[999]?.id
    }),
    [UserEventName.Longest]: new UserEvent({
      name: UserEventName.Longest,
      data: { numMessages: 0 }
    }),
    [UserEventName.FirstGPT4]: new UserEvent({
      name: UserEventName.FirstGPT4
    }),
    [UserEventName.FirstVision]: new UserEvent({
      name: UserEventName.FirstVision
    }),
    [UserEventName.FirstImage]: new UserEvent({
      name: UserEventName.FirstImage
    }),
    [UserEventName.FirstVoice]: new UserEvent({
      name: UserEventName.FirstVoice
    }),
    [UserEventName.FirstWebBrowser]: new UserEvent({
      name: UserEventName.FirstWebBrowser
    }),
    [UserEventName.FirstCodeInterpreter]: new UserEvent({
      name: UserEventName.FirstCodeInterpreter
    })
  }

  const dailyMessages: { [key: string]: number } = {}

  for (const conversation of conversations) {
    let numMessages = 0
    let numGPT4Messages = 0
    let numVisionMessages = 0
    let numImageMessages = 0
    let numVoiceMessages = 0
    let numWebBrowserMessages = 0
    let numCodeInterpreterMessages = 0
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
          if (message.metadata.voice_mode_message) {
            numVoiceMessages += 1
            const firstVoice = userEvents[UserEventName.FirstVoice]
            if (!firstVoice.conversationId) {
              firstVoice.conversationId = conversation.id
              firstVoice.date = conversation.create_time
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
          if (message.content?.content_type === "code") {
            let first: UserEvent | null = null
            if (message.recipient === "dalle.text2im") {
              numImageMessages += 1
              first = userEvents[UserEventName.FirstImage]
            } else if (message.recipient === "browser") {
              numWebBrowserMessages += 1
              first = userEvents[UserEventName.FirstWebBrowser]
            } else if (message.recipient === "python") {
              numCodeInterpreterMessages += 1
              first = userEvents[UserEventName.FirstCodeInterpreter]
            }
            if (first && !first.conversationId) {
              first.conversationId = conversation.id
              first.date = conversation.create_time
            }
          } else if (message.metadata?.model_slug === "gpt-4") {
            numGPT4Messages += 1

            const firstGPT4 = userEvents[UserEventName.FirstGPT4]
            if (!firstGPT4.conversationId) {
              firstGPT4.conversationId = conversation.id
              firstGPT4.date = conversation.create_time
            }
          }
          break
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
    stats.totalVoiceMessages += numVoiceMessages
    stats.totalWebBrowserMessages += numWebBrowserMessages
    stats.totalCodeInterpreterMessages += numCodeInterpreterMessages
  }

  const events = userEventsToEvents(Object.values(userEvents))

  stats.activeDays = Object.keys(dailyMessages).length
  if (Object.keys(dailyMessages).length > 0) {
    let maxMsgs = 0,
      maxDate = undefined
    for (const d in dailyMessages) {
      if (dailyMessages[d] > maxMsgs) {
        maxMsgs = dailyMessages[d]
        maxDate = new Date(d)
      }
    }

    const maxActiveDate: Event = {
      name: "Most Active Day",
      date: maxDate!,
      description: `On your busiest day, you exchanged a ${maxMsgs} messages with ChatGPT.`
    }
    events.push(maxActiveDate)
  }

  if (shared.total > 0) {
    events.push({
      name: "First Shared Conversation",
      date: shared.items[0].create_time,
      link: `https://chat.openai.com/share/${shared.items[0].id}`,
      description:
        "Thank you for spreading the word and inspiring others with your AI encounter."
    })
  }

  let years = 1
  while (true) {
    const d = new Date(user.created).setFullYear(
      user.created.getFullYear() + years
    )
    if (d > Date.now()) {
      break
    }
    events.push({
      name: `${years}-Year Anniversary`,
      date: new Date(d),
      description: `Celebrating ${years} year${
        years > 1 ? "s" : ""
      } engaging with ChatGPT.`
    })
    years += 1
  }

  return {
    user,
    stats,
    events: events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }
}

function userEventsToEvents(userEvents: UserEvent[]): Event[] {
  return userEvents
    .filter((u) => u.date)
    .map((u) => {
      return {
        date: u.date!,
        name: u.name,
        link: `https://chat.openai.com/c/${u.conversationId}`,
        description: u.getDescription()
      }
    })
}
