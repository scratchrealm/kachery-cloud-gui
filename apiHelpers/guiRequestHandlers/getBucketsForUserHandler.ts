import { UserId } from "../../src/commonInterface/kacheryTypes";
import { GetBucketsForUserRequest, GetBucketsForUserResponse } from "../../src/types/GuiRequest";
import { isBucket, Bucket } from "../../src/types/Bucket";
import firestoreDatabase from '../common/firestoreDatabase';
import hideSecretsInBucket from './helpers/hideSecretsInBucket';
import isAdminUser from "./helpers/isAdminUser";

const getBucketsForUserHandler = async (request: GetBucketsForUserRequest, verifiedUserId?: UserId): Promise<GetBucketsForUserResponse> => {
    const { userId } = request
    if (!userId) {
        if (!isAdminUser(verifiedUserId)) {
            throw Error('Not admin user.')
        }
    }
    if (verifiedUserId !== request.userId) {
        throw Error('Not authorized')
    }

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.buckets')
    const results = userId ?
        await collection.where('ownerId', '==', userId).get() :
        await collection.get()
    const buckets: Bucket[] = []
    for (let doc of results.docs) {
        const x = doc.data()
        if (isBucket(x)) {
            buckets.push(x)
        }
        else {
            console.warn(x)
            console.warn('Invalid bucket in database')
            // await doc.ref.delete() // only delete if we are sure we want to -- don't risk losing data!
        }
    }
    for (let bucket of buckets) {
        hideSecretsInBucket(bucket)
    }
    return {
        type: 'getBucketsForUser',
        buckets
    }
}

export default getBucketsForUserHandler