import guiApiRequest from "common/guiApiRequest"
import { useSignedIn } from "components/googleSignIn/GoogleSignIn"
import useErrorMessage from "errorMessageContext/useErrorMessage"
import { useCallback, useEffect, useState } from "react"
import { AddBucketRequest, DeleteBucketRequest, GetBucketsForUserRequest, isAddBucketResponse, isDeleteBucketResponse, isGetBucketsForUserResponse } from "types/GuiRequest"
import { Bucket, BucketService } from "types/Bucket"
import useRoute from "components/useRoute"

const useBucketsForUser = () => {
    const [buckets, setBuckets] = useState<Bucket[] | undefined>(undefined)
    const { userId, googleIdToken } = useSignedIn()
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const refreshBuckets = useCallback(() => {
        setRefreshCode(c => (c + 1))
    }, [])
    const {setErrorMessage} = useErrorMessage()

    useEffect(() => {
        ; (async () => {
            setErrorMessage('')
            setBuckets(undefined)
            if (!userId) return
            let canceled = false
            const req: GetBucketsForUserRequest = {
                type: 'getBucketsForUser',
                userId,
                auth: { userId, googleIdToken }
            }
            const resp = await guiApiRequest(req, { reCaptcha: false, setErrorMessage })
            if (!resp) return
            if (!isGetBucketsForUserResponse(resp)) {
                console.warn(resp)
                throw Error('Unexpected response')
            }
            console.log(resp)
            if (canceled) return
            setBuckets(resp.buckets)
            return () => { canceled = true }
        })()
    }, [userId, googleIdToken, refreshCode, setErrorMessage])

    const {setRoute} = useRoute()

    const addBucket = useCallback((label: string, o: {service: BucketService, uri: string, navigateToBucketPage?: boolean}) => {
        if (!userId) return
        ; (async () => {
            const req: AddBucketRequest = {
                type: 'addBucket',
                label,
                service: o.service,
                uri: o.uri,
                ownerId: userId,
                auth: { userId, googleIdToken }
            }
            const resp = await guiApiRequest(req, { reCaptcha: true, setErrorMessage })
            if (!resp) return
            if (!isAddBucketResponse(resp)) {
                throw Error('Unexpected response')
            }
            refreshBuckets()
            if (o.navigateToBucketPage) {
                setRoute({page: 'bucket', bucketId: resp.bucketId || ''})
            }
        })()
    }, [userId, googleIdToken, refreshBuckets, setErrorMessage, setRoute])

    const deleteBucket = useCallback((bucketId: string) => {
        if (!userId) return
            ; (async () => {
                const req: DeleteBucketRequest = {
                    type: 'deleteBucket',
                    bucketId,
                    auth: { userId, googleIdToken }
                }
                const resp = await guiApiRequest(req, { reCaptcha: true, setErrorMessage })
                if (!resp) return
                if (!isDeleteBucketResponse(resp)) {
                    throw Error('Unexpected response')
                }
                refreshBuckets()
            })()
    }, [userId, googleIdToken, refreshBuckets, setErrorMessage])

    return { buckets, refreshBuckets, addBucket, deleteBucket }
}

export default useBucketsForUser