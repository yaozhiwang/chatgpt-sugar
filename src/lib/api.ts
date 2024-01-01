import { AppError, ErrorCode } from "./error"

export type Message = {
  id: string
  author: { role: "system" | "user" | "assistant" | "tool"; name?: string }
  content: {
    content_type: "text" | "code" | "multimodal_text"
    parts?: (
      | string
      | { content_type: "image_asset_pointer"; asset_pointer: string }
    )[]
    language?: string
    text?: string
  }
  create_time: Date
  recipient: string
  metadata: { model_slug?: string; voice_mode_message?: boolean }
}

export type Conversation = {
  id: string
  create_time: Date
  update_time: Date
  title: string
  gizmo_id: string
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

export type GPTs = {
  id: string
  version: number
  updated_at: Date
  share_recipient: "private" | "link" | "marketplace"
  short_url: string
  vanity_metrics: { num_conversations_str: string }
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

const MAX_JOBS = 16
export async function listAllConversations(): Promise<Conversation[]> {
  const conversations: Conversation[] = []
  const limit = 50

  const offset = 0
  const data = await listConversations({ offset, limit })
  conversations.push(...data.items)
  const total = data.total

  while (conversations.length < total) {
    const remains = Math.ceil((total - conversations.length) / limit)
    const jobs = Math.min(remains, MAX_JOBS)
    const offset = conversations.length
    const data = await Promise.all(
      [...Array(jobs).keys()].map((n) =>
        listConversations({ offset: offset + n * limit, limit })
      )
    )
    data.forEach((d) => conversations.push(...d.items))
  }

  return conversations.reverse()
}

export async function listConversations({
  offset,
  limit,
  order = "created"
}: {
  offset: number
  limit: number
  order?: string
}) {
  const data = await requestBackendAPI(
    "GET",
    `/conversations?offset=${offset}&limit=${limit}&order=${order}`
  )

  return { ...data, items: data.items.map(ConversationConverter) }
}

export async function getSharedConversations({ limit }: { limit: number }) {
  const data = await requestBackendAPI(
    "GET",
    `/shared_conversations?offset=0&limit=${limit}&order=created`
  )

  return { ...data, items: data.items.map(ConversationConverter) }
}

export async function getUser(): Promise<User> {
  const data = await requestBackendAPI("GET", `/me`)

  return { ...data, created: DateConverter(data.created) }
}

export async function getConversations(ids: string[]): Promise<Conversation[]> {
  const conversations: Conversation[] = []

  while (conversations.length < ids.length) {
    const remains = ids.length - conversations.length
    const jobs = Math.min(remains, MAX_JOBS)
    const offset = conversations.length
    const data = await Promise.all(
      [...Array(jobs).keys()].map((n) => getConversation(ids[offset + n]))
    )
    data.forEach((d) => conversations.push(d))
  }

  return conversations
}

export async function getConversation(id: string) {
  const data = await requestBackendAPI("GET", `/conversation/${id}`)

  return { ...ConversationConverter({ ...data, id: data.conversation_id }) }
}

export async function listMyGPTs() {
  const data = await requestBackendAPI("GET", "/gizmos/discovery")

  let cursor: string | null = null
  const gpts: GPTs[] = []
  for (const cut of data.cuts) {
    if (cut.info?.id === "mine") {
      gpts.push(
        ...cut.list?.items.map((item: any) => {
          const gpt = item.resource.gizmo
          return { ...gpt, updated_at: DateConverter(gpt.updated_at) }
        })
      )
      cursor = cut.list?.cursor
    }
  }

  while (cursor) {
    const data = await requestBackendAPI(
      "GET",
      `/gizmos/discovery/mine?cursor=${encodeURIComponent(cursor)}&limit=8`,
      "public-api"
    )

    gpts.push(
      ...data.list?.items?.map((item: any) => {
        const gpt = item.resource.gizmo
        return { ...gpt, updated_at: DateConverter(gpt.updated_at) }
      })
    )
    cursor = data.list?.cursor
  }

  return gpts
}

let accessToken = ""
async function requestBackendAPI(
  method: "GET" | "POST",
  path: string,
  endpoint: string = "backend-api",
  data?: unknown
) {
  if (!accessToken) {
    accessToken = await getAccessToken()
  }

  const resp = await fetch(`https://chat.openai.com/${endpoint}/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: data === undefined ? undefined : JSON.stringify(data)
  })
  if (!resp.ok) {
    let msg = ""
    if (resp.headers.get("Content-Type") === "text/plain") {
      msg = await resp.text()
    } else if (resp.headers.get("Content-Type") === "application/json") {
      msg = await resp.json().catch(() => ({}))
    }
    console.error(resp.status, resp.statusText, msg)
    throw new Error(
      `Backend API error: ${resp.status}:${resp.statusText}:${JSON.stringify({
        msg
      })}`
    )
  }

  return await resp.json()
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
