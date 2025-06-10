export type ACTIONS_TYPE = "SELECT" | "RECTANGLE" | "CIRLCE" | "SCRIBBLE" | "ARROW"

export type BtnProps = {
    children: React.ReactNode,
    setAction: React.Dispatch<React.SetStateAction<string>>,
    Action: string,
    Tool: string
}

export type RectangleStruct = {
    id: string,
    x: number,
    y: number,
    height: number, 
    width: number,
    fillColor: string
}

export type CircleStruct = {
    id: string,
    radius: number,
    x: number,
    y: number,
    fillColor: string
}

export type ScribbleStruct = {
    id: string,
    points: number[],
    fillColor: string
}