import { BtnProps } from "../types/typing"
import { ACTIONS } from "../types/consts"


export const ToolButton = ({children, Action, setAction, Tool}: BtnProps) => {

    return (
        <button 
            className={Action === Tool
            ? "bg-slate-800 p-1 rounded" 
            : "p-1 hover:bg-slate-700 rounded"}
            onClick={() => setAction(Tool)}>
            {children}
        </button>
    )
}