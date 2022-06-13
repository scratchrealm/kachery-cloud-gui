import { UserId } from "../../src/commonInterface/kacheryTypes";
import { isBucket } from "../../src/types/Bucket";
import { SetBucketCredentialsRequest, SetBucketCredentialsResponse } from "../../src/types/GuiRequest";
import firestoreDatabase from '../common/firestoreDatabase';

const setBucketCredentialsHandler = async (request: SetBucketCredentialsRequest, verifiedUserId?: UserId): Promise<SetBucketCredentialsResponse> => {
    const { bucketId, bucketCredentials } = request

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.buckets')
    const docSnapshot = await collection.doc(bucketId.toString()).get()
    if (!docSnapshot.exists) {
        throw Error('Bucket does not exist in setBucketCredentialsHandler.')
    }
    const bucket = docSnapshot.data()
    if (!isBucket(bucket)) {
        throw Error('Invalid bucket')
    }
    if (bucket.ownerId !== verifiedUserId) {
        throw Error('Not authorized to set bucket settings for this bucket.')
    }
    bucket.credentials = bucketCredentials
    bucket.timestampLastModified = Date.now()
    await collection.doc(bucketId.toString()).set(bucket)
    return {
        type: 'setBucketCredentials'
    }
}

export default setBucketCredentialsHandler