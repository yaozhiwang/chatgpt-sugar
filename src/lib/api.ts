import { AppError, ErrorCode } from "./error"
import { runBatch } from "./utils"

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
  end_turn: boolean
  create_time: Date
  recipient: string
  metadata: {
    model_slug?: string
    voice_mode_message?: boolean
    attachments?: { name: string; id: string }[]
  }
}

export type MessageNode = {
  id: string
  children: string[]
  parent: string
  message: Message
}

export type Conversation = {
  id: string
  create_time: Date
  update_time: Date
  title: string
  gizmo_id: string
  is_archived: boolean
  mapping: {
    [key: string]: MessageNode
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
  vanity_metrics: { num_conversations: number }
}

const ConversationConverter = (item: any): Conversation => {
  // using this new variable to avoid firefox error disallow to change variable from cross-origin
  // Error: Not allowed to define cross-origin object as property on [Object] or [Array] XrayWrapper
  let mapping: { [key: string]: MessageNode } | null = null
  if (item.mapping) {
    mapping = {}
    for (const id in item.mapping) {
      const message = item.mapping[id].message
      if (!message || !message.create_time) {
        continue
      }
      mapping[id] = {
        id,
        children: item.mapping[id].children,
        parent: item.mapping[id].parent,
        message: { ...message }
      }
      mapping[id].message.create_time = DateConverter(message.create_time)
    }
  }
  return {
    ...item,
    mapping,
    create_time: DateConverter(item.create_time),
    update_time: DateConverter(item.update_time)
  }
}

const GPTsConverter = (item: any): GPTs => {
  return {
    ...item,
    updated_at: DateConverter(item.updated_at),
    vanity_metrics: {
      num_conversations: NumberConverter(
        item.vanity_metrics.num_conversations_str
      )
    }
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

const NumberConverter = (str?: string | null): number => {
  if (!str) {
    return 0
  }

  if (str.endsWith("K") || str.endsWith("k")) {
    return Math.round(parseFloat(str) * 1000)
  } else if (str.endsWith("M") || str.endsWith("m")) {
    return Math.round(parseFloat(str) * 1000 * 1000)
  } else {
    return parseInt(str)
  }
}

export async function listAllConversations(
  includesArchived: boolean = true
): Promise<Conversation[]> {
  const conversations = await doListAllConversations(false)
  if (includesArchived) {
    conversations.push(...(await doListAllConversations(true)))
  }

  return conversations.sort(
    (a, b) => a.create_time.getTime() - b.create_time.getTime()
  )
}

async function doListAllConversations(archived: boolean) {
  const conversations: Conversation[] = []

  const limit = 50

  const data = await listConversations({ offset: 0, limit, archived })
  conversations.push(...data.items)
  const total = data.total

  const res = await runBatch(
    (i) => listConversations({ offset: limit + i * limit, limit, archived }),
    Math.ceil((total - limit) / limit)
  )
  res.forEach((ret) => {
    if (ret.status === "fulfilled") {
      conversations.push(...ret.value.items)
    } else {
      throw new Error("Failed to list all conversations. Please retry.")
    }
  })

  return conversations
}

export async function listConversations({
  offset,
  limit,
  archived,
  order = "created"
}: {
  offset: number
  limit: number
  archived: boolean
  order?: string
}) {
  const data = await requestBackendAPI(
    "GET",
    `/conversations?offset=${offset}&limit=${limit}&order=${order}&is_archived=${archived}`
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
  const res = await runBatch((i) => getConversation(ids[i]), ids.length)
  const conversations: Conversation[] = []
  res.forEach((ret) => {
    if (ret.status === "fulfilled") {
      conversations.push(ret.value!)
    } else {
      throw new Error("Failed to get all conversations. Please retry.")
    }
  })

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
        ...cut.list?.items.map((item: any) =>
          GPTsConverter(item.resource.gizmo)
        )
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
      ...data.list?.items?.map((item: any) =>
        GPTsConverter(item.resource.gizmo)
      )
    )
    cursor = data.list?.cursor
  }

  return gpts
}

export async function getGPTs(gptId: string) {
  const data = await requestBackendAPI("GET", `/gizmos/${gptId}`)

  return GPTsConverter(data.gizmo)
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
