import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { BucketService } from "../../src/types/Bucket";
import { GetProjectBucketBaseUrlRequest, GetProjectBucketBaseUrlResponse } from "../../src/types/KacherycloudRequest";
import { getBucket, getProject } from "../common/getDatabaseItems";

const getProjectBucketBaseUrlHandler = async (request: GetProjectBucketBaseUrlRequest, verifiedClientId?: NodeId): Promise<GetProjectBucketBaseUrlResponse> => {
    const { projectId } = request.payload

    const project = await getProject(projectId)
    const bucket = project.bucketId ? await getBucket(project.bucketId) : undefined
    const service = bucket?.service || 'filebase' as BucketService
    const bucketUri = bucket?.uri || 'filebase://kachery-cloud'
    const bucketName = bucketUri.split('?')[0].split('/')[2]
    let bucketBaseUrl: string
    if (service === 'filebase') {
        bucketBaseUrl = `https://${bucketName}.s3.filebase.com`
    }
    else if (service === 'aws') {
        bucketBaseUrl = `https://${bucketName}.s3.amazonaws.com`
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