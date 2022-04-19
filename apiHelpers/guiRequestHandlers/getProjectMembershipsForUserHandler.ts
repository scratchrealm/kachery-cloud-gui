import { UserId } from "../../src/commonInterface/kacheryTypes";
import { GetProjectMembershipsForUserRequest, GetProjectMembershipsForUserResponse } from "../../src/types/GuiRequest";
import { isProject, Project } from "../../src/types/Project";
import { isProjectMembership, ProjectMembership } from "../../src/types/ProjectMembership";
import firestoreDatabase from '../common/firestoreDatabase';
import isAdminUser from "./helpers/isAdminUser";

const getProjectMembershipsForUserHandler = async (request: GetProjectMembershipsForUserRequest, verifiedUserId: UserId): Promise<GetProjectMembershipsForUserResponse> => {
    const { userId } = request
    if (!userId) {
        if (!isAdminUser(verifiedUserId)) {
            throw Error('Not admin user.')
        }
    }
    if (verifiedUserId !== request.userId) {
        throw Error('Not authorized')
    }

    const db = firestoreDatabase()

    const projectsCollection = db.collection('kacherycloud.projects')
    const projectResults = userId ?
        await projectsCollection.where('ownerId', '==', userId).get() :
        await projectsCollection.get()
    const projects: Project[] = []
    for (let doc of projectResults.docs) {
        const x = doc.data()
        if (isProject(x)) {
            projects.push(x)
        }
        else {
            console.warn(x)
            console.warn('Invalid project in database')
        }
    }
    const projectIds = projects.map(ch => (ch.projectId))

    const collection = db.collection('kacherycloud.projectMemberships')
    const resultDocs = projectIds.length > 0 ? (
        userId ?
            (await collection.where('projectId', 'in', projectIds).get()).docs :
            (await collection.get()).docs
    ) : []
    const projectMemberships: ProjectMembership[] = []
    for (let doc of resultDocs) {
        const x = doc.data()
        if (isProjectMembership(x)) {
            projectMemberships.push(x)
        }
        else {
            console.warn(x)
            console.warn('Invalid project member in database')
            // await doc.ref.delete() // only delete if we are sure we want to -- don't risk losing data!
        }
    }
    return {
        type: 'getProjectMembershipsForUser',
        projectMemberships
    }
}

export default getProjectMembershipsForUserHandler