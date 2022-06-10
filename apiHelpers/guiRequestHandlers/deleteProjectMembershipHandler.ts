import { UserId } from "../../src/commonInterface/kacheryTypes";
import { DeleteProjectMembershipRequest, DeleteProjectMembershipResponse } from "../../src/types/GuiRequest";
import { isProject } from "../../src/types/Project";
import firestoreDatabase from '../common/firestoreDatabase';

const deleteProjectMembershipHandler = async (request: DeleteProjectMembershipRequest, verifiedUserId?: UserId): Promise<DeleteProjectMembershipResponse> => {
    const { projectId, memberId } = request

    const db = firestoreDatabase()

    const projectsCollection = db.collection('kacherycloud.projects')
    const projectDocSnapshot = await projectsCollection.doc(projectId.toString()).get()
    if (!projectDocSnapshot.exists) {
        throw Error('Project member does not exists')
    }
    const project = projectDocSnapshot.data()
    if (!isProject(project)) {
        throw Error('Invalid project')
    }
    if (project.ownerId !== verifiedUserId) {
        throw Error('Not authorized')
    }

    if (memberId === project.ownerId) {
        throw Error('Cannot delete project membership. Owner must be a member of the project.')
    }

    const collection = db.collection('kacherycloud.projectMemberships')
    const docSnapshot = await collection.doc(projectId.toString() + ':' + memberId.toString()).get()
    if (!docSnapshot.exists) {
        throw Error('Project member does not exists')
    }
    await collection.doc(projectId.toString() + ':' + memberId.toString()).delete()
    return {
        type: 'deleteProjectMembership'
    }
}

export default deleteProjectMembershipHandler