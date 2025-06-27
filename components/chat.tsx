'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CanvasProps, ChatMessage } from "../types/typing"
import { useEffect, useRef, useState } from "react"
import { v4 as uuid } from "uuid"


export default function ChatBox ({socket, username, setMessage, messages}: CanvasProps) {
  const [input, setInput] = useState<string>("")

    const handleSendMessage = () => {
        if(input.trim() === "") return
        console.log("Test 2")

        const chatMessage = {
            id: uuid(),
            message: input,
            date: new Date(),
            username: username
        }

        setInput("")
        setMessage((prev) => [...prev, chatMessage])
        socket.emit("chatMessage", chatMessage)
    }

  return (
     <Card className="w-auto max-w-md h-[500px] flex flex-col">
      <div className="border-b">
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Room Chat</CardTitle>
            </div>
        </CardHeader>
      </div>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4 space-y-4">
          {messages.map((msg) => {
  const isYou = msg.username === username;
  const formattedTime = new Date(msg.date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div key={msg.id} className="space-y-1">
      {/* Username */}
      <p className={`text-sm font-semibold text-muted-foreground ${isYou ? "text-right" : "text-left"}`}>
        {isYou ? "You" : msg.username}
      </p>

      {/* Message row */}
      <div className={`flex items-end gap-2 ${isYou ? "justify-end" : "justify-start"}`}>
        {/* Time and bubble positioning */}
        {isYou ? (
          <>
            {/* You: Time on the left */}
            <p className="text-xs font-semibold text-muted-foreground mb-2">{formattedTime}</p>
            <div className="p-2 rounded w-fit max-w-32 break-words text-left bg-primary text-primary-foreground">
              {msg.message}
            </div>
          </>
        ) : (
          <>
            {/* Other: Bubble left, time on right */}
            <div className="p-2 rounded w-fit max-w-32 break-words text-left bg-muted">
              {msg.message}
            </div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">{formattedTime}</p>
          </>
        )}
      </div>
    </div>
  );
})}



        </ScrollArea>
      </CardContent>
      <div className="p-4 border-t flex items-center gap-2">
        <Input placeholder="Type a message..." onChange={(e) => setInput(e.target.value)} value={input}/>
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </Card>
  )
}