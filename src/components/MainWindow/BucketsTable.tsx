import { IconButton } from '@material-ui/core';
import { AddCircle, Refresh } from '@material-ui/icons';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import NiceTable from 'commonComponents/NiceTable/NiceTable';
import useVisible from 'commonComponents/useVisible';
import useRoute from 'components/useRoute';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import AddBucketControl from './AddBucketControl';
import useBuckets from './useBucketsForUser';

type Props = {
}

const BucketsTable: FunctionComponent<Props> = () => {
    const addVisible = useVisible()

    const {setRoute} = useRoute()

    const { buckets, refreshBuckets, addBucket, deleteBucket } = useBuckets()

    const columns = useMemo(() => ([
        {
            key: 'bucket',
            label: 'Bucket'
        },
        {
            key: 'label',
            label: 'Label'
        },
        {
            key: 'ownerId',
            label: 'Owner'
        },
        {
            key: 'timestampCreated',
            label: 'Created'
        },
        {
            key: 'timestampLastModified',
            label: 'Modified'
        },
        {
            key: 'service',
            label: 'Service'
        },
        {
            key: 'uri',
            label: 'URI'
        }
    ]), [])

    const rows = useMemo(() => (
        (buckets || []).map((bucket) => ({
            key: bucket.bucketId.toString(),
            columnValues: {
                bucket: {
                    text: bucket.bucketId,
                    element: (
                        <Hyperlink onClick={() => {setRoute({page: 'bucket', bucketId: bucket.bucketId})}}>
                            {bucket.bucketId}
                        </Hyperlink>
                    )
                },
                label: {
                    text: bucket.label,
                    element: (
                        <Hyperlink onClick={() => {setRoute({page: 'bucket', bucketId: bucket.bucketId})}}>
                            {bucket.label}
                        </Hyperlink>
                    )
                },
                ownerId: bucket.ownerId.toString(),
                timestampCreated: timeSince(bucket.timestampCreated),
                timestampLastModified: timeSince(bucket.timestampLastModified),
                service: bucket.service,
                uri: bucket.uri
            }
        }))
    ), [buckets, setRoute])

    const handleDeleteBucket = useCallback((bucketId: string) => {
        deleteBucket(bucketId)
    }, [deleteBucket])

    return (
        <div>
            <h3>Buckets</h3>
            <IconButton onClick={refreshBuckets} title="Refresh buckets"><Refresh /></IconButton>
            <IconButton onClick={addVisible.show} title="Add bucket"><AddCircle /></IconButton>
            {
                addVisible.visible && (
                    <AddBucketControl
                        onAdd={addBucket}
                        onClose={addVisible.hide}
                    />
                )
            }
            <NiceTable
                columns={columns}
                rows={rows}
                onDeleteRow={handleDeleteBucket}
            />
            {
                !buckets ? (
                    <div>Loading buckets...</div>
                ) : <span />
            }
        </div>
    )
}

// thanks https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
export function timeSince(date: number) {
    var seconds = Math.floor((Date.now() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

export default BucketsTable