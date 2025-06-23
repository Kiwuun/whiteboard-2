'use client'

import { TbRectangle } from "react-icons/tb"
import { IoMdDownload } from "react-icons/io"
import { FaLongArrowAltRight } from "react-icons/fa"
import { LuPencil } from "react-icons/lu"
import { GiArrowCursor } from "react-icons/gi"
import { FaRegCircle } from "react-icons/fa"
import { BiDoorOpen } from "react-icons/bi";
import { FaRegTrashCan } from "react-icons/fa6";

import { Stage, Layer, Rect, Circle, Line, Transformer } from "react-konva"
import { useEffect, useRef, useState } from "react"
import { ACTIONS } from "../types/consts"
import { ToolButton } from "./tool-button"
import { v4 as uuid } from "uuid"
import Konva from "konva"
import { RectangleStruct, CircleStruct, ScribbleStruct, KonvaCanvasProps } from "../types/typing"
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ChatBox from "./chat"

// TODO:
// SET BORDER AND COLLISION
// ADD ERASER
// ADD CHAT
// ADD CHAT ROOM OPTIONS WITH PUBLIC / PRIVATE SETTINGS

export const KonvaCanvas = ({socket}: KonvaCanvasProps) => {

    const stageRef = useRef<Konva.Stage>(null)
    const transFormerRef = useRef<Konva.Transformer>(null)
    const fillColor = useRef<string>("#ffffff")
    const room = useRef<string>("")
    const [action, setAction] = useState(ACTIONS.SELECT)
    const [strokeSize, setStrokeSize] = useState<number>(12)
    const [popOpen, setPopOpen] = useState<boolean>(false)
    const [windowDimensions, setWindowDimensions] = useState({width: 0, height: 0})

    const isDraggable = action === ACTIONS.SELECT

    const isPainting = useRef(false)
    const currentShapeID = useRef<string>(null)

    // SHAPES
    const[rectangles, setRectangles] = useState<RectangleStruct[]>([])
    const[circles, setCircles] = useState<CircleStruct[]>([])
    const [scribbles, setScribbles] = useState<ScribbleStruct[]>([])

    // SHAPE REFS
    const rectanglesRef = useRef<RectangleStruct[]>([])
    const circlesRef = useRef<CircleStruct[]>([])
    const scribblesRef = useRef<ScribbleStruct[]>([])


    // HANDLE PRELOADING ERROR: WINDOW NOT DEFINED
    useEffect(() => {
        setWindowDimensions({width: window.innerWidth, height: window.innerHeight})
    }, [])

    // SYNC USESTATE SHAPES TO SHAPE REFS
    useEffect(() => {
        rectanglesRef.current = rectangles
        circlesRef.current = circles
        scribblesRef.current = scribbles
    }, [rectangles, circles, scribbles])


    // SOCKETS / HANDLE METHODS
    useEffect(() => {

        const handleSendState = () => {
            console.log(rectanglesRef.current)
            socket.emit("canvas-state", {
                rectangles: rectanglesRef.current,
                circles: circlesRef.current,
                scribbles: scribblesRef.current
            })
        }

        const handleGetState = (data: any) => {
            setRectangles((prev) => [...prev, ...data.rectangles])
            setCircles((prev) => [...prev, ...data.circles])
            setScribbles((prev) => [...prev, ...data.scribbles])
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

        return () => {
            socket.off("get-shapes", handleGetShapes)
            socket.off("get-transformed-shape", handleTransformMove)
            socket.off("get-state", handleSendState)
            socket.off("get-canvas-state", handleGetState)
            socket.off("clear-canvas", handleClear)
        }
    }, [])

    // HANDLE FUNCTIONS

    function checkBorderCollision () {

    }

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

        const {x, y} = pointerPos!
        const id = uuid()

        currentShapeID.current = id
        isPainting.current = true

        switch(action) {
            case ACTIONS.RECTANGLE:
                setRectangles((rectangles) => [...rectangles, {
                    id, angle: 0, shape: ACTIONS.RECTANGLE, x, y, height: 20, width: 20, fillColor: fillColor.current
                }])
                break;
            case ACTIONS.CIRCLE:
                setCircles((circles) => [...circles, {
                    id, shape: ACTIONS.CIRCLE, radius: 20, x, y, fillColor: fillColor.current
                }])
                break;
            case ACTIONS.SCRIBBLE:
                // ADD NEW SCRIBLE WHEN SCRIBBLE AND MOUSE DOWN
                setScribbles((scribbles) => [...scribbles, {
                    id, shape: ACTIONS.SCRIBBLE, points: [x, y], fillColor: fillColor.current, x: 0, y: 0, angle: 0, stroke: strokeSize
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
        }
    }

    function onPointerMove () {
        if(action === ACTIONS.SELECT || !isPainting.current) return

        const stage = stageRef.current
        if(!stage) return

        const pointerPos = stage.getPointerPosition()

        const {x, y} = pointerPos!

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
                setScribbles((scribbles) =>scribbles.map((scribble) => {
                    if (scribble.id === currentShapeID.current) {
                        return {
                            ...scribble,
                            points: [...scribble.points, x, y],
                        };
                    }

                    return scribble;
                }))
                    break;
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

        socket.emit("clear-canvas-s")
    }

    function handleSubmit () {
        socket.emit("join-room", room.current)
        socket.emit("client-ready")
        setPopOpen(false)
    }

    return (
        <>
            <div className="relative w-full h-screen overflow-hidden">
                <div className="abolute top-0 z-10 w-full py-2">
                    <div className="flex justify-center items-center gap-3 py-2 px-3 w-fit mx-auto">

                        <ToolButton setAction={setAction} Action={action} Tool={ACTIONS.SELECT}>
                            <GiArrowCursor size={"2rem"}/>
                        </ToolButton>

                        <ToolButton setAction={setAction} Action={action} Tool={ACTIONS.RECTANGLE}>
                            <TbRectangle size={"2rem"}/>
                        </ToolButton>

                        <ToolButton setAction={setAction} Action={action} Tool={ACTIONS.CIRCLE}>
                            <FaRegCircle size={"2rem"}/>
                        </ToolButton>
                        
                        <ToolButton setAction={setAction} Action={action} Tool={ACTIONS.ARROW}>
                            <FaLongArrowAltRight size={"2rem"}/>
                        </ToolButton>

                        <ToolButton setAction={setAction} Action={action} Tool={ACTIONS.SCRIBBLE}>
                            <LuPencil size={"2rem"}/>
                        </ToolButton>

                        <button onClick={handleClear} className="p-1 cursor-pointer hover:bg-slate-700 rounded">
                            <FaRegTrashCan size={"2rem"}/>
                        </button>

                        <button>
                            <input 
                            className="w-6 h-6 cursor-pointer hover:bg-slate-700 rounded" 
                            type="color"
                            value={fillColor.current} 
                            onChange={(e) => fillColor.current = e.target.value}/>
                        </button>

                        <button
                        className="p-1 cursor-pointer hover:bg-slate-700 rounded"
                        onClick={exportCanvas}>
                            <IoMdDownload size={"2rem"}/>
                        </button>

                        <Popover open={popOpen} onOpenChange={setPopOpen}>
                            <PopoverTrigger className="p-1 cursor-pointer hover:bg-slate-700 rounded">
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
                        </Popover>

                    </div>
                </div>

                <ChatBox/>

            {/* STROKE SLIDER */}
            <Stack 
            sx={{ height: 300, pointerEvents: "none", transform: "translateY(-50%) translateX(200%)", top: "50%", position: "fixed", zIndex: 5}} 
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
                        key={i}
                        id={rectangle.id}
                        rotation={rectangle.angle}
                        x={rectangle.x}
                        y={rectangle.y}
                        strokeWidth={2}
                        fill={rectangle.fillColor}
                        height={rectangle.height}
                        width={rectangle.width}
                        draggable={isDraggable}
                        onClick={onClick}
                        onDragMove={handleDrag}
                        onTransform={handleTransform}
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
                        fill={circle.fillColor}
                        draggable={isDraggable}
                        onClick={onClick}
                        shape={circle.shape}
                        onDragMove={handleDrag}
                        onTransform={handleTransform}/>
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
                        rotation={scribble.angle}
                        draggable={isDraggable}
                        onClick={onClick}
                        shape={scribble.shape}
                        onDragMove={handleDrag}
                        onTransform={handleTransform}
                        />
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