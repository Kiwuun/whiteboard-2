'use client'

import { TbRectangle } from "react-icons/tb"
import { IoMdDownload } from "react-icons/io"
import { FaLongArrowAltRight } from "react-icons/fa"
import { LuPencil } from "react-icons/lu"
import { GiArrowCursor } from "react-icons/gi"
import { FaRegCircle } from "react-icons/fa"

import { Stage, Layer, Rect, Circle, Line, Transformer } from "react-konva"
import { useEffect, useRef, useState } from "react"
import { ACTIONS } from "../types/consts"
import { ToolButton } from "./tool-button"
import { v4 as uuid } from "uuid"
import Konva from "konva"
import { RectangleStruct, CircleStruct, ScribbleStruct, KonvaCanvasProps } from "../types/typing"


// ADD BRUSH SIZE 
// ADD SOCKETS WHEN THE SELECT TOOL IS BEING USED ON THE SHAPE

export const KonvaCanvas = ({socket}: KonvaCanvasProps) => {

    const stageRef = useRef<Konva.Stage>(null)
    const transFormerRef = useRef<Konva.Transformer>(null)
    const [action, setAction] = useState(ACTIONS.SELECT)
    const [fillColor, setFillColor] = useState<string>("#ff0000")
    const [windowDimensions, setWindowDimensions] = useState({width: 0, height: 0})

    const strokeColor = "#fff"
    const isDraggable = action === ACTIONS.SELECT
    const isPainting = useRef(false)
    const currentShapeID = useRef<string>(null)

    // SHAPES
    const[rectangles, setRectangles] = useState<RectangleStruct[]>([])
    const[circles, setCircles] = useState<CircleStruct[]>([])
    const [scribbles, setScribbles] = useState<ScribbleStruct[]>([])

    // HANDLE PRELOADING ERROR: WINDOW NOT DEFINED
    useEffect(() => {
        setWindowDimensions({width: window.innerWidth, height: window.innerHeight})
    }, [])

    useEffect(() => {
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

        socket.on("get-shapes", handleGetShapes)

        return () => {
            socket.off("get-shapes", handleGetShapes)
        }
    }, [])

    // HANDLE FUNCTIONS

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
                    id, shape: ACTIONS.RECTANGLE, x, y, height: 20, width: 20, fillColor
                }])
                break;
            case ACTIONS.CIRCLE:
                setCircles((circles) => [...circles, {
                    id, shape: ACTIONS.CIRCLE, radius: 20, x, y, fillColor
                }])
                break;
            case ACTIONS.SCRIBBLE:
                setScribbles((scribbles) => [...scribbles, {
                    id, shape: ACTIONS.SCRIBBLE, points: [x, y], fillColor
                }])
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
        const target = e.currentTarget as unknown as Konva.Node
        if(!target) return
        transFormerRef.current!.nodes([target])
    }

    return (
        <>
            <div className="relative w-full h-screen overflow-hidden">
                <div className="abolute top-0 z-10 w-full py-2">
                    <div className="flex justify-center items-center gap-3 py-2 px-3 w-fit mx-auto border border-">

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

                        <button>
                            <input 
                            className="w-6 h-6" 
                            type="color" 
                            value={fillColor} 
                            onChange={(e) => setFillColor(e.target.value)}/>
                        </button>

                        <button
                        className="cursor-pointer"
                        onClick={exportCanvas}>
                            <IoMdDownload size={"1.5rem"}/>
                        </button>
                    </div>
                </div>
            {/* CANVAS */}
            <Stage ref={stageRef} width={windowDimensions.width} height={windowDimensions.height}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}>
                <Layer>
                    {rectangles.map((rectangle: RectangleStruct, i) => (
                        <Rect
                        key={i}
                        x={rectangle.x}
                        y={rectangle.y}
                        strokeWidth={2}
                        fill={rectangle.fillColor}
                        height={rectangle.height}
                        width={rectangle.width}
                        draggable={isDraggable}
                        onClick={onClick}/>
                    ))}

                    {circles.map((circle: CircleStruct, i) => (
                        <Circle
                        key={i}
                        x={circle.x}
                        y={circle.y}
                        radius={circle.radius}
                        strokeWidth={2}
                        fill={circle.fillColor}
                        draggable={isDraggable}
                        onClick={onClick}/>
                    ))}

                    {scribbles.map((scribble: ScribbleStruct, i) => (
                        <Line
                        key={i}
                        lineCap="round"
                        lineJoin="round"
                        points={scribble.points}
                        stroke={strokeColor}
                        strokeWidth={2}
                        fill={scribble.fillColor}
                        draggable={isDraggable}
                        onClick={onClick}/>
                    ))}

                    <Transformer ref={transFormerRef}/>
                </Layer>
            </Stage>
            </div>
        </>
    )
}