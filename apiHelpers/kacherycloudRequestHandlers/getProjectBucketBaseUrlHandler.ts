import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { GetProjectBucketBaseUrlRequest, GetProjectBucketBaseUrlResponse } from "../../src/types/KacherycloudRequest";
import { isProject } from "../../src/types/Project";
import firestoreDatabase from '../common/firestoreDatabase';

const getProjectBucketBaseUrlHandler = async (request: GetProjectBucketBaseUrlRequest, verifiedClientId: NodeId): Promise<GetProjectBucketBaseUrlResponse> => {
    const { projectId } = request.payload

    const db = firestoreDatabase()
    const projectsCollection = db.collection('kacherycloud.projects')
    const projectSnapshot = await projectsCollection.doc(projectId.toString()).get()
    if (!projectSnapshot.exists) {
        return {
            type: 'getProjectBucketBaseUrl',
            found: false
        }
    }
    const project = projectSnapshot.data()
    if (!isProject(project)) {
        throw Error('Unexpected: invalid client in database')
    }

    return {
        type: 'getProjectBucketBaseUrl',
        found: true,
        bucketBaseUrl: `https://kachery-cloud.s3.filebase.com/projects/${projectId}`
    }
}

export default getProjectBucketBaseUrlHandler