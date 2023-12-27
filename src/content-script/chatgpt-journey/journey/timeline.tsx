import { JourneyData, JourneyStats } from "../data"

export default function Timeline({ data }: { data: JourneyData }) {
  return (
    <div className="flex w-full flex-col items-center">
      <h2 className="py-8 text-xl font-medium md:text-2xl">
        My ChatGPT Journey
      </h2>
      <Stats stats={data.stats} />
    </div>
  )
}

function Stats({ stats }: { stats: JourneyStats }) {
  return (
    <div className="mx-auto flex flex-col gap-0 text-base">
      <p>
        Engaged with ChatGPT for{" "}
        <span className="text-lg text-green-600">{stats.age}</span>{" "}
        {`day${stats.age > 1 ? "s" : ""}`}
      </p>
      <p>
        Initiated{" "}
        <span className="text-lg text-green-600">
          {stats.totalConversations}
        </span>{" "}
        {`conversation${stats.totalConversations > 1 ? "s" : ""}`}
      </p>
      {stats.totalShared > 0 && (
        <p>
          Shared{" "}
          <span className="text-lg text-green-600">{stats.totalShared}</span>{" "}
          {`conversation${stats.totalShared > 1 ? "s" : ""}`}
        </p>
      )}
      <p className="mt-4">
        Composed{" "}
        <span className="text-lg text-green-600">{stats.totalMessages}</span>{" "}
        {`messsage${stats.totalMessages > 1 ? "s" : ""} `} in total
      </p>
      {stats.totalGPT4Messages > 0 && (
        <p className="ml-4">
          <span className="text-lg text-green-600">
            {stats.totalGPT4Messages}
          </span>{" "}
          {`messsage${stats.totalGPT4Messages > 1 ? "s" : ""} `} with GPT-4
        </p>
      )}
      {stats.totalVisionMessages > 0 && (
        <p className="ml-4">
          <span className="text-lg text-green-600">
            {stats.totalVisionMessages}
          </span>{" "}
          {`messsage${stats.totalVisionMessages > 1 ? "s" : ""} `} using GPT-4
          Vision
        </p>
      )}
      {stats.totalImageMessages > 0 && (
        <p className="ml-4">
          <span className="text-lg text-green-600">
            {stats.totalImageMessages}
          </span>{" "}
          {`image${stats.totalImageMessages > 1 ? "s" : ""} `}
          created with DALL-E 3
        </p>
      )}
    </div>
  )
}
