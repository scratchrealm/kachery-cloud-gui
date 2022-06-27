import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { FunctionComponent, useState } from 'react';
import { Bucket } from 'types/Bucket';
import BucketSelect from './BucketSelect';

type Props = {
    bucket: Bucket | undefined
    onChange: (id: string | undefined) => void
    onClick?: () => void
    tooltip?: string
}

const EditableBucketSelect: FunctionComponent<Props> = ({bucket, onChange, onClick, tooltip}) => {
    const [editing, setEditing] = useState<boolean>(false)
    if (editing) {
        return (
            <BucketSelect
                bucketId={bucket?.bucketId || undefined}
                setBucketId={onChange}
                noneLabel="<Use default>"
            />
        )
    }
    else {
        const aa = bucket ? `${bucket.label} (${bucket.bucketId})` : ''
        return (
            <span>
                {
                    onClick ? <Hyperlink onClick={onClick}>{aa}</Hyperlink> : aa
                }
                &nbsp;&nbsp;&nbsp;
                <Hyperlink onClick={() => setEditing(true)}>edit</Hyperlink>
            </span>
        )
    }
}

export default EditableBucketSelect