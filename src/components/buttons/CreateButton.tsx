import React from "react";
import { AddIcon, TickIcon } from "../../utils/Icons";

interface CreateButtonProps{
    name:string;
    onClick:()=>void;
    width?:string;
    height?:string;
}

const CreateButton:React.FC<CreateButtonProps>=({name,onClick,width="auto",height="44px"})=>{
    return(
        <button
            onClick={onClick}
            style={{ width, height, minWidth: width === "auto" ? "156px" : undefined }}
            className="app-button-primary whitespace-nowrap"
        >
            <AddIcon className="w-5 h-5 flex-shrink-0"/> {name}
        </button>
    )
}

export const PublishButton:React.FC<CreateButtonProps>=({name,onClick,width="auto",height="44px"})=>{
    return(
        <button
            onClick={onClick}
            style={{ width, height, minWidth: width === "auto" ? "156px" : undefined }}
            className="app-button-secondary whitespace-nowrap"
        >
            <TickIcon className="w-5 h-5 flex-shrink-0"/> {name}
        </button>
    )
}

export default CreateButton
