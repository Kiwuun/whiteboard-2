'use client'

import { TbRectangle } from "react-icons/tb"
import { IoMdDownload } from "react-icons/io"
import { FaLongArrowAltRight } from "react-icons/fa"
import { LuPencil } from "react-icons/lu"
import { GiArrowCursor } from "react-icons/gi"
import { FaRegCircle } from "react-icons/fa"

import { Stage, Layer, Rect } from "react-konva"
import { useEffect, useRef, useState } from "react"
import { ACTIONS } from "../types/consts"
import { ToolButton } from "./tool-button"
import { v4 as uuid } from "uuid"
import Konva from "konva"
import { RectangleStruct } from "../types/typing"


// TODO MAKE BUTTON COMPONENT WITH CHILD AND ACTION PROP <BTN>CHILD</BTN>

export const KonvaCanvas = () => {

    const stageRef = useRef<Konva.Stage>(null)
    const [action, setAction] = useState(ACTIONS.SELECT)
    const [fillColor, setFillColor] = useState<string>("#ff0000")
    const [windowDimensions, setWindowDimensions] = useState({width: 0, height: 0})

    const strokeColor = "#000"
    const isPainting = useRef(false)
    const currentShapeID = useRef<string>(null)

    // SHAPES
    const[rectangles, setRectangles] = useState<RectangleStruct[]>([])

    // HANDLE PRELOADING ERROR: WINDOW NOT DEFINED
    useEffect(() => {
        setWindowDimensions({width: window.innerWidth, height: window.innerHeight})
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
                    id, x, y, height: 20, width: 20, fillColor
                }])
            break;
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
        }
    }

    function onPointerUp () {
        isPainting.current = false
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

    return (
        <>
            <div className="relative w-full h-screen overflow-hidden">
                <div className="abolute top-0 z-10 w-full py-2">
                    <div className="flex justify-center items-center gap-3 py-2 px-3 w-fit mx-auto border">

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
                        stroke={strokeColor}
                        strokeWidth={2}
                        fill={rectangle.fillColor}
                        height={rectangle.height}
                        width={rectangle.width}/>
                    ))}
                </Layer>
            </Stage>
            </div>
        </>
    )
}