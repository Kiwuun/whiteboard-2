import { BtnProps } from "../types/typing"
import { ACTIONS } from "../types/consts"


export const ToolButton = ({children, Action, setAction, Tool}: BtnProps) => {

    return (
        <button 
            className={Action === Tool
            ? "bg-violet-300 p-1 rounded" 
            : "p-1 hover:bg-violet-100 rounded"}
            onClick={() => setAction(Tool)}>
            {children}
        </button>
    )
}