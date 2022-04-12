import { NodeId, UserId } from "../../src/commonInterface/kacheryTypes"
import { isClient } from "../../src/types/Client"
import { isProject } from "../../src/types/Project"
import { isProjectMembership } from "../../src/types/ProjectMembership"
import firestoreDatabase from "./firestoreDatabase"

export const getClient = async (clientId: NodeId) => {
    const db = firestoreDatabase()
    const clientsCollection = db.collection('kacherycloud.clients')
    const clientSnapshot = await clientsCollection.doc(clientId.toString()).get()
    if (!clientSnapshot.exists) throw Error('Client does not exist')
    const client = clientSnapshot.data()
    if (!isClient(client)) throw Error('Invalid client in database')
    return client
}

export const getProject = async (projectId: string) => {
    const db = firestoreDatabase()
    const projectsCollection = db.collection('kacherycloud.projects')
    const projectSnapshot = await projectsCollection.doc(projectId).get()
    if (!projectSnapshot.exists) throw Error(`Project does not exist: ${projectId}`)
    const project = projectSnapshot.data()
    if (!isProject(project)) throw Error('Invalid project in database')
    return project
}

export const getProjectMembership = async (projectId: string, userId: UserId) => {
    const db = firestoreDatabase()
    const projectMembershipsCollection = db.collection('kacherycloud.projectMemberships')
    const pmKey = projectId.toString() + ':' + userId.toString()
    const projectMembershipSnapshot = await projectMembershipsCollection.doc(pmKey).get()
    if (!projectMembershipSnapshot.exists) {
        throw Error(`User ${userId} is not a member of project ${projectId}`)
    }
    const pm = projectMembershipSnapshot.data()
    if (!isProjectMembership(pm)) throw Error('Invalid project membership in database')
    return pm
}