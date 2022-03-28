import { UserId } from "../../src/commonInterface/kacheryTypes";
import { Project, isProject } from "../../src/types/Project";
import { ProjectMembership, isProjectMembership } from "../../src/types/ProjectMembership";
import { GetProjectMembershipsRequest, GetProjectMembershipsResponse } from "../../src/types/GuiRequest";
import firestoreDatabase from '../common/firestoreDatabase';
import isAdminUser from "./helpers/isAdminUser";

const getProjectMembershipsHandler = async (request: GetProjectMembershipsRequest, verifiedUserId: UserId): Promise<GetProjectMembershipsResponse> => {
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
    const results = userId ?
        await collection.where('projectId', 'in', projectIds).get() :
        await collection.get()
    const projectMemberships: ProjectMembership[] = []
    for (let doc of results.docs) {
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
        type: 'getProjectMemberships',
        projectMemberships
    }
}

export default getProjectMembershipsHandler