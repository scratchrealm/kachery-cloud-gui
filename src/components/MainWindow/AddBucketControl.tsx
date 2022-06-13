import { Button, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import useErrorMessage from 'errorMessageContext/useErrorMessage'
import { FunctionComponent, useCallback, useMemo, useState } from 'react'

type Props = {
    onClose?: () => void
    onAdd: (bucketId: string, o: {service: 'google' | 'filebase', uri: string}) => void
}

const AddBucketControl: FunctionComponent<Props> = ({onClose, onAdd}) => {
    const [editLabel, setEditLabel] = useState<string>('')
    const [editService, setEditService] = useState<'google' | 'filebase'>('google')
    const [editBucketName, setEditBucketName] = useState<string>('')
    const {setErrorMessage} = useErrorMessage()
    
    const handleAdd = useCallback(() => {
        if (!['google', 'filebase'].includes(editService)) {
            setErrorMessage(`Invalid service: ${editService}`)
            return
        }
        setErrorMessage('')
        onAdd(editLabel, {service: editService, uri: uriForBucketName(editService, editBucketName)})
        onClose && onClose()
    }, [onClose, editLabel, onAdd, editService, editBucketName, setErrorMessage])
    const okayToAdd = useMemo(() => {
        return isValidLabel(editLabel)
    }, [editLabel])
    const handleChangeLabel = useCallback((event: any) => {
        setEditLabel(event.target.value)
    }, [])
    const handleChangeService = useCallback((event: any) => {
        setEditService(event.target.value)
    }, [])
    const handleChangeName = useCallback((event: any) => {
        setEditBucketName(event.target.value)
    }, [])
    return (
        <div>
            <Table style={{maxWidth: 400}}>
                <TableBody>
                    <TableRow>
                        <TableCell>Bucket label</TableCell>
                        <TableCell>
                            <input type="text" value={editLabel} onChange={handleChangeLabel} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Bucket service (google or filebase)</TableCell>
                        <TableCell>
                            <input type="text" value={editService} onChange={handleChangeService} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Bucket name</TableCell>
                        <TableCell>
                            <input type="text" value={editBucketName} onChange={handleChangeName} />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Button onClick={handleAdd} disabled={!okayToAdd}>Add</Button>
            {onClose && <Button onClick={onClose}>Cancel</Button>}
        </div>
    )
}

const uriForBucketName = (service: 'google' | 'filebase', name: string) => {
    if (service === 'google') {
        return `gs://${name}`
    }
    else if (service === 'filebase') {
        return `filebase://${name}`
    }
    else {
        return `?${service}?://${name}`
    }
}

const isValidLabel = (x: string) => {
    return x.length >= 3
}

export default AddBucketControl