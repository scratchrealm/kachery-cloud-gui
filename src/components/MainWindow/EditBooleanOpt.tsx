import { Checkbox } from "@material-ui/core"
import { FunctionComponent, useCallback } from "react"

type Props = {
    label: string
    value: boolean
    setValue?: (key: string, value: boolean) => void
}

const EditBooleanOpt: FunctionComponent<Props> = ({label, value, setValue}) => {
    const disabled = setValue ? false : true
    const handleClick = useCallback(() => {
        if (!setValue) return
        setValue(label, !value)
    }, [label, value, setValue])
    return (
        <div>
            <Checkbox checked={value} disabled={disabled} onClick={handleClick} /> <span>{label}</span>
        </div>
    )
}

export default EditBooleanOpt