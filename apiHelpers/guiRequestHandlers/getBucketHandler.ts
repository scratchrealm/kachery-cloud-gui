import { UserId } from "../../src/commonInterface/kacheryTypes";
import { GetBucketRequest, GetBucketResponse } from "../../src/types/GuiRequest";
import { getBucket } from "../common/getDatabaseItems";
import isAdminUser from "./helpers/isAdminUser";

const getBucketHandler = async (request: GetBucketRequest, verifiedUserId?: UserId): Promise<GetBucketResponse> => {
    const { bucketId } = request

    const bucket = await getBucket(bucketId)

    if (bucket.ownerId !== verifiedUserId) {
        if (!isAdminUser(verifiedUserId)) {
            throw Error('Not owner of bucket and not admin user.')
        }
    }

    // hideSecretsInBucket(bucket)

    return {
        type: 'getBucket',
        bucket
    }
}

export default getBucketHandler