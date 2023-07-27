import React from "react"

export default function Button({ onClick, text }) {

    async function handleClick() {

    }

    return (<div className="Chip-root makeStyles-chipBlue-108 Chip-clickable">
        <span
            onClick={onClick}
            className="form-Chip-label"
        >
            {text}
        </span>
    </div>);
}

