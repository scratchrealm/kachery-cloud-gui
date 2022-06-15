import { Button, Table, TableBody, TableCell, TableRow } from "@material-ui/core";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { BucketService } from "types/Bucket";
import EditableTextField from "./EditableTextField";

type Props = {
    service: BucketService
    bucketCredentials: string
    setBucketCredentials: (c: string) => void
    onCancel: () => void
}

const EditBucketCredentials: FunctionComponent<Props> = ({service, bucketCredentials, setBucketCredentials, onCancel}) => {
    const [editCredentials, setEditCredentials] = useState<string>('{}')
    useEffect(() => {
        setEditCredentials(bucketCredentials)
    }, [bucketCredentials])
    const tableData = useMemo(() => {
        const c = JSON.parse(editCredentials || '{}')
        const x = JSON.parse(bucketCredentials || '{}')
        if ((service === 'filebase') || (service === 'aws') || (service === 'wasabi')) {
            return [
                {key: 'region', label: 'region', value: x.region || ''},
                {key: 'accessKeyId', label: 'Access Key ID', value: x.accessKeyId || ''},
                {key: 'secretAccessKey', label: 'Secret Access Key', value: x.secretAccessKey || ''}
            ].map(({key, label, value}) => (
                {
                    key,
                    label,
                    value: (
                        <EditableTextField
                            value={value}
                            onChange={(s: string) => {
                                setEditCredentials(JSON.stringify({
                                    region: c.region,
                                    accessKeyId: c.accessKeyId,
                                    secretAccessKey: c.secretAccessKey,
                                    [key]: s
                                }))
                            }}
                            liveUpdating={true}
                        />
                    )
                }
            ))
        }
        else if (service === 'google') {
            return []
        }
        else {
            return []
        }
    }, [service, editCredentials, bucketCredentials])
    if ((service === 'aws') || (service === 'filebase') || (service === 'wasabi')) {
        return (
            <div>
                <Table>
                    <TableBody>
                        {
                            tableData.map(x => (
                                <TableRow key={x.key}>
                                    <TableCell>{x.label}: </TableCell>
                                    <TableCell style={{wordBreak: 'break-word'}}>{x.value}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
                <Button onClick={() => {setBucketCredentials(editCredentials)}}>Submit</Button>
                <Button onClick={() => {onCancel()}}>Cancel</Button>
            </div>
        )
    }
    else if (service === 'google') {
        return <div>Service not yet supported: google</div>
    }
    else {
        return <div>Unexpected service: {service}</div>
    }
}

export default EditBucketCredentials