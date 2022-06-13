import { UserId } from "../../src/commonInterface/kacheryTypes";
import { isBucket } from "../../src/types/Bucket";
import { SetBucketLabelRequest, SetBucketLabelResponse } from "../../src/types/GuiRequest";
import firestoreDatabase from '../common/firestoreDatabase';

const setBucketLabelHandler = async (request: SetBucketLabelRequest, verifiedUserId?: UserId): Promise<SetBucketLabelResponse> => {
    const { bucketId, label } = request

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.buckets')
    let docSnapshot = await collection.doc(bucketId).get()

    if (!docSnapshot.exists) {
        throw Error('Bucket does not exist')
    }

    const bucket = docSnapshot.data()
    if (!isBucket(bucket)) {
        throw Error('Invalid bucket in database')
    }
    if (bucket.ownerId !== verifiedUserId) {
        throw Error('Not authorized to set bucket label')
    }
    
    bucket.label = label
    await collection.doc(bucketId).set(bucket)
    return {
        type: 'setBucketLabel'
    }
}

export default setBucketLabelHandler