'use client'

import { TbRectangle } from "react-icons/tb"
import { IoMdDownload } from "react-icons/io"
import { FaLongArrowAltRight } from "react-icons/fa"
import { LuPencil } from "react-icons/lu"
import { GiArrowCursor } from "react-icons/gi"
import { FaRegCircle } from "react-icons/fa"
import { FaDoorOpen } from "react-icons/fa6";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";
import { LuEraser } from "react-icons/lu";
import { IoChatbubblesSharp } from "react-icons/io5";
import { RxText } from "react-icons/rx";

import { Stage, Layer, Rect, Circle, Line, Transformer, Text } from "react-konva"
import { useEffect, useRef, useState } from "react"
import { ACTIONS } from "../types/consts"
import { ToolButton } from "./tool-button"
import { v4 as uuid } from "uuid"
import Konva from "konva"
import { RectangleStruct, CircleStruct, ScribbleStruct, KonvaCanvasProps, TextStruct, ChatMessage } from "../types/typing"
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ChatBox from "./chat"

// TODO:
// ADD IMAGES
// ADD LINE
// UNDO / REDO
// ADD CUSTOM POINTER FOR ERASER
// ADD WIDTH AND HEIGHT FOR CIRCLE
// MAYBE FIGURE OUT TEXT HARDER THAN I THOUGHT

export const KonvaCanvas = ({socket}: KonvaCanvasProps) => {

    const stageRef = useRef<Konva.Stage>(null)
    const transFormerRef = useRef<Konva.Transformer>(null)
    const fillColor = useRef<string>("#ffffff")
    const username = useRef<string>("")
    const room = useRef<string>("")
    const [joinedRoom, setJoinedRoom] = useState<boolean>(false)
    const [action, setAction] = useState(ACTIONS.SELECT)
    const [strokeSize, setStrokeSize] = useState<number>(12)
    const [windowDimensions, setWindowDimensions] = useState({width: 0, height: 0})

    const isDraggable = action === ACTIONS.SELECT

    const isPainting = useRef(false)
    const currentShapeID = useRef<string>(null)
    const eraserStack = useRef<string[]>([])

    // SHAPES
    const[rectangles, setRectangles] = useState<RectangleStruct[]>([])
    const[circles, setCircles] = useState<CircleStruct[]>([])
    const [scribbles, setScribbles] = useState<ScribbleStruct[]>([])
    const [text, setText] = useState<TextStruct[]>([])

    // SHAPE REFS
    const rectanglesRef = useRef<RectangleStruct[]>([])
    const circlesRef = useRef<CircleStruct[]>([])
    const scribblesRef = useRef<ScribbleStruct[]>([])
    const textRef = useRef<TextStruct[]>([])
    const messagesRef = useRef<ChatMessage[]>([])

    // CHAT STATES
    const [messages, setMessages] = useState<ChatMessage[]>([])


    // HANDLE PRELOADING ERROR: WINDOW NOT DEFINED
    useEffect(() => {
        setWindowDimensions({width: window.innerWidth, height: window.innerHeight})
    }, [])

    // SYNC USESTATE SHAPES TO SHAPE REFS
    useEffect(() => {
        rectanglesRef.current = rectangles
        circlesRef.current = circles
        scribblesRef.current = scribbles
        textRef.current = text,
        messagesRef.current = messages
    }, [rectangles, circles, scribbles, text, messages])

    useEffect(() => {
        const handler = (data: ChatMessage) => {
            if (!data) return
            console.log("test")
            setMessages(prev => [...prev, data])
        }
        

        socket.on("getChatMessage", handler)

        return () => {
            socket.off("getChatMessage", handler)
        }
    }, [socket])

    // SOCKETS / HANDLE METHODS
    useEffect(() => {

        const handleSendState = () => {
            console.log(rectanglesRef.current)
            socket.emit("canvas-state", {
                rectangles: rectanglesRef.current,
                circles: circlesRef.current,
                scribbles: scribblesRef.current,
                messages: messagesRef.current
            })
        }

        const handleEraserClear = (data: any) => {
            const ids = new Set(data)

            setRectangles((prev) => prev.filter((rect) => !ids.has(rect.id)))
            setCircles((prev) => prev.filter((circle) => !ids.has(circle.id)))
            setScribbles((prev) => prev.filter((scribble) => !ids.has(scribble.id)))
        }

        const handleGetState = (data: any) => {
            setRectangles((prev) => [...prev, ...data.rectangles])
            setCircles((prev) => [...prev, ...data.circles])
            setScribbles((prev) => [...prev, ...data.scribbles])
            setMessages((prev) => [...prev, ...data.messages])
        }

        const handleGetShapes = (data: any) => {
            switch(data.shape) {
                case ACTIONS.RECTANGLE:
                    setRectangles((prev) => [...prev, data])
                    break
                case ACTIONS.CIRCLE:
                    setCircles((prev) => [...prev, data])
                    break
                case ACTIONS.SCRIBBLE:
                    setScribbles((prev) => [...prev, data])
                    break
            }
        }

        const handleTransformMove = (data: any) => {

            // ADD OTHER SHAPES
            switch(data.shape) {
                case ACTIONS.RECTANGLE:
                    setRectangles((prevRects) =>
                        prevRects.map((rect) =>
                        rect.id === data.id ? { ...rect, angle: data.angle, x: data.x, y: data.y, height: data.height, width: data.width, 
                         } : rect
                        )
                    );
                    break
                case ACTIONS.CIRCLE:
                    setCircles((prevCircs) =>
                        prevCircs.map((circ) =>
                        circ.id === data.id ? { ...circ, x: data.x, y: data.y, radius: data.radius
                         } : circ
                        )
                    );
                    break
                case ACTIONS.SCRIBBLE:
                    setScribbles((prevLines) =>
                        prevLines.map((line) =>
                        line.id === data.id ? { ...line, points: data.points, x: data.x, y: data.y, angle: data.angle, height: data.height, width: data.width
                         } : line
                        )
                    );
            }
        }

        socket.on("get-shapes", handleGetShapes)
        socket.on("get-transformed-shape", handleTransformMove)
        socket.on("get-state", handleSendState)
        socket.on("get-canvas-state", handleGetState)
        socket.on("clear-canvas", handleClear)
        socket.on("clear-eraser", handleEraserClear)

        return () => {
            socket.off("get-shapes", handleGetShapes)
            socket.off("get-transformed-shape", handleTransformMove)
            socket.off("get-state", handleSendState)
            socket.off("get-canvas-state", handleGetState)
            socket.off("clear-canvas", handleClear)
            socket.off("clear-eraser", handleEraserClear)
        }
    }, [])

    // HANDLE FUNCTIONS

    function handleOnPointerDown (e: Konva.KonvaEventObject<MouseEvent>) {
        if(e.target === e.target.getStage()) {
            transFormerRef.current!.nodes([])
            transFormerRef.current?.getLayer()?.batchDraw();
        } 

        onPointerDown()
    }

    function onPointerDown () {
        if(action === ACTIONS.SELECT) return

       const stage = stageRef.current
        if(!stage) return

        const pointerPos = stage.getPointerPosition()
        if(!pointerPos) return

        const {x, y} = pointerPos
        
        const id = uuid()

        currentShapeID.current = id
        isPainting.current = true

        switch(action) {
            case ACTIONS.RECTANGLE:
                setRectangles((rectangles) => [...rectangles, {
                    id, angle: 0, shape: ACTIONS.RECTANGLE, x, y, height: 20, width: 20, fillColor: fillColor.current, opacity: 1
                }])
                break;
            case ACTIONS.CIRCLE:
                setCircles((circles) => [...circles, {
                    id, shape: ACTIONS.CIRCLE, radius: 20, x, y, fillColor: fillColor.current, opacity: 1
                }])
                break;
            case ACTIONS.SCRIBBLE:
                // ADD NEW SCRIBLE WHEN SCRIBBLE AND MOUSE DOWN
                setScribbles((scribbles) => [...scribbles, {
                    id, shape: ACTIONS.SCRIBBLE, points: [x, y], fillColor: fillColor.current, x: 0, y: 0, angle: 0, stroke: strokeSize, opacity: 1
                }])

                setScribbles((scribbles) =>scribbles.map((scribble) => {
                    if (scribble.id === currentShapeID.current) {
                        return {
                            ...scribble,
                            points: [...scribble.points, x, y],
                        };
                    }

                    return scribble;
                }))
                break
            case ACTIONS.TEXT:
                setText((texts) => [...texts, {
                    id, angle: 0, shape: ACTIONS.TEXT, x, y, height: 20, width: 20, opacity: 1, text: "Placeholder"
                }])
                break;
            case ACTIONS.ERASER:
                const shape = stage.getIntersection(pointerPos)
                const id = shape?.attrs.id
                if(eraserStack.current.includes(id) || id === undefined) return
                eraserStack.current.push(id)
                console.log(eraserStack.current)
                break
        }
    }

    function onPointerMove () {
        if(action === ACTIONS.SELECT || !isPainting.current) return

        const stage = stageRef.current
        if(!stage) return

        const pointerPos = stage.getPointerPosition()
        if(!pointerPos) return

        const {x, y} = pointerPos

        switch(action) {
            case ACTIONS.RECTANGLE:
                setRectangles((rectangles) => rectangles.map((rectangle) => {
                    if(rectangle.id === currentShapeID.current) {
                        return {
                            ...rectangle,
                            width: x - rectangle.x,
                            height: y - rectangle.y
                        }
                    }

                    return rectangle
                }))
                break;
            case ACTIONS.CIRCLE:
                setCircles((circles) => circles.map((circle) => {
                    if(circle.id === currentShapeID.current) {
                        return {
                            ...circle,
                            radius: ((y - circle.y)** 2 + (x - circle.x) ** 2) ** .5
                        }
                    }

                    return circle
                }))
                break
            case ACTIONS.SCRIBBLE:
            setScribbles((scribbles) =>
                scribbles.map((scribble) =>
                    scribble.id === currentShapeID.current
                        ? { ...scribble, points: [...scribble.points, x, y] }
                        : scribble
                )
            );
                break;
            case ACTIONS.ERASER:
                const shape = stage.getIntersection(pointerPos)
                const id = shape?.attrs.id
                const s = shape?.attrs.shape
                if(eraserStack.current.includes(id) || id === undefined) return
                eraserStack.current.push(id)

                const idsToErase = new Set(eraserStack.current)

                switch(s) {
                    case ACTIONS.RECTANGLE:
                        setRectangles((prev) =>
                            prev.map((rect) =>
                                idsToErase.has(rect.id) ? { ...rect, opacity: 0.1 } : rect
                            )
                        )
                        break
                    case ACTIONS.CIRCLE:
                        setCircles((prev) =>
                            prev.map((circle) =>
                                idsToErase.has(circle.id) ? { ...circle, opacity: 0.1 } : circle
                            )
                        )
                        break
                    case ACTIONS.SCRIBBLE:
                        setScribbles((prev) =>
                            prev.map((scribble) =>
                                idsToErase.has(scribble.id) ? { ...scribble, opacity: 0.1 } : scribble
                            )
                        )
                        break
                }

                break
                }
    }

    function onPointerUp () {
        isPainting.current = false

        switch(action) {
            case ACTIONS.RECTANGLE:
                const rect = rectangles.find(rect => rect.id === currentShapeID.current)
                if(rect) socket.emit("canvas-input", rect)
                break
            case ACTIONS.CIRCLE:
                const circ = circles.find(circ => circ.id === currentShapeID.current)
                if(circ) socket.emit("canvas-input", circ)
                break
            case ACTIONS.SCRIBBLE:
                const scribble = scribbles.find(scrib => scrib.id === currentShapeID.current)
                if(scribble) socket.emit("canvas-input", scribble)
                break
            case ACTIONS.ERASER:
                const ids = new Set(eraserStack.current)

                setRectangles((prev) => prev.filter((rect) => !ids.has(rect.id)))
                setCircles((prev) => prev.filter((circle) => !ids.has(circle.id)))
                setScribbles((prev) => prev.filter((scribble) => !ids.has(scribble.id)))

                socket.emit("clear-eraser-s", eraserStack.current)
                
                eraserStack.current = []

                break
        }

        currentShapeID.current = null
    }

    function exportCanvas () {
        const dataURL = stageRef.current?.toDataURL()
        if(!dataURL) return

        const link = document.createElement('a');
        link.download = 'stage.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function onClick (e: Konva.KonvaEventObject<MouseEvent>) {
        if(action != ACTIONS.SELECT) return
        if(!transFormerRef) return

        const shape = e.currentTarget

        const target = shape as unknown as Konva.Node
        const shapeType = target.attrs.shape
        if(!target) return
        transFormerRef.current!.nodes([target])

        if(shapeType === ACTIONS.SCRIBBLE) {
            transFormerRef.current?.rotateEnabled(true)
            transFormerRef.current?.resizeEnabled(false)
        } else {
            transFormerRef.current?.rotateEnabled(true);
            transFormerRef.current?.resizeEnabled(true);
        }

        transFormerRef.current?.getLayer()?.batchDraw();
    }

    function handleDrag (e: Konva.KonvaEventObject<DragEvent>) {
        const { x, y } = e.target.position();

        const id = e.currentTarget.attrs.id
        const shape = e.currentTarget.attrs.shape

        switch(shape) {
            case ACTIONS.RECTANGLE:
                const rect = rectangles.find(rect => rect.id === id)
                rect!.x = x
                rect!.y = y
                socket.emit("canvas-transform", rect)
                break
            case ACTIONS.CIRCLE:
                const circ = circles.find(circ => circ.id === id)
                circ!.x = x
                circ!.y = y
                socket.emit("canvas-transform", circ)
                break
            case ACTIONS.SCRIBBLE:
                const line = scribbles.find(line => line.id === id)
                line!.x = x
                line!.y = y 
                socket.emit("canvas-transform", line)
                break
        }
    }

    function handleTransform (e: Konva.KonvaEventObject<MouseEvent>) {
        const shape = e.target
        if(!shape) return
        const s = e.currentTarget.attrs.shape
        const angle = shape.rotation()
        const { x, y } = shape.position();
        const id = e.currentTarget.attrs.id


        switch(s) {
            case ACTIONS.RECTANGLE:
                const rect = rectangles.find(rect => rect.id === id)
                if(!rect) return

                const width = shape.width() * shape.scaleX()
                const height = shape.height() * shape.scaleY()

                rect.angle = angle
                rect.x = x
                rect.y = y
                rect.width = width
                rect.height = height

                setRectangles((prevRects) =>
                                prevRects.map((rect) =>
                                rect.id === id ? { ...rect, x, y, height: height, width: width, 
                                } : rect
                                )
                            );

                shape.scaleX(1);
                shape.scaleY(1); 

                socket.emit("canvas-transform", rect)
                break
            case ACTIONS.CIRCLE:
                const circ = circles.find(circ => circ.id === id)
                if(!circ) return
                const newRadius = circ.radius * shape.scaleX()

                shape.scaleX(1);
                shape.scaleY(1);    

                setCircles((prevCirc) =>
                                prevCirc.map((circ) =>
                                circ.id === id ? { ...circ, radius: newRadius, x, y
                                } : circ
                                )
                            );

                socket.emit("canvas-transform", circ)
                break;
            case ACTIONS.SCRIBBLE:
                const line = scribbles.find(line => line.id === id)
                if(!line) return

                line.angle = angle
                line.x = x
                line.y = y

                setScribbles((prevLine) =>
                                prevLine.map((line) =>
                                line.id === id ? { ...line, x, y, 
                                } : line
                                )
                            );

                socket.emit("canvas-transform", line)
                break
        }

        // const absPos = shape.getAbsolutePosition();


        // shape.setAbsolutePosition(absPos)
    }

    function handleClear () {
        setCircles(() => [])
        setRectangles(() => [])
        setScribbles(() => [])
        setText(() => [])

        // REMOVE TRANSFORM WHEN A SHAPE IS REMOVED
        if(!transFormerRef) return
        transFormerRef.current!.nodes([])

        socket.emit("clear-canvas-s")
    }

    function handleSubmit () {
        setJoinedRoom(true)

        socket.emit("join-room", room.current)
        socket.emit("client-ready")
    }

    return (
        <>
            <div className="relative w-full h-screen overflow-hidden">
                <div className="abolute top-0 z-15 w-full py-2">
                    <div className="flex justify-center items-center gap-3 py-1 px-3 w-fit mx-auto bg-slate-700/30 rounded-lg">

                        <ToolButton setAction={setAction} Action={action} Tool={ACTIONS.SELECT}>
                            <GiArrowCursor size={"1.25rem"}/>
                        </ToolButton>

                        <ToolButton setAction={setAction} Action={action} Tool={ACTIONS.RECTANGLE}>
                            <TbRectangle size={"1.5rem"}/>
                        </ToolButton>

                        <ToolButton setAction={setAction} Action={action} Tool={ACTIONS.CIRCLE}>
                            <FaRegCircle size={"1.25rem"}/>
                        </ToolButton>
                        
                        {/* <ToolButton setAction={setAction} Action={action} Tool={ACTIONS.ARROW}>
                            <FaLongArrowAltRight size={"1.5rem"}/>
                        </ToolButton> */}

                        <ToolButton setAction={setAction} Action={action} Tool={ACTIONS.SCRIBBLE}>
                            <LuPencil size={"1.5rem"}/>
                        </ToolButton>

                        <ToolButton setAction={setAction} Action={action} Tool={ACTIONS.TEXT}>
                            <RxText style={{fontSize: "1.5rem"}}/>
                        </ToolButton>

                        <ToolButton setAction={setAction} Action={action} Tool={ACTIONS.ERASER}>
                            <LuEraser size={"1.25rem"}/>
                        </ToolButton>

                        <AlertDialog>
                            <AlertDialogTrigger className="p-1 cursor-pointer hover:bg-slate-700/20 rounded w-10 h-10 flex items-center justify-center">
                                <FaRegTrashCan size={"1.25rem"}/>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border-none">
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently clear the canvas.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClear} className="bg-red-500">Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <button className="p-1 hover:bg-slate-700/20 cursor-pointer w-10 h-10 rounded">
                            <input 
                            className="w-6 h-6 rounded cursor-pointer" 
                            type="color"
                            value={fillColor.current} 
                            onChange={(e) => fillColor.current = e.target.value}/>
                        </button>

                        <button
                        className="p-1 cursor-pointer hover:bg-slate-700/20 w-10 h-10 flex items-center justify-center rounded"
                        onClick={exportCanvas}>
                            <IoMdDownload size={"1.5rem"}/>
                        </button>

                        {/* <Popover open={popOpen} onOpenChange={setPopOpen}>
                            <PopoverTrigger asChild className="p-1 cursor-pointer hover:bg-slate-700 rounded">
                                <BiDoorOpen size={"2rem"}/>
                            </PopoverTrigger>
                            <PopoverContent className="bg-neutral-800 text-white border-none">
                                <div className="flex flex-col items-center">
                                    <Input type="text" className="w-40" placeholder="Room..."
                                    onChange={(e) => room.current = e.target.value}/>
                                    <Button variant="outline" className="mt-2 w-40"
                                    onClick={handleSubmit}>Join</Button>
                                </div>
                            </PopoverContent>
                        </Popover> */}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild className="flex items-center justify-center">
                                <button className="p-1 cursor-pointer hover:bg-slate-700/20 rounded w-10 h-10">
                                    <FaDoorOpen size={"1.25rem"}/>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Join a chat</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                    <div className="flex justify-center">
                                        <Input type="text" className="w-40" placeholder="Room..."
                                        onChange={(e) => room.current = e.target.value} autoFocus/>
                                    </div>
                                    <div className="flex justify-center mt-2">
                                        <Input type="text" className="w-40" placeholder="Username..."
                                        onChange={(e) => username.current = e.target.value}/>
                                    </div>
                                <DropdownMenuItem>
                                    <Button variant="outline" className="mt-1 w-40 text-white"
                                    onClick={handleSubmit}>Join</Button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {joinedRoom && (
                            <Drawer direction={"right"} modal={false}>
                            <DrawerOverlay/>
                            <DrawerTrigger className="p-1 flex items-center justify-center cursor-pointer hover:bg-slate-700/20 rounded w-10 h-10">
                                <IoChatbubblesSharp size={"1.25rem"}/>
                            </DrawerTrigger>
                                <DrawerContent className="border-none translate-y-1/8">
                                <DrawerHeader className="flex items-end">
                                    <DrawerClose asChild={true}>
                                        <Button variant="outline" className="w-[40px]"><IoIosClose /></Button>
                                    </DrawerClose>
                                <DrawerTitle></DrawerTitle>
                                </DrawerHeader>
                                <ChatBox socket={socket} username={username.current} setMessage={setMessages} messages={messages}/>
                            </DrawerContent>
                        </Drawer>
                        )}
                    </div>
                </div>


            {/* STROKE SLIDER */}
            <Stack 
            sx={{ height: 300, pointerEvents: "none", transform: "translateY(-50%) translateX(200%)", top: "50%", position: "fixed", zIndex: 12}} 
            spacing={1}>
                <Slider
                sx={{pointerEvents: "auto", color: "white"}}
                aria-label="Stroke"
                orientation="vertical"
                valueLabelDisplay="auto"
                defaultValue={12}
                min={1}
                onChangeCommitted={(e, value) => setStrokeSize(value as number)}
            />
            </Stack>
            {/* CANVAS */}
            <Stage ref={stageRef} width={windowDimensions.width} height={windowDimensions.height}
            onPointerDown={handleOnPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}>
                
                <Layer>
                    {rectangles.map((rectangle: RectangleStruct, i) => (
                        <Rect
                        // cornerRadius={15}
                        key={i}
                        id={rectangle.id}
                        rotation={rectangle.angle}
                        x={rectangle.x}
                        y={rectangle.y}
                        strokeWidth={2}
                        opacity={rectangle.opacity}
                        fill={rectangle.fillColor}
                        height={rectangle.height}
                        width={rectangle.width}
                        draggable={isDraggable}
                        onClick={onClick}
                        onDragEnd={handleDrag}
                        onTransformEnd={handleTransform}
                        shape={rectangle.shape}/>
                    ))}

                    {circles.map((circle: CircleStruct, i) => (
                        <Circle
                        key={i}
                        id={circle.id}
                        x={circle.x}
                        y={circle.y}
                        radius={circle.radius}
                        strokeWidth={2}
                        opacity={circle.opacity}
                        fill={circle.fillColor}
                        draggable={isDraggable}
                        onClick={onClick}
                        shape={circle.shape}
                        onDragEnd={handleDrag}
                        onTransformEnd={handleTransform}/>
                    ))}

                    {scribbles.map((scribble: ScribbleStruct, i) => (
                        <Line
                        key={i}
                        id={scribble.id}
                        lineCap="round"
                        lineJoin="round"
                        x={scribble.x}
                        y={scribble.y}
                        points={scribble.points}
                        stroke={scribble.fillColor}
                        strokeWidth={scribble.stroke}
                        fill={scribble.fillColor}
                        opacity={scribble.opacity}
                        rotation={scribble.angle}
                        draggable={isDraggable}
                        onClick={onClick}
                        shape={scribble.shape}
                        onDragEnd={handleDrag}
                        onTransformEnd={handleTransform}
                        />
                    ))}

                    {text.map((text: TextStruct, i) => (
                        <Text
                        key={i}
                        x={text.x}
                        y={text.y}
                        shape={text.shape}
                        fontStyle={"italic"}
                        text={text.text}
                        fill={"white"}
                        draggable={isDraggable}
                        onClick={onClick}/>
                    ))}

                    <Transformer 
                    ref={transFormerRef}
                    onTransform={handleTransform}
                    rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}/>
                </Layer>
            </Stage>
            </div>
        </>
    )
}