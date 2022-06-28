import { Button, MenuItem, Select, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import useErrorMessage from 'errorMessageContext/useErrorMessage'
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'

type Props = {
    onClose?: () => void
    onAdd: (label: string) => void
}

const AddAccessGroupControl: FunctionComponent<Props> = ({onClose, onAdd}) => {
    const [editLabel, setEditLabel] = useState<string>('')
    const {setErrorMessage} = useErrorMessage()
    
    const handleAdd = useCallback(() => {
        setErrorMessage('')
        onAdd(editLabel)
        onClose && onClose()
    }, [onClose, editLabel, onAdd, setErrorMessage])
    const okayToAdd = useMemo(() => {
        return isValidLabel(editLabel)
    }, [editLabel])
    const handleChangeLabel = useCallback((event: any) => {
        setEditLabel(event.target.value)
    }, [])
    return (
        <div>
            <Table style={{maxWidth: 400}}>
                <TableBody>
                    <TableRow>
                        <TableCell>Access group label (for display)</TableCell>
                        <TableCell>
                            <input type="text" value={editLabel} onChange={handleChangeLabel} />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Button onClick={handleAdd} disabled={!okayToAdd}>Add</Button>
            {onClose && <Button onClick={onClose}>Cancel</Button>}
        </div>
    )
}

const isValidLabel = (x: string) => {
    return x.length >= 3
}

export default AddAccessGroupControl