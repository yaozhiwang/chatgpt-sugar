import {
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

export const ChatGPTEvents: Event[] = [
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
  const conversations = await getAllConversations()
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

  for (const conversation of conversations) {
    const data = await getConversation(conversation.id)
    let numMessages = 0
    let numGPT4Messages = 0
    let numVisionMessages = 0
    let numImageMessages = 0
    for (const msgId in data.mapping) {
      const message = data.mapping[msgId].message
      if (!message || message.author?.role === "system") {
        continue
      }

      switch (message.author?.role) {
        case "user":
          if (message.content?.content_type === "multimodal_text") {
            numVisionMessages += 1
          }
          numMessages += 1
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
          }
      }
    }
    stats.totalMessages += numMessages
    stats.totalGPT4Messages += numGPT4Messages
    stats.totalVisionMessages += numVisionMessages
    stats.totalImageMessages += numImageMessages
  }

  return {
    stats,
    events: {
      chatgpt: ChatGPTEvents,
      user: []
    }
  }
}
