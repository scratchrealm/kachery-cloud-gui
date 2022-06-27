import { Button, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'
import BucketSelect from './BucketSelect'

type Props = {
    onClose?: () => void
    onAdd: (projectLabel: string, bucketId: string | undefined) => void
}

const AddProjectControl: FunctionComponent<Props> = ({onClose, onAdd}) => {
    const [editLabel, setEditLabel] = useState<string>('')
    const [editBucketId, setEditBucketId] = useState<string | undefined>(undefined)
    
    const handleAdd = useCallback(() => {
        onAdd(editLabel, editBucketId)
        onClose && onClose()
    }, [onClose, editLabel, editBucketId, onAdd])
    const okayToAdd = useMemo(() => {
        return isValidLabel(editLabel)
    }, [editLabel])
    const handleChange = useCallback((event: any) => {
        setEditLabel(event.target.value)
    }, [])
    return (
        <div>
            <Table style={{maxWidth: 400}}>
                <TableBody>
                    <TableRow>
                        <TableCell>Project label (for display)</TableCell>
                        <TableCell>
                            <input type="text" value={editLabel} onChange={handleChange} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Bucket</TableCell>
                        <TableCell>
                            <BucketSelect
                                bucketId={editBucketId}
                                setBucketId={setEditBucketId}
                                noneLabel="<Use default>"
                            />
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

export default AddProjectControl