import { Button, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'

type Props = {
    onClose?: () => void
    onAdd: (projectId: string) => void
}

const AddProjectControl: FunctionComponent<Props> = ({onClose, onAdd}) => {
    const [editProjectName, setEditProjectName] = useState<string>('')
    
    const handleAdd = useCallback(() => {
        onAdd(editProjectName)
        onClose && onClose()
    }, [onClose, editProjectName, onAdd])
    const okayToAdd = useMemo(() => {
        return isValidProjectName(editProjectName)
    }, [editProjectName])
    const handleChange = useCallback((event: any) => {
        setEditProjectName(event.target.value)
    }, [])
    return (
        <div>
            <Table style={{maxWidth: 400}}>
                <TableBody>
                    <TableRow>
                        <TableCell>Project name</TableCell>
                        <TableCell>
                            <input type="text" value={editProjectName} onChange={handleChange} />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Button onClick={handleAdd} disabled={!okayToAdd}>Add</Button>
            {onClose && <Button onClick={onClose}>Cancel</Button>}
        </div>
    )
}

const isValidProjectName = (x: string) => {
    return x.length >= 3
}

export default AddProjectControl