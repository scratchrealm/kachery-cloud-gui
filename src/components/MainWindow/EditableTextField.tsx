import { Button } from '@material-ui/core';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

type Props = {
    value: string
    clearOnEdit?: boolean
    onChange: (x: string) => void
    onClick?: () => void
    tooltip?: string
}

const EditableTextField: FunctionComponent<Props> = ({value, clearOnEdit, onChange, onClick, tooltip}) => {
    const [editing, setEditing] = useState<boolean>(false)
    if (editing) {
        return (
            <TextInput
                value={clearOnEdit ? '' : value}
                onChange={(x) => {
                    onChange(x)
                    setEditing(false)
                }}
                onCancel={() => setEditing(false)}
            />
        )
    }
    else {
        return (
            <span>
                {
                    onClick ? <Hyperlink onClick={onClick}>{value}</Hyperlink> : value
                }
                &nbsp;&nbsp;&nbsp;
                <Hyperlink onClick={() => setEditing(true)}>edit</Hyperlink>
            </span>
        )
    }
}

const TextInput: FunctionComponent<{value: string, onChange: (x: string) => void, onCancel: () => void}> = ({value, onChange, onCancel}) => {
    const [internalValue, setInternalValue] = useState<string>('')
    useEffect(() => {
        setInternalValue(value)
    }, [value])
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        setInternalValue(e.target.value as string)
    }, [])
    const handleSubmit = useCallback(() => {
        onChange(internalValue)
    }, [onChange, internalValue])
    return (
        <div>
            <input type="text" value={internalValue} onChange={handleChange} />
            <Button onClick={handleSubmit}>Submit</Button>
            <Button onClick={onCancel}>Cancel</Button>
        </div>
    )
}

export default EditableTextField