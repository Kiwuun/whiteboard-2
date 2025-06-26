import { BtnProps } from "../types/typing"


export const ToolButton = ({children, Action, setAction, Tool}: BtnProps) => {
    return (
        <button 
            className={`${Action === Tool 
                ? "bg-slate-800/80" 
                : "hover:bg-slate-700/20"} 
                w-10 h-10 p-1 rounded flex items-center justify-center`}
            onClick={() => setAction(Tool)}>
            {children}
        </button>
    )
}
