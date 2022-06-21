import { UserId } from "../../src/commonInterface/kacheryTypes";
import { AdminGetProjectsRequest, AdminGetProjectsResponse } from "../../src/types/GuiRequest";
import { isProject, Project } from "../../src/types/Project";
import { isProjectUsage, ProjectUsage } from "../../src/types/ProjectUsage";
import firestoreDatabase from '../common/firestoreDatabase';
import isAdminUser from "./helpers/isAdminUser";

const adminGetProjectsHandler = async (request: AdminGetProjectsRequest, verifiedUserId?: UserId): Promise<AdminGetProjectsResponse> => {
    if (!isAdminUser(verifiedUserId)) {
        throw Error('Not an admin user')
    }

    const db = firestoreDatabase()
    const projectsCollection = db.collection('kacherycloud.projects')
    const results = await projectsCollection.get()
    const projects: Project[] = []
    for (let doc of results.docs) {
        const project = doc.data()
        if (!isProject(project)) {
            throw Error('Invalid project in database')
        }
        projects.push(project)
    }

    const projectUsagesCollection = db.collection('kacherycloud.projectUsages')
    const results2 = await projectUsagesCollection.get()
    const projectUsages: ProjectUsage[] = []
    for (let doc of results2.docs) {
        const projectUsage = doc.data()
        if (!isProjectUsage(projectUsage)) {
            throw Error('Invalid project usage in database')
        }
        projectUsages.push(projectUsage)
    }

    return {
        type: 'adminGetProjects',
        projects,
        projectUsages
    }
}

export default adminGetProjectsHandler