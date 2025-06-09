'use client'

import { TbRectangle } from "react-icons/tb"
import { IoMdDownload } from "react-icons/io"
import { FaLongArrowAltRight } from "react-icons/fa"
import { LuPencil } from "react-icons/lu"
import { GiArrowCursor } from "react-icons/gi"
import { FaRegCircle } from "react-icons/fa"

import { Stage, Layer } from "react-konva"
import { useEffect, useRef, useState } from "react"
import Konva from "konva"
import { ACTIONS } from "../types/consts"
import { ACTIONS_TYPE } from "../types/typing"

// TODO MAKE BUTTON COMPONENT WITH CHILD AND ACTION PROP <BTN>CHILD</BTN>

export const KonvaCanvas = () => {

    const stageRef = useRef<Konva.Stage>(null)
    const [action, setAction] = useState(ACTIONS.SELECT)
    const [fillColor, setFillColor] = useState<string>("")
    const [windowDimensions, setWindowDimensions] = useState({width: 0, height: 0})

    // HANDLE PRELOADING ERROR: WINDOW NOT DEFINED
    useEffect(() => {
        setWindowDimensions({width: window.innerWidth, height: window.innerHeight})
    }, [])

    // HANDLE FUNCTIONS

    function onPointerMove () {

    }

    function onPointerDown () {

    }

    function onPointerUp () {

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

                        <button className={action === ACTIONS.SELECT 
                            ? "bg-violet-300 p-1 rounded" 
                            : "p-1 hover:bg-violet-100 rounded"}
                            onClick={() => setAction(ACTIONS.SELECT)}>
                            <GiArrowCursor size={"2rem"}/>
                        </button>

                        <button className={action === ACTIONS.RECTANGLE 
                            ? "bg-violet-300 p-1 rounded" 
                            : "p-1 hover:bg-violet-100 rounded"}
                            onClick={() => setAction(ACTIONS.RECTANGLE)}>
                            <TbRectangle size={"2rem"}/>
                        </button>

                        <button className={action === ACTIONS.CIRCLE 
                            ? "bg-violet-300 p-1 rounded" 
                            : "p-1 hover:bg-violet-100 rounded"}
                            onClick={() => setAction(ACTIONS.CIRCLE)}>
                            <FaRegCircle size={"2rem"}/>
                        </button>
                        
                        <button className={action === ACTIONS.ARROW 
                            ? "bg-violet-300 p-1 rounded" 
                            : "p-1 hover:bg-violet-100 rounded"}
                            onClick={() => setAction(ACTIONS.ARROW)}>
                            <FaLongArrowAltRight size={"2rem"}/>
                        </button>

                        <button className={action === ACTIONS.SCRIBBLE 
                            ? "bg-violet-300 p-1 rounded" 
                            : "p-1 hover:bg-violet-100 rounded"}
                            onClick={() => setAction(ACTIONS.SCRIBBLE)}>
                            <LuPencil size={"2rem"}/>
                        </button>

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

                </Layer>
            </Stage>
            </div>
        </>
    )
}