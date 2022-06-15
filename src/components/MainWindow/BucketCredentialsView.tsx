import Hyperlink from 'components/Hyperlink/Hyperlink';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { BucketService } from 'types/Bucket';
import EditBucketCredentials from './EditBucketCredentials';

type Props = {
    bucketId: string
    service: BucketService
    bucketCredentials: string
    setBucketCredentials?: (o: {bucketId: string, bucketCredentials: string}) => void
}

const BucketCredentialsView: FunctionComponent<Props> = ({bucketId, service, bucketCredentials, setBucketCredentials}) => {
    const [editing, setEditing] = useState<boolean>(false)
    const handleSetBucketCredentials = useCallback((c: string) => {
        if (!setBucketCredentials) return
        setBucketCredentials({bucketId, bucketCredentials: c})
        setEditing(false)
    }, [setBucketCredentials, bucketId])
    const bucketCredentialsWithHiddenSecrets = useMemo(() => {
        const x = {...JSON.parse(bucketCredentials || '{}')}
        if (x.secretAccessKey) {
            x.secretAccessKey = '***hidden***'
        }
        return JSON.stringify(x)
    }, [bucketCredentials])
    return (
        <div>
            <h3>Bucket credentials</h3>
            {
                setBucketCredentials ? (
                    editing ? (
                        <EditBucketCredentials
                            service={service}
                            bucketCredentials={bucketCredentials}
                            setBucketCredentials={handleSetBucketCredentials}
                            onCancel={() => {setEditing(false)}}
                        />
                    ) : (
                        <div>
                            {
                                bucketCredentials ? (
                                    <pre>{bucketCredentialsWithHiddenSecrets}</pre>
                                ) : (
                                    <p style={{color: 'blue'}}>Click "Edit" to add bucket credentials</p>
                                )
                            }
                            <Hyperlink onClick={() => setEditing(true)}>edit</Hyperlink>
                        </div>
                    )
                ) : (
                    <pre>{bucketCredentialsWithHiddenSecrets}</pre>
                )
            }
        </div>
    )
}

export default BucketCredentialsView