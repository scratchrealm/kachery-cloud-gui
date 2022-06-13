import guiApiRequest from "common/guiApiRequest"
import { useSignedIn } from "components/googleSignIn/GoogleSignIn"
import useErrorMessage from "errorMessageContext/useErrorMessage"
import { useCallback, useEffect, useState } from "react"
import { Bucket } from "types/Bucket"
import { GetBucketRequest, isGetBucketResponse, isSetBucketCredentialsResponse, SetBucketCredentialsRequest } from "types/GuiRequest"

const useBucket = (bucketId: string) => {
    const [bucket, setBucket] = useState<Bucket | undefined>(undefined)
    const { userId, googleIdToken } = useSignedIn()
    const {setErrorMessage} = useErrorMessage()

    const [refreshCode, setRefreshCode] = useState<number>(0)
    const refresh = useCallback(() => {
        setRefreshCode(c => (c + 1))
    }, [])

    useEffect(() => {
        ; (async () => {
            setErrorMessage('')
            setBucket(undefined)
            if (!userId) return
            let canceled = false
            const req: GetBucketRequest = {
                type: 'getBucket',
                bucketId,
                auth: { userId, googleIdToken }
            }
            const resp = await guiApiRequest(req, { reCaptcha: false, setErrorMessage })
            if (!resp) return
            if (!isGetBucketResponse(resp)) {
                console.warn(resp)
                throw Error('Unexpected response')
            }
            console.log(resp)
            if (canceled) return
            setBucket(resp.bucket)
            return () => { canceled = true }
        })()
    }, [userId, googleIdToken, bucketId, setErrorMessage, refreshCode])

    const setBucketCredentials = useCallback((o: {bucketCredentials: string}) => {
        const {bucketCredentials} = o
        if (!userId) return
            ; (async () => {
                const req: SetBucketCredentialsRequest = {
                    type: 'setBucketCredentials',
                    bucketId,
                    bucketCredentials,
                    auth: { userId, googleIdToken }
                }
                const resp = await guiApiRequest(req, { reCaptcha: true, setErrorMessage })
                if (!resp) return
                if (!isSetBucketCredentialsResponse(resp)) {
                    throw Error('Unexpected response')
                }
                refresh()
            })()
    }, [bucketId, userId, googleIdToken, refresh, setErrorMessage])

    return { bucket, setBucketCredentials, refreshBucket: refresh }
}

export default useBucket