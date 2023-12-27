import { AppError, ErrorCode } from "./error"

export type Message = {
  id: string
  author: { role: "system" | "user" | "assistant" | "tool"; name?: string }
  content: {
    content_type: "text" | "code" | "multimodal_text"
    recipient: string
    parts?: (
      | string
      | { content_type: "image_asset_pointer"; asset_pointer: string }
    )[]
    language?: string
    text?: string
  }
  create_time: Date
  metadata: { model_slug?: string }
}

export type Conversation = {
  id: string
  create_time: Date
  update_time: Date
  title: string
  is_archive: boolean
  mapping: {
    [key: string]: {
      id: string
      children: string[]
      parent: string
      message: Message
    }
  }
}

export type User = {
  created: Date
  name: string
  picture: string
}

const ConversationConverter = (item: any): Conversation => {
  if (item.mapping) {
    for (const id in item.mapping) {
      const message = item.mapping[id].message
      if (!message || !message.create_time) {
        continue
      }
      message.create_time = DateConverter(message.create_time)
    }
  }
  return {
    ...item,
    create_time: DateConverter(item.create_time),
    update_time: DateConverter(item.update_time)
  }
}

const DateConverter = (d: string | number): Date => {
  if (typeof d === "string") {
    return new Date(d)
  } else if (typeof d === "number") {
    const str = d.toString()
    if (str.length === 13) {
      return new Date(d)
    }
    const int = str.split(".")[0]
    if (int.length === 10) {
      return new Date(Math.floor(d * 1000))
    }
  }
  throw new Error(`unknown format of date: ${d}`)
}

export async function getAllConversations(): Promise<Conversation[]> {
  const conversations: Conversation[] = []
  const limit = 50
  let total = 0
  do {
    const offset = conversations.length
    const data = await getConversations({ offset, limit })
    conversations.push(...data.items)
    total = data.total
  } while (conversations.length < total)

  return conversations
}

export async function getConversations({
  offset,
  limit,
  order = "created"
}: {
  offset: number
  limit: number
  order?: string
}) {
  const resp = await requestBackendAPI(
    "GET",
    `/conversations?offset=${offset}&limit=${limit}&order=${order}`
  )

  const data = await resp.json()
  return { ...data, items: data.items.map(ConversationConverter).reverse() }
}

export async function getSharedConversationsCount() {
  const resp = await requestBackendAPI(
    "GET",
    `/shared_conversations?offset=0&limit=1&order=created`
  )

  const data = await resp.json()
  return data.total
}

export async function getUser(): Promise<User> {
  const resp = await requestBackendAPI("GET", `/me`)

  const data = await resp.json()
  return { ...data, created: DateConverter(data.created) }
}

export async function getConversation(id: string) {
  const resp = await requestBackendAPI("GET", `/conversation/${id}`)

  const data = await resp.json()
  return { ...ConversationConverter({ ...data, id: data.conversation_id }) }
}

let accessToken = ""
async function requestBackendAPI(
  method: "GET" | "POST",
  path: string,
  data?: unknown
) {
  if (!accessToken) {
    accessToken = await getAccessToken()
  }

  return fetch(`https://chat.openai.com/backend-api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: data === undefined ? undefined : JSON.stringify(data)
  })
}

async function getAccessToken(): Promise<string> {
  const resp = await fetch("https://chat.openai.com/api/auth/session")
  if (resp.status === 403) {
    throw new AppError(
      "Please pass Cloudflare check",
      ErrorCode.CHATGPT_CLOUDFLARE
    )
  }
  const data = await resp.json().catch(() => ({}))
  if (!data.accessToken) {
    throw new AppError("UNAUTHORIZED", ErrorCode.CHATGPT_UNAUTHORIZED)
  }
  return data.accessToken
}
