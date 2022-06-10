import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { Client } from "../../src/types/Client";
import { GetClientInfoRequest, GetClientInfoResponse } from "../../src/types/KacherycloudRequest";
import { isProject, Project } from "../../src/types/Project";
import { isProjectMembership, ProjectMembership } from "../../src/types/ProjectMembership";
import { isUserSettings } from "../../src/types/User";
import firestoreDatabase from '../common/firestoreDatabase';
import { getClient } from "../common/getDatabaseItems";
import hideSecretsInProject from "../guiRequestHandlers/helpers/hideSecretsInProject";

const getClientInfoHandler = async (request: GetClientInfoRequest, verifiedClientId?: NodeId): Promise<GetClientInfoResponse> => {
    const { clientId } = request.payload

    const db = firestoreDatabase()
    let client: Client
    try {
        client = await getClient(clientId)
    }
    catch {
        return {
            type: 'getClientInfo',
            found: false
        }
    }

    // not sure if we want to restrict
    // if (client.clientId !== verifiedClientId) {
    //     throw Error('Not authorized to access this client info')
    // }

    const projectMembershipsCollection = db.collection('kacherycloud.projectMemberships')
    const projectMembershipsResults = await projectMembershipsCollection.where('memberId', '==', client.ownerId).get()
    const projectMemberships: ProjectMembership[] = []
    for (let snapshot of projectMembershipsResults.docs) {
        const pm = snapshot.data()
        if (isProjectMembership(pm)) {
            projectMemberships.push(pm)
        }
        else {
            console.warn('Invalid project membership in database', pm)
        }
    }

    const projectIds = projectMemberships.map(pm => (pm.projectId))
    const uniqueProjectIds = [...new Set(projectIds)]

    const projectsCollection = db.collection('kacherycloud.projects')
    const projectsResultDocs = uniqueProjectIds.length > 0 ? (
        (await projectsCollection.where('projectId', 'in', uniqueProjectIds).get()).docs
    ) : []
    const projects: Project[] = []
    for (let snapshot of projectsResultDocs) {
        const project = snapshot.data()
        if (isProject(project)) {
            hideSecretsInProject(project)
            projects.push(project)
        }
        else {
            console.warn('Invalid project in database', project)
        }
    }

    const usersCollection = db.collection('kacherycloud.users')
    const userSnapshot = await usersCollection.doc(client.ownerId.toString()).get()
    const userSettings = userSnapshot.exists ? userSnapshot.data() : {}
    if (!isUserSettings(userSettings)) {
        throw Error('Invalid user settings in database')
    }

    return {
        type: 'getClientInfo',
        found: true,
        client,
        projects,
        projectMemberships,
        userSettings
    }
}

export default getClientInfoHandler