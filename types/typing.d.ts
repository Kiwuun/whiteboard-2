export type ACTIONS_TYPE = "SELECT" | "RECTANGLE" | "CIRLCE" | "SCRIBBLE" | "ARROW"

export type BtnProps = {
    children: React.ReactNode,
    setAction: React.Dispatch<React.SetStateAction<string>>,
    Action: string,
    Tool: string
}

export type RectangleStruct = {
    id: string,
    shape: string,
    angle: number,
    x: number,
    y: number,
    height: number, 
    width: number,
    fillColor: string,
    opacity: number
}

export type CircleStruct = {
    id: string,
    shape: string,
    radius: number,
    x: number,
    y: number,
    fillColor: string,
    opacity: number
}

export type ScribbleStruct = {
    id: string,
    shape: string,
    points: number[],
    fillColor: string,
    x: number, 
    y: number,
    angle: number,
    stroke: number,
    opacity: number
}

export type TextStruct = {
    id: string,
    shape: string,
    angle: number,
    x: number,
    y: number,
    height: number, 
    width: number,
    opacity: number,
    text: string
}

export type KonvaCanvasProps = {
    socket: Socket | null
}

export type CanvasProps = {
  socket: Socket | null,
  username: string,
  setMessage: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  messages: ChatMessage[]
}

export type EraserProps = {
    id: string,
    shape: string
}

export type ChatMessage = {
    id: string,
    message: string,
    date: Date,
    username: string
}