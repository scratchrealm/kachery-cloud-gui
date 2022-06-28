import { Button, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import useErrorMessage from 'errorMessageContext/useErrorMessage'
import { FunctionComponent, useCallback, useMemo, useState } from 'react'

type Props = {
    onClose?: () => void
    onAdd: (userId: string) => void
}

const AddAccessGroupUserControl: FunctionComponent<Props> = ({onClose, onAdd}) => {
    const [editUserId, setEditUserId] = useState<string>('')
    const {setErrorMessage} = useErrorMessage()
    
    const handleAdd = useCallback(() => {
        setErrorMessage('')
        onAdd(editUserId)
        onClose && onClose()
    }, [onClose, editUserId, onAdd, setErrorMessage])
    const okayToAdd = useMemo(() => {
        return isValidUserId(editUserId)
    }, [editUserId])
    const handleChangeLabel = useCallback((event: any) => {
        setEditUserId(event.target.value)
    }, [])
    return (
        <div>
            <Table style={{maxWidth: 400}}>
                <TableBody>
                    <TableRow>
                        <TableCell>User ID</TableCell>
                        <TableCell>
                            <input type="text" value={editUserId} onChange={handleChangeLabel} />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Button onClick={handleAdd} disabled={!okayToAdd}>Add</Button>
            {onClose && <Button onClick={onClose}>Cancel</Button>}
        </div>
    )
}

const isValidUserId = (x: string) => {
    if (x.split('@').length !== 2) return false
    if (x.split('@')[0].length < 3) return false
    if (x.split('@')[1].length < 3) return false
    if (x.split('@')[1].split('.').length < 2) return false
    return true
}

export default AddAccessGroupUserControl