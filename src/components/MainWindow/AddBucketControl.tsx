import { Button, MenuItem, Select, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import useErrorMessage from 'errorMessageContext/useErrorMessage'
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'
import { BucketService, isBucketService } from 'types/Bucket'

type Props = {
    onClose?: () => void
    onAdd: (bucketId: string, o: {service: BucketService, uri: string}) => void
}

const AddBucketControl: FunctionComponent<Props> = ({onClose, onAdd}) => {
    const [editLabel, setEditLabel] = useState<string>('')
    const [editService, setEditService] = useState<BucketService>('google')
    const [editBucketName, setEditBucketName] = useState<string>('')
    const {setErrorMessage} = useErrorMessage()
    
    const handleAdd = useCallback(() => {
        if (!isBucketService(editService)) {
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
    const handleChangeService = useCallback((s: BucketService) => {
        setEditService(s)
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
                            <ServiceSelect service={editService} onChange={handleChangeService} />
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

const uriForBucketName = (service: BucketService, name: string) => {
    if (service === 'google') {
        return `gs://${name}`
    }
    else if (service === 'filebase') {
        return `filebase://${name}`
    }
    else if (service === 'aws') {
        return `s3://${name}`
    }
    else {
        return `?${service}?://${name}`
    }
}

const isValidLabel = (x: string) => {
    return x.length >= 3
}

type ServiceSelectProps = {
    service: BucketService
    onChange: (s: BucketService) => void
}

const ServiceSelect: FunctionComponent<ServiceSelectProps> = ({service, onChange}) => {
    const handleChange = useCallback((e: React.ChangeEvent<{name?: string | undefined, value: unknown}>) => {
        const newService = e.target.value
        if (!isBucketService(newService)) throw Error('Unexpected bucket service')
        onChange(newService)
    }, [onChange])
    return (
        <div>
            <Select
                value={service}
                onChange={handleChange}
            >
                {
                    ['google', 'filebase', 'aws'].map(s => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))
                }
            </Select>
        </div>
    )
}

export default AddBucketControl