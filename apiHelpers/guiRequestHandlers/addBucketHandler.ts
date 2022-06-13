import { UserId } from "../../src/commonInterface/kacheryTypes";
import { Bucket } from "../../src/types/Bucket";
import { AddBucketRequest, AddBucketResponse } from "../../src/types/GuiRequest";
import firestoreDatabase from '../common/firestoreDatabase';
import { randomAlphaLowerString } from "./helpers/randomAlphaString";

const MAX_NUM_BUCKETS_PER_USER = 12

const addBucketHandler = async (request: AddBucketRequest, verifiedUserId?: UserId): Promise<AddBucketResponse> => {
    const { label, service, uri, ownerId } = request
    if (verifiedUserId !== ownerId) {
        throw Error('Not authorized')
    }

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.buckets')
    const results2 = await collection.where('ownerId', '==', ownerId).get()
    if (results2.docs.length + 1 > MAX_NUM_BUCKETS_PER_USER) {
        throw Error(`User cannot own more than ${MAX_NUM_BUCKETS_PER_USER} buckets`)
    }
    const bucketId = randomAlphaLowerString(10)
    
    const bucket: Bucket = {
        label,
        bucketId,
        service,
        uri,
        credentials: '',
        ownerId,
        timestampCreated: Date.now(),
        timestampLastModified: Date.now()
    }
    await collection.doc(bucketId).set(bucket)

    return {
        type: 'addBucket'
    }
}

export default addBucketHandler