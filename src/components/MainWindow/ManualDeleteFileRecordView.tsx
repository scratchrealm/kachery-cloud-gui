import { Button } from '@material-ui/core';
import guiApiRequest from 'common/guiApiRequest';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import { FunctionComponent, useCallback, useState } from 'react';
import { ManualDeleteFileRecordRequest } from 'types/GuiRequest';

type Props = {
    projectId: string
}

const ManualDeleteFileRecordView: FunctionComponent<Props> = ({projectId}) => {
    const [internalValue, setInternalValue] = useState<string>('')
    const [status, setStatus] = useState<string>('')
    const {userId, googleIdToken} = useSignedIn()
    const handleDelete = useCallback(() => {
        ;(async () => {
            setStatus('')
            const uri = internalValue
            if (!uri.startsWith('sha1://')) {
                setStatus(`Unexpected uri: ${uri}`)
                return
            }
            const hash = uri.split('?')[0].split('/')[2]
            if (!hash) {
                setStatus(`Unexpected uri: ${uri}`)
                return
            }
            const req: ManualDeleteFileRecordRequest = {
                type: 'manualDeleteFileRecord',
                projectId,
                hashAlg: 'sha1',
                hash,
                auth: {userId, googleIdToken}
            }
            setStatus('Deleting record...')
            const resp = await guiApiRequest(req, {reCaptcha: true, setErrorMessage: (errorMessage: string) => {
                if (errorMessage) setStatus(errorMessage)
            }})
            if (resp) {
                setStatus('File record deleted.')
                setInternalValue('')
            }
        })()
    }, [googleIdToken, internalValue, projectId, userId])
    return (
        <div style={{maxWidth: 500}}>
            <h3>Manual delete file record</h3>
            <div>
                URI: <input type="text" value={internalValue} onChange={(e) => {setInternalValue(e.target.value)}} />
                <Button onClick={handleDelete}>Manually delete this file</Button>
            </div>
            <div>{status}</div>
        </div>
    )
}

export default ManualDeleteFileRecordView