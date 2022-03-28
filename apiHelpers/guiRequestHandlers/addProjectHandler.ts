import { UserId } from "../../src/commonInterface/kacheryTypes";
import { Project } from "../../src/types/Project";
import { AddProjectMembershipRequest, AddProjectRequest, AddProjectResponse, SetProjectMembershipPermissionsRequest } from "../../src/types/GuiRequest";
import firestoreDatabase from '../common/firestoreDatabase';
import randomAlphaString from "./helpers/randomAlphaString";
import addProjectMembershipHandler from "./addProjectMembershipHandler";
import setProjectMembershipPermissionsHandler from "./setProjectMembershipPermissionsHandler";

const MAX_NUM_PROJECTS_PER_USER = 3

const addProjectHandler = async (request: AddProjectRequest, verifiedUserId: UserId): Promise<AddProjectResponse> => {
    const { projectName, ownerId } = request
    if (verifiedUserId !== ownerId) {
        throw Error('Not authorized')
    }

    const db = firestoreDatabase()
    const collection = db.collection('kacherycloud.projects')
    const results = await collection.where('projectName', '==', projectName).get()
    if (results.docs.length > 0) {
        throw Error('Project with this name already exists.')
    }
    const results2 = await collection.where('ownerId', '==', ownerId).get()
    if (results2.docs.length + 1 > MAX_NUM_PROJECTS_PER_USER) {
        throw Error(`User cannot own more than ${MAX_NUM_PROJECTS_PER_USER} projects`)
    }
    const projectId = randomAlphaString(10)
    
    const project: Project = {
        projectName,
        projectId,
        ownerId,
        timestampCreated: Date.now(),
        timestampLastModified: Date.now(),
        settings: {
            public: true
        }
    }
    await collection.doc(projectName).set(project)

    const req2: AddProjectMembershipRequest = {
        type: 'addProjectMembership',
        projectId,
        memberId: ownerId,
        auth: request.auth
    }
    await addProjectMembershipHandler(req2, verifiedUserId)

    const req3: SetProjectMembershipPermissionsRequest = {
        type: 'setProjectMembershipPermissions',
        projectId,
        memberId: ownerId,
        projectMembershipPermissions: {
            read: true,
            write: true
        },
        auth: request.auth
    }
    await setProjectMembershipPermissionsHandler(req3, verifiedUserId)

    return {
        type: 'addProject'
    }
}

export default addProjectHandler