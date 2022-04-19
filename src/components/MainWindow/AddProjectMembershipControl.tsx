import { Button, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { isUserId, UserId } from 'commonInterface/kacheryTypes'
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'

type Props = {
    projectId: string
    onClose?: () => void
    onAdd: (memberId: UserId) => void
}

const AddProjectMembershipControl: FunctionComponent<Props> = ({projectId, onClose, onAdd}) => {
    const [editMemberId, setEditMemberId] = useState<string>('')
    
    const handleAdd = useCallback(() => {
        if (!isUserId(editMemberId)) return
        onAdd(editMemberId)
        onClose && onClose()
    }, [onClose, editMemberId, onAdd])
    const okayToAdd = useMemo(() => {
        return isUserId(editMemberId)
    }, [editMemberId])
    const handleChange = useCallback((event: any) => {
        setEditMemberId(event.target.value)
    }, [])
    return (
        <div>
            <Table style={{maxWidth: 400}}>
                <TableBody>
                    <TableRow>
                        <TableCell>Member ID</TableCell>
                        <TableCell>
                            <input type="text" value={editMemberId} onChange={handleChange} />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Button onClick={handleAdd} disabled={!okayToAdd}>Add</Button>
            {onClose && <Button onClick={onClose}>Cancel</Button>}
        </div>
    )
}

export default AddProjectMembershipControl