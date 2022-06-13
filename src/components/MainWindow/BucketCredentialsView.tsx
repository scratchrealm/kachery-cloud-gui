import { FunctionComponent } from 'react';
import EditableTextField from './EditableTextField';

type Props = {
    bucketId: string
    bucketCredentials: string
    setBucketCredentials?: (o: {bucketId: string, bucketCredentials: string}) => void
}

const BucketCredentialsView: FunctionComponent<Props> = ({bucketId, bucketCredentials, setBucketCredentials}) => {
    return (
        <div>
            <h3>Bucket credentials</h3>
            {
                setBucketCredentials ? (
                    <EditableTextField
                        value={bucketCredentials === '*' ? '***hidden***' : bucketCredentials}
                        onChange={c => {setBucketCredentials({bucketId, bucketCredentials: c})}}
                        clearOnEdit={true}
                    />
                ) : (
                    <pre>{bucketCredentials}</pre>
                )
            }
        </div>
    )
}

export default BucketCredentialsView