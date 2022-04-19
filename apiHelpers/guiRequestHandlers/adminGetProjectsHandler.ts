import { UserId } from "../../src/commonInterface/kacheryTypes";
import { AdminGetProjectsRequest, AdminGetProjectsResponse, GetProjectUsageRequest, GetProjectUsageResponse } from "../../src/types/GuiRequest";
import { isProject, Project } from "../../src/types/Project";
import { isProjectUsage } from "../../src/types/ProjectUsage";
import firestoreDatabase from '../common/firestoreDatabase';
import { getProjectMembership } from "../common/getDatabaseItems";
import isAdminUser from "./helpers/isAdminUser";

const adminGetProjectsHandler = async (request: AdminGetProjectsRequest, verifiedUserId: UserId): Promise<AdminGetProjectsResponse> => {
    if (!isAdminUser(verifiedUserId)) {
        throw Error('Not an admin user')
    }

    const db = firestoreDatabase()
    const projectsCollection = db.collection('kacherycloud.projects');
    const results = await projectsCollection.get()
    const projects: Project[] = []
    for (let doc of results.docs) {
        const project = doc.data()
        if (!isProject(project)) {
            throw Error('Invalid project in database')
        }
        projects.push(project)
    }
    return {
        type: 'adminGetProjects',
        projects
    }
}

export default adminGetProjectsHandler