import { UserId } from "../../src/commonInterface/kacheryTypes";
import { SetProjectInfoRequest, SetProjectInfoResponse } from "../../src/types/GuiRequest";
import { isProject } from "../../src/types/Project";
import firestoreDatabase from '../common/firestoreDatabase';
import { getBucket, getProject } from "../common/getDatabaseItems";

const setProjectInfoHandler = async (request: SetProjectInfoRequest, verifiedUserId?: UserId): Promise<SetProjectInfoResponse> => {
    const { projectId, label, bucketId } = request
    if ((label === undefined) && (bucketId === undefined)) {
        throw Error('The following are all undefined: label, bucketId')
    }

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.projects')
    const project = await getProject(projectId)
    if (project.ownerId !== verifiedUserId) {
        throw Error('Not authorized to set project info')
    }
    
    if (label !== undefined) {
        project.label = label
    }
    if (bucketId !== undefined) {
        const bucket = await getBucket(bucketId)
        if (bucket.ownerId !== verifiedUserId) {
            throw Error(`Bucket is not owned by this user: ${bucketId} ${verifiedUserId}`)
        }
        project.bucketId = bucketId
    }
    await collection.doc(projectId).set(project)
    return {
        type: 'setProjectInfo'
    }
}

export default setProjectInfoHandler