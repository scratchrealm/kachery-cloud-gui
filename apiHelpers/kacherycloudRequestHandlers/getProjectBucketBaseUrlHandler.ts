import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { GetProjectBucketBaseUrlRequest, GetProjectBucketBaseUrlResponse } from "../../src/types/KacherycloudRequest";
import { getProject } from "../common/getDatabaseItems";

const getProjectBucketBaseUrlHandler = async (request: GetProjectBucketBaseUrlRequest, verifiedClientId?: NodeId): Promise<GetProjectBucketBaseUrlResponse> => {
    const { projectId } = request.payload

    const project = await getProject(projectId)

    return {
        type: 'getProjectBucketBaseUrl',
        found: true,
        bucketBaseUrl: `https://kachery-cloud.s3.filebase.com/projects/${project.projectId}`
    }
}

export default getProjectBucketBaseUrlHandler