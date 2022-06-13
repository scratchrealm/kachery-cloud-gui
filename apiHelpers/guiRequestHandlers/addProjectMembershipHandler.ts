import { UserId } from "../../src/commonInterface/kacheryTypes";
import { AddProjectMembershipRequest, AddProjectMembershipResponse } from "../../src/types/GuiRequest";
import { ProjectMembership } from "../../src/types/ProjectMembership";
import firestoreDatabase from '../common/firestoreDatabase';
import { getProject } from "../common/getDatabaseItems";

const addProjectMembershipHandler = async (request: AddProjectMembershipRequest, verifiedUserId?: UserId): Promise<AddProjectMembershipResponse> => {
    const { projectId, memberId } = request

    const db = firestoreDatabase()

    const project = await getProject(projectId)
    if (project.ownerId !== verifiedUserId) {
        throw Error('Not authorized')
    }

    const collection = db.collection('kacherycloud.projectMemberships')
    const key = projectId.toString() + ':' + memberId.toString()
    const docSnapshot = await collection.doc(key).get()
    if (docSnapshot.exists) {
        throw Error('Project member already exists')
    }
    
    const projectMembership: ProjectMembership = {
        projectId,
        memberId,
        permissions: {
            read: true,
            write: false
        }
    }
    await collection.doc(projectId.toString() + ':' + memberId.toString()).set(projectMembership)
    return {
        type: 'addProjectMembership'
    }
}

export default addProjectMembershipHandler