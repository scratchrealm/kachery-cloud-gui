import { UserId } from "../../src/commonInterface/kacheryTypes";
import { DeleteProjectRequest, DeleteProjectResponse } from "../../src/types/GuiRequest";
import { isProject } from "../../src/types/Project";
import firestoreDatabase from '../common/firestoreDatabase';
import { getProject } from "../common/getDatabaseItems";

const deleteProjectHandler = async (request: DeleteProjectRequest, verifiedUserId?: UserId): Promise<DeleteProjectResponse> => {
    const { projectId } = request

    const db = firestoreDatabase()

    const batch = db.batch();

    const projectMembershipsCollection = db.collection('kacherycloud.projectMemberships')
    const projectMembershipsSnapshot = await projectMembershipsCollection.where('projectId', '==', projectId).get()
    projectMembershipsSnapshot.forEach(doc => {
        batch.delete(doc.ref)
    })

    const collection = db.collection('kacherycloud.projects')
    const project = await getProject(projectId)
    if (project.ownerId !== verifiedUserId) {
        throw Error('Not authorized')
    }
    batch.delete(collection.doc(projectId.toString()))

    const ipfsFilesCollection = db.collection('kacherycloud.ipfsFiles')
    const ipfsFilesResult = await ipfsFilesCollection.where('projectId', '==', projectId).get()
    ipfsFilesResult.forEach(doc => {
        batch.delete(doc.ref)
    })

    const filesCollection = db.collection('kacherycloud.files')
    const filesResult = await filesCollection.where('projectId', '==', projectId).get()
    filesResult.forEach(doc => {
        batch.delete(doc.ref)
    })
    
    await batch.commit()
    
    return {
        type: 'deleteProject'
    }
}

export default deleteProjectHandler