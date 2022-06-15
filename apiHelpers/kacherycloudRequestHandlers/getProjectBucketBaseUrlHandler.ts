import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { BucketService } from "../../src/types/Bucket";
import { GetProjectBucketBaseUrlRequest, GetProjectBucketBaseUrlResponse } from "../../src/types/KacherycloudRequest";
import { getBucket, getProject } from "../common/getDatabaseItems";
import getDefaultBucketId from "./getDefaultBucketId";

const getProjectBucketBaseUrlHandler = async (request: GetProjectBucketBaseUrlRequest, verifiedClientId?: NodeId): Promise<GetProjectBucketBaseUrlResponse> => {
    const { projectId } = request.payload

    const project = await getProject(projectId)
    const bucketId = project.bucketId ? project.bucketId : getDefaultBucketId()
    const bucket = await getBucket(bucketId)
    const service = bucket.service
    const cred = JSON.parse(bucket.credentials || '{}')
    const bucketUri = bucket.uri
    const bucketName = bucketUri.split('?')[0].split('/')[2]
    let bucketBaseUrl: string
    if (service === 'filebase') {
        bucketBaseUrl = `https://${bucketName}.s3.filebase.com`
    }
    else if (service === 'aws') {
        bucketBaseUrl = `https://${bucketName}.s3.amazonaws.com`
    }
    else if (service === 'wasabi') {
        bucketBaseUrl = `https://s3.${cred.region || 'us-east-1'}.wasabisys.com/${bucketName}`
    }
    else if (service === 'google') {
        bucketBaseUrl = `https://storage.googleapis.com/${bucketName}`
    }
    else {
        throw Error(`Unsupported service: ${service}`)
    }

    return {
        type: 'getProjectBucketBaseUrl',
        found: true,
        projectBaseUrl: `${bucketBaseUrl}/projects/${project.projectId}`
    }
}

export default getProjectBucketBaseUrlHandler