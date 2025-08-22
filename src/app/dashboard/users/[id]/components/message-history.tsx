"use client"

import { useQuery } from "convex/react"
import { formatDistance } from "date-fns"
import { Bot, Clock, MessageCircle, User, Paperclip } from "lucide-react"
import { api } from "@/../convex/_generated/api"
import type { Doc } from "@/../convex/_generated/dataModel"
import { Skeleton } from "@/components/ui/skeleton"

type MessageHistoryProps = {
  userPhone: string
  conversations: Doc<"conversations">[]
}

type MessageWithConversation = Doc<"messages"> & {
  conversation?: Doc<"conversations">
}

export const MessageHistory = ({ userPhone, conversations }: MessageHistoryProps) => {
  // Get all messages for the user using our custom query
  const messages = useQuery(api.messages.getMessagesByUserPhone, {
    userPhone,
  })

  // Check if query is still loading
  if (messages === undefined) {
    return <MessageHistorySkeleton />
  }

  // Enhance messages with conversation information
  const messagesWithConversations: MessageWithConversation[] = messages.map((message) => {
    const conversation = conversations.find((conv) => conv._id === message.conversationId)
    return { ...message, conversation }
  })

  // Sort messages chronologically (newest first)
  messagesWithConversations.sort((a, b) => b.createdAt - a.createdAt)

  if (messagesWithConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <MessageCircle className="h-8 w-8 text-gray-300 mb-3" />
        <p className="text-gray-600 font-medium">No messages yet</p>
        <p className="text-gray-400 text-sm mt-1">Messages will appear here once this user starts communicating</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 pb-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Message History</h2>
        <p className="text-sm text-gray-500 mt-1">
          {messagesWithConversations.length} messages across {conversations.length} conversation
          {conversations.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-6">
        {messagesWithConversations.map((message, index) => (
          <MessageItem
            key={message._id}
            message={message}
            showDateSeparator={
              index === 0 || !isSameDay(message.createdAt, messagesWithConversations[index - 1].createdAt)
            }
          />
        ))}
      </div>
    </div>
  )
}

type MessageItemProps = {
  message: MessageWithConversation
  showDateSeparator: boolean
}

const MessageItem = ({ message, showDateSeparator }: MessageItemProps) => {
  const isAssistant = message.role === "assistant"
  const messageDate = new Date(message.createdAt)

  return (
    <>
      {showDateSeparator && (
        <div className="flex items-center justify-center py-6">
          <div className="bg-gray-50 px-4 py-2 rounded-full">
            <span className="text-xs font-medium text-gray-500">
              {messageDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      )}

      <div className="group">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
              isAssistant ? "bg-gray-100 text-gray-600" : "bg-gray-50 text-gray-500"
            }`}
          >
            {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-sm font-medium ${isAssistant ? "text-gray-900" : "text-gray-700"}`}>
                {isAssistant ? "Assistant" : "User"}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                {formatDistance(messageDate, new Date(), { addSuffix: true })}
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap m-0">{message.content}</p>
            </div>

            {message.files && message.files.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-50">
                <div className="flex flex-wrap gap-2">
                  {message.files.map((file) => (
                    <div
                      key={file._id}
                      className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Paperclip className="h-3 w-3" />
                      {file.fileName}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {message.conversation && (
              <div className="mt-3 pt-2 border-t border-gray-50">
                <span className="text-xs text-gray-400">in {message.conversation.title}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const MessageHistorySkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 pb-4 border-b border-gray-100">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper function to check if two timestamps are on the same day
const isSameDay = (date1: number, date2: number): boolean => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}
