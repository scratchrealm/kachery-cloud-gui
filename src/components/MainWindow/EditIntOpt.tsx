import { FunctionComponent, useCallback } from "react"

type Props = {
    label: string
    value?: number
    setValue?: (key: string, value: number | undefined) => void
}

const EditIntOpt: FunctionComponent<Props> = ({label, value, setValue}) => {
    const disabled = setValue ? false : true
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        if (!setValue) return
        setValue(label, toInt(e.target.value as string))
    }, [label, setValue])
    return (
        <div>
            {label}: <input type="text" value={value || ''} disabled={disabled} onChange={handleChange} />
        </div>
    )
}

const toInt = (x: any) => {
    if (x === undefined) {
        return 0
    }
    else if (typeof(x) === 'number') {
        return x
    }
    else if (typeof(x) == 'string') {
        return parseInt(x)
    }
    else return 0
}

export default EditIntOpt