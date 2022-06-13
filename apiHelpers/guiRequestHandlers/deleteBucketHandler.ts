import { UserId } from "../../src/commonInterface/kacheryTypes";
import { DeleteBucketRequest, DeleteBucketResponse } from "../../src/types/GuiRequest";
import { isBucket } from "../../src/types/Bucket";
import firestoreDatabase from '../common/firestoreDatabase';

const deleteBucketHandler = async (request: DeleteBucketRequest, verifiedUserId?: UserId): Promise<DeleteBucketResponse> => {
    const { bucketId } = request

    const db = firestoreDatabase()

    const batch = db.batch();

    const collection = db.collection('kacherycloud.buckets')
    const docSnapshot = await collection.doc(bucketId.toString()).get()
    if (!docSnapshot.exists) {
        throw Error(`Bucket does not exist in deleteBucketHandler: ${bucketId}`)
    }
    const bucket = docSnapshot.data()
    if (!isBucket(bucket)) {
        throw Error('Invalid bucket')
    }
    if (bucket.ownerId !== verifiedUserId) {
        throw Error('Not authorized')
    }
    batch.delete(collection.doc(bucketId.toString()))
    await batch.commit()
    
    return {
        type: 'deleteBucket'
    }
}

export default deleteBucketHandler