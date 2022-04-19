import { UserId } from "../../src/commonInterface/kacheryTypes";
import { GetProjectRequest, GetProjectResponse, GetProjectsForUserRequest, GetProjectsForUserResponse } from "../../src/types/GuiRequest";
import { isProject, Project } from "../../src/types/Project";
import { isProjectMembership, ProjectMembership } from "../../src/types/ProjectMembership";
import { isProjectUsage, ProjectUsage } from "../../src/types/ProjectUsage";
import firestoreDatabase from '../common/firestoreDatabase';
import { getProject } from "../common/getDatabaseItems";
import hideSecretsInProject from './helpers/hideSecretsInProject';
import isAdminUser from "./helpers/isAdminUser";

const getProjectHandler = async (request: GetProjectRequest, verifiedUserId: UserId): Promise<GetProjectResponse> => {
    const { projectId } = request

    const project = await getProject(projectId)

    if (project.ownerId !== verifiedUserId) {
        if (!isAdminUser(verifiedUserId)) {
            throw Error('Not owner of project and not admin user.')
        }
    }

    hideSecretsInProject(project)

    const db = firestoreDatabase()
    const projectUsagesCollection = db.collection('kacherycloud.projectUsages')
    const projectUsageSnapshot = await projectUsagesCollection.doc(projectId).get()
    let projectUsage: ProjectUsage = {projectId}
    if (projectUsageSnapshot.exists) {
        const a = projectUsageSnapshot.data()
        if (!isProjectUsage(a)) throw Error('Error in project usage in database')
        projectUsage = a
    }
    
    const projectMembershipsCollection = db.collection('kacherycloud.projectMemberships')
    const result = await projectMembershipsCollection.where('projectId', '==', projectId).get()
    const projectMemberships: ProjectMembership[] = []
    for (let doc of result.docs) {
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
        type: 'getProject',
        project,
        projectUsage,
        projectMemberships
    }
}

export default getProjectHandler