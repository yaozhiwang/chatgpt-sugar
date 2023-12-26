import { AppError, ErrorCode } from "./error"

export type Conversation = {
  id: string
  create_time: Date
  update_time: Date
  title: string
  is_archive: boolean
}

const ConversationConverter = (item: any): Conversation => {
  return {
    ...item,
    create_time: new Date(item.create_time),
    update_time: new Date(item.update_time)
  }
}

export async function getAllConversations() {
  const conversations: Conversation[] = []
  const limit = 50
  let total = 0
  do {
    const offset = conversations.length
    const data = await getConversations({ offset, limit })
    conversations.push(...data.items.map(ConversationConverter))
    total = data.total
  } while (conversations.length < total)

  return conversations
}

export async function getConversations({
  offset,
  limit,
  order = "updated"
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
  return data
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
