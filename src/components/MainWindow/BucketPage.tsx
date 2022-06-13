import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import guiApiRequest from 'common/guiApiRequest';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import useRoute from 'components/useRoute';
import useErrorMessage from 'errorMessageContext/useErrorMessage';
import { FunctionComponent, useCallback, useMemo } from 'react';
import { SetBucketLabelRequest } from 'types/GuiRequest';
import BucketCredentialsView from './BucketCredentialsView';
import EditableTextField from './EditableTextField';
import useBucket from './useBucket';

type Props = {
    bucketId: string
}

const BucketPage: FunctionComponent<Props> = ({bucketId}) => {
    const { bucket, setBucketCredentials, refreshBucket } = useBucket(bucketId)
    const { setRoute } = useRoute()

    const { setErrorMessage } = useErrorMessage()

    const { userId, googleIdToken } = useSignedIn()

    const handleChangeLabel = useCallback((newLabel: string) => {
        if (!userId) return
        if (!googleIdToken) return
        ;(async () => {
            const req: SetBucketLabelRequest = {
                type: 'setBucketLabel',
                bucketId,
                label: newLabel,
                auth: {userId, googleIdToken}
            }
            await guiApiRequest(req, {reCaptcha: true, setErrorMessage})
            refreshBucket()
        })()
    }, [userId, googleIdToken, bucketId, refreshBucket, setErrorMessage])

    const tableData = useMemo(() => {
        if (!bucket) return undefined
        return [
            {
                key: 'bucketLabel',
                label: 'Bucket label',
                value: (
                    <EditableTextField
                        value={bucket.label}
                        onChange={handleChangeLabel}
                    />
                )
            },
            { key: 'bucketId', label: 'Bucket ID', value: bucket.bucketId.toString() },
            { key: 'ownerId', label: 'Owner', value: bucket.ownerId.toString() },
            { key: 'service', label: 'Service', value: bucket.service},
            { key: 'bucketUri', label: 'Bucket URI', value: bucket.uri},
            { key: 'timestampCreated', label: 'Created', value: `${new Date(bucket.timestampCreated)}` },
            { key: 'timestampLastModified', label: 'Modified', value: `${new Date(bucket.timestampLastModified)}` }
        ]
    }, [bucket, handleChangeLabel])

    const handleBack = useCallback(() => {
        setRoute({page: 'home'})
    }, [setRoute])

    if (!bucket) {
        return <span>Loading...</span>
    }

    if (!tableData) return <div />
    return (
        <div>
            <Hyperlink onClick={handleBack}>Back</Hyperlink>
            <Table className="NiceTable2">
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
            <BucketCredentialsView
                bucketId={bucket.bucketId}
                bucketCredentials={bucket.credentials}
                setBucketCredentials={setBucketCredentials}
            />
        </div>
    )
}

export default BucketPage