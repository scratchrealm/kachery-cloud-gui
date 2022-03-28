import { UserId } from "../../src/commonInterface/kacheryTypes";
import { DeleteProjectRequest, DeleteProjectResponse } from "../../src/types/GuiRequest";
import { isProject } from "../../src/types/Project";
import firestoreDatabase from '../common/firestoreDatabase';

const deleteProjectHandler = async (request: DeleteProjectRequest, verifiedUserId: UserId): Promise<DeleteProjectResponse> => {
    const { projectId } = request

    const db = firestoreDatabase()

    const batch = db.batch();

    const projectMembershipsCollection = db.collection('kacherycloud.projectMemberships')
    const projectMembershipsSnapshot = await projectMembershipsCollection.where('projectId', '==', projectId).get()
    projectMembershipsSnapshot.forEach(doc => {
        batch.delete(doc.ref)
    })

    const collection = db.collection('kacherycloud.projects')
    const docSnapshot = await collection.doc(projectId.toString()).get()
    if (!docSnapshot.exists) {
        throw Error('Project does not exists')
    }
    const project = docSnapshot.data()
    if (!isProject(project)) {
        throw Error('Invalid project')
    }
    if (project.ownerId !== verifiedUserId) {
        throw Error('Not authorized')
    }
    batch.delete(collection.doc(projectId.toString()))
    
    await batch.commit()
    
    return {
        type: 'deleteProject'
    }
}

export default deleteProjectHandler