import { UserId } from "../../src/commonInterface/kacheryTypes";
import { SetProjectMembershipPermissionsRequest, SetProjectMembershipPermissionsResponse } from "../../src/types/GuiRequest";
import { isProject } from "../../src/types/Project";
import { isProjectMembership } from "../../src/types/ProjectMembership";
import firestoreDatabase from '../common/firestoreDatabase';

const setProjectMembershipPermissionsHandler = async (request: SetProjectMembershipPermissionsRequest, verifiedUserId: UserId): Promise<SetProjectMembershipPermissionsResponse> => {
    const { projectId, memberId, projectMembershipPermissions } = request

    const db = firestoreDatabase()

    const projectsCollection = db.collection('kacherycloud.projects')
    const projectDocSnapshot = await projectsCollection.doc(projectId.toString()).get()
    if (!projectDocSnapshot.exists) {
        throw Error('Project does not exist in setProjectMembershipPermissionsHandler.')
    }
    const project = projectDocSnapshot.data()
    if (!isProject(project)) {
        throw Error('Invalid project in database')
    }
    if (project.ownerId !== verifiedUserId) {
        throw Error('Not authorized')
    }

    const collection = db.collection('kacherycloud.projectMemberships')
    const key = projectId.toString() + ':' + memberId.toString()
    const docSnapshot = await collection.doc(key).get()
    if (!docSnapshot.exists) {
        throw Error('Project membership does not exist')
    }
    const projectMembership = docSnapshot.data()
    if (!isProjectMembership(projectMembership)) {
        throw Error('Invalid project membership in database')
    }

    projectMembership.permissions = projectMembershipPermissions

    await collection.doc(key).set(projectMembership)
    return {
        type: 'setProjectMembershipPermissions'
    }
}

export default setProjectMembershipPermissionsHandler