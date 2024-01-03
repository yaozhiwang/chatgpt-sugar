export function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}

export function detectTheme() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark"
  }
  return "light"
}

export type BatchResult<T> = {
  status: "fulfilled" | "rejected"
  value?: T
  reason?: any
}[]
export async function runBatch<T>(
  getTask: (taskId: number) => Promise<T>,
  totalTasks: number,
  maxJobs: number = 16,
  maxRetries: number = 3
): Promise<BatchResult<T>> {
  const res: BatchResult<T> = []
  const failed: number[] = []

  if (maxJobs < 1) {
    maxJobs = 1
  }
  let offset = 0
  while (offset < totalTasks) {
    const remains = totalTasks - offset
    const jobs = Math.min(remains, maxJobs)
    const rets = await Promise.allSettled(
      [...Array(jobs).keys()].map((n) => getTask(offset + n))
    )
    rets.forEach((ret, i) => {
      if (ret.status === "fulfilled") {
        res.push({ status: ret.status, value: ret.value })
      } else {
        res.push({ status: ret.status, reason: ret.reason })
        failed.push(i + offset)
      }
    })
    offset += jobs
  }

  if (failed.length > 0 && maxRetries > 0) {
    await sleep(1000)
    const rets = await runBatch(
      (i) => getTask(failed[i]),
      failed.length,
      maxJobs / 2,
      maxRetries - 1
    )
    rets.forEach((ret, i) => {
      res.splice(failed[i], 1, ret)
    })
  }

  return res
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
