import { MenuItem, Select } from '@material-ui/core';
import { FunctionComponent, useCallback } from 'react';
import useBucketsForUser from './useBucketsForUser';

type Props = {
    bucketId: string | undefined
    setBucketId: (x: string | undefined) => void
    noneLabel: string
}

const BucketSelect: FunctionComponent<Props> = ({bucketId, setBucketId, noneLabel}) => {
    const handleChange = useCallback((e) => {
        const id = e.target.value
        setBucketId(id !== '<none>' ? id : undefined)
    }, [setBucketId])
    const {buckets} = useBucketsForUser()
    return (
        <div>
            {
                buckets ? (
                    <Select
                        value={bucketId || '<none>'}
                        onChange={handleChange}
                    >
                        {
                            <MenuItem key='<none>' value='<none>'>{noneLabel}</MenuItem>
                        }
                        {
                            buckets.map(bucket => (
                                <MenuItem key={bucket.bucketId} value={bucket.bucketId}>{bucket.label} ({bucket.bucketId})</MenuItem>
                            ))
                        }
                    </Select>
                ) : <span>Loading buckets for user</span>
            }
        </div>
    )
}

export default BucketSelect