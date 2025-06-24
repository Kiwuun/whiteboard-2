'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CanvasSocketProps } from "../types/typing"


export default function ChatBox ({socket}: CanvasSocketProps) {
  return (
     <Card className="w-auto max-w-md h-[500px] flex flex-col">
      <div className="border-b">
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Room Chat</CardTitle>
                <p className="text-sm font-semibold text-muted-foreground">Members: 10</p>
            </div>
        </CardHeader>
      </div>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4 space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">Alice</p>
            <div className="flex items-end gap-2">
                <div className="p-2 rounded bg-muted w-fit">Hello!</div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">7:30</p>
            </div>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-sm font-semibold text-muted-foreground">You</p>
            <div className="p-2 rounded bg-primary text-primary-foreground w-fit ml-auto">Hi there!</div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">Alice</p>
            <div className="p-2 rounded bg-muted w-fit">How are you?</div>
          </div>
        </ScrollArea>
      </CardContent>
      <div className="p-4 border-t flex items-center gap-2">
        <Input placeholder="Type a message..." />
        <Button>Send</Button>
      </div>
    </Card>
  )
}