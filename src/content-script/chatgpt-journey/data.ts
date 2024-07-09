import {
  Conversation,
  GPTs,
  User,
  getConversations,
  getGPTs,
  getSharedConversations,
  getUser,
  listAllConversations,
  listMyGPTs
} from "@/lib/api"
import { ROOT_URL } from "@/lib/config"

export type Event = {
  date: Date
  name: string
  description?: string
  link?: string
}

export type JourneyStats = {
  age: number
  activeDays: number
  conversations: { total: number; shared: number; archived: number }
  messages: {
    total: number
    gpt4: number
    vision: number
    image: number
    voice: number
    webBrowser: number
    codeInterpreter: number
    file: number
  }
  gpts: {
    mine: {
      public: number
      private: number
      chats: { public: number; private: number }
    }
    thirdParty: { total: number; chats: number }
  }
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
  },
  {
    date: new Date("2024-01-10"),
    name: "GPT Store launch",
    link: "https://openai.com/blog/introducing-the-gpt-store",
    description:
      "The App store for GPTs. Also lanuch ChatGPT Team plan and start rolling out personalization and long-term memory."
  },
  {
    date: new Date("2024-02-13"),
    name: "ChatGPT Gets Memories",
    link: "https://openai.com/blog/memory-and-new-controls-for-chatgpt",
    description:
      "Remembering things you discuss across all chats saves you from having to repeat information and makes future conversations more helpful. "
  }
]

export async function collectJourneyData(): Promise<JourneyData> {
  const conversationList = await listAllConversations()

  const conversations = await getConversations(
    conversationList.map((c) => c.id)
  )

  const myGPTs = await listMyGPTs()

  const { user, stats, events } = await collectStatsAndUserEvents(
    conversations,
    myGPTs
  )

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
  FirstCodeInterpreter = "First Code Interpreter Conversation",
  FirstFile = "First Conversation with a File",
  FirstGPTs = "First GPTs Conversation",
  FirstCreateGPTs = "Create First GPTs"
}

type UserEventDataType = { numMessages?: number }
class UserEvent {
  name: UserEventName
  date?: Date
  conversationId?: string
  gptsUrl?: string
  data?: UserEventDataType

  constructor({
    name,
    date,
    conversationId,
    gptsUrl,
    data
  }: {
    name: UserEventName
    date?: Date
    conversationId?: string
    gptsUrl?: string
    data?: UserEventDataType
  }) {
    this.name = name
    this.date = date
    this.conversationId = conversationId
    this.gptsUrl = gptsUrl
    this.data = data
  }

  getLink(): string {
    if (this.name === UserEventName.FirstGPTs) {
      return `${ROOT_URL}/g/${this.gptsUrl}/c/${this.conversationId}`
    } else if (this.name === UserEventName.FirstCreateGPTs) {
      return `${ROOT_URL}/g/${this.gptsUrl}`
    }
    return `${ROOT_URL}/c/${this.conversationId}`
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
      case UserEventName.FirstFile:
        return "Chat about your file."
      case UserEventName.FirstGPTs:
        return "Exploring new dimensions with diverse capabilities."
      case UserEventName.FirstCreateGPTs:
        return "Make your own version of ChatGPT."
    }
  }
}

async function collectStatsAndUserEvents(
  conversations: Conversation[],
  myGPTs: GPTs[]
): Promise<{ user: User; stats: JourneyStats; events: Event[] }> {
  const shared = await getSharedConversations({ limit: 1 })
  const user = await getUser()

  const stats: JourneyStats = {
    age: Math.ceil(
      (Date.now() - user.created.getTime()) / (1000 * 60 * 60 * 24)
    ),
    activeDays: 0,
    conversations: {
      total: conversations.length,
      shared: shared.total,
      archived: 0
    },
    messages: {
      total: 0,
      gpt4: 0,
      vision: 0,
      image: 0,
      voice: 0,
      webBrowser: 0,
      codeInterpreter: 0,
      file: 0
    },
    gpts: {
      mine: { public: 0, private: 0, chats: { public: 0, private: 0 } },
      thirdParty: { total: 0, chats: 0 }
    }
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
    }),
    [UserEventName.FirstFile]: new UserEvent({
      name: UserEventName.FirstFile
    }),
    [UserEventName.FirstGPTs]: new UserEvent({
      name: UserEventName.FirstGPTs
    }),
    [UserEventName.FirstCreateGPTs]: new UserEvent({
      name: UserEventName.FirstCreateGPTs
    })
  }

  const gpts = new Map<string, GPTs>()
  for (const gpt of myGPTs) {
    gpts.set(gpt.id, gpt)
    if (gpt.share_recipient !== "private") {
      stats.gpts.mine.chats.public += gpt.vanity_metrics.num_conversations
      stats.gpts.mine.public += 1
    } else {
      stats.gpts.mine.private += 1
    }
  }
  const dailyMessages = new Map<string, number>()
  const gptsConversations = new Map<string, number>()

  for (const conversation of conversations) {
    if (conversation.is_archived) {
      stats.conversations.archived += 1
    }
    const gptId = conversation.gizmo_id
    if (gptId) {
      gptsConversations.set(gptId, (gptsConversations.get(gptId) ?? 0) + 1)

      const firstGPTs = userEvents[UserEventName.FirstGPTs]
      if (!firstGPTs.conversationId) {
        firstGPTs.conversationId = conversation.id
        firstGPTs.date = conversation.create_time

        if (gpts.has(gptId)) {
          firstGPTs.gptsUrl = gpts.get(gptId)!.short_url
        } else {
          const gpt = await getGPTs(gptId)
          firstGPTs.gptsUrl = gpt.short_url
        }
      }

      if (gpts.has(gptId)) {
        const firstCreateGPTs = userEvents[UserEventName.FirstCreateGPTs]
        if (!firstCreateGPTs.conversationId) {
          firstCreateGPTs.conversationId = conversation.id
          firstCreateGPTs.date = conversation.create_time
          firstCreateGPTs.gptsUrl = gpts.get(gptId)!.short_url
        }
      }
    }

    let numMessages = {
      total: 0,
      gpt4: 0,
      vision: 0,
      image: 0,
      voice: 0,
      webBrowser: 0,
      codeInterpreter: 0,
      file: 0
    }
    const toolMsg = new Map<string, string[]>()
    for (const msgId in conversation.mapping) {
      const message = conversation.mapping[msgId].message
      if (!message || message.author?.role === "system") {
        continue
      }

      switch (message.author?.role) {
        case "user":
          if (message.content?.content_type === "multimodal_text") {
            numMessages.vision += 1

            const firstVision = userEvents[UserEventName.FirstVision]
            if (!firstVision.conversationId) {
              firstVision.conversationId = conversation.id
              firstVision.date = conversation.create_time
            }
          } else if (message.metadata.attachments) {
            numMessages.file += 1
            const firstFile = userEvents[UserEventName.FirstFile]
            if (!firstFile.conversationId) {
              firstFile.conversationId = conversation.id
              firstFile.date = conversation.create_time
            }
          }
          if (message.metadata.voice_mode_message) {
            numMessages.voice += 1
            const firstVoice = userEvents[UserEventName.FirstVoice]
            if (!firstVoice.conversationId) {
              firstVoice.conversationId = conversation.id
              firstVoice.date = conversation.create_time
            }
          }
          numMessages.total += 1

          const date = message.create_time.toDateString()
          dailyMessages.set(date, (dailyMessages.get(date) ?? 0) + 1)
          break
        case "assistant":
          if (message.content?.content_type === "code") {
            let first: UserEvent | null = null
            let tool: string | null = null
            if (message.recipient === "dalle.text2im") {
              tool = message.recipient
              first = userEvents[UserEventName.FirstImage]
            } else if (message.recipient === "browser") {
              tool = message.recipient
              first = userEvents[UserEventName.FirstWebBrowser]
            } else if (message.recipient === "python") {
              tool = message.recipient
              first = userEvents[UserEventName.FirstCodeInterpreter]
            }
            if (first && !first.conversationId) {
              first.conversationId = conversation.id
              first.date = conversation.create_time
            }
            if (tool) {
              if (toolMsg.has(tool)) {
                toolMsg.get(tool)!.push(message.id)
              } else {
                toolMsg.set(tool, [message.id])
              }
            }
          } else if (
            message.metadata?.model_slug === "gpt-4" &&
            message.end_turn
          ) {
            numMessages.gpt4 += 1

            const firstGPT4 = userEvents[UserEventName.FirstGPT4]
            if (!firstGPT4.conversationId) {
              firstGPT4.conversationId = conversation.id
              firstGPT4.date = conversation.create_time
            }
          }
          break
      }
    }

    for (const [tool, msgIds] of toolMsg) {
      let num = 1
      if (msgIds.length > 1) {
        // find out which messages belong to a same turn
        const turns = new Map<string, boolean>()
        for (const id of msgIds) {
          let msg = conversation.mapping[conversation.mapping[id].parent]
          while (msg.message.author.role !== "user" && msg.parent) {
            msg = conversation.mapping[msg.parent]
          }
          turns.set(msg.id, true)
        }
        num = turns.size
      }

      if (tool === "dalle.text2im") {
        numMessages.image += num
      } else if (tool === "browser") {
        numMessages.webBrowser += num
      } else if (tool === "python") {
        numMessages.codeInterpreter += num
      }
    }

    const longest = userEvents[UserEventName.Longest]
    if (numMessages.total > longest.data!.numMessages!) {
      longest.data!.numMessages = numMessages.total
      longest.conversationId = conversation.id
      longest.date = conversation.create_time
    }

    stats.messages.total += numMessages.total
    stats.messages.gpt4 += numMessages.gpt4
    stats.messages.vision += numMessages.vision
    stats.messages.image += numMessages.image
    stats.messages.voice += numMessages.voice
    stats.messages.webBrowser += numMessages.webBrowser
    stats.messages.codeInterpreter += numMessages.codeInterpreter
    stats.messages.file += numMessages.file
  }

  for (const [id, count] of gptsConversations) {
    if (gpts.has(id)) {
      if (gpts.get(id)!.share_recipient === "private") {
        stats.gpts.mine.chats.private += count
      }
    } else {
      stats.gpts.thirdParty.total += 1
      stats.gpts.thirdParty.chats += count
    }
  }

  const events = userEventsToEvents(Object.values(userEvents))

  stats.activeDays = dailyMessages.size
  if (dailyMessages.size > 0) {
    let maxMsgs = 0,
      maxDate = undefined
    for (const [d, count] of dailyMessages) {
      if (count > maxMsgs) {
        maxMsgs = count
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
      link: `${ROOT_URL}/share/${shared.items[0].id}`,
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
        link: u.getLink(),
        description: u.getDescription()
      }
    })
}
