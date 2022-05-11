import { NodeId, UserId } from "../../src/commonInterface/kacheryTypes"
import { Client, isClient } from "../../src/types/Client"
import { isProject, Project } from "../../src/types/Project"
import { isProjectMembership, ProjectMembership } from "../../src/types/ProjectMembership"
import firestoreDatabase from "./firestoreDatabase"

class ObjectCache<ObjectType> {
    #cache: {[key: string]: {object: ObjectType, timestamp: number}} = {}
    constructor(private expirationMsec: number) {
    }
    set(key: string, object: ObjectType) {
        this.#cache[key] = {
            object,
            timestamp: Date.now()
        }
    }
    get(key: string) {
        const a = this.#cache[key]
        if (!a) return undefined
        const elapsed = Date.now() - a.timestamp
        if (elapsed > this.expirationMsec) {
            delete this.#cache[key]
            return undefined
        }
        return a.object
    }
}

const expirationMSec = 20000
const clientObjectCache = new ObjectCache<Client>(expirationMSec)
const projectObjectCache = new ObjectCache<Project>(expirationMSec)
const projectMembershipObjectCache = new ObjectCache<ProjectMembership>(expirationMSec)

export const getClient = async (clientId: NodeId) => {
    const x = clientObjectCache.get(clientId.toString())
    if (x) return x
    const db = firestoreDatabase()
    const clientsCollection = db.collection('kacherycloud.clients')
    const clientSnapshot = await clientsCollection.doc(clientId.toString()).get()
    if (!clientSnapshot.exists) throw Error('Client not registered. Use kachery-cloud-init to register this kachery-cloud client.')
    const client = clientSnapshot.data()
    if (!isClient(client)) throw Error('Invalid client in database')
    clientObjectCache.set(clientId.toString(), client)
    return client
}

export const getProject = async (projectId: string) => {
    const x = projectObjectCache.get(projectId.toString())
    if (x) return x
    const db = firestoreDatabase()
    const projectsCollection = db.collection('kacherycloud.projects')
    const projectSnapshot = await projectsCollection.doc(projectId).get()
    if (!projectSnapshot.exists) throw Error(`Project does not exist: ${projectId}`)
    const project = projectSnapshot.data()
    if (!isProject(project)) throw Error('Invalid project in database')
    projectObjectCache.set(projectId.toString(), project)
    return project
}

export const getProjectMembership = async (projectId: string, userId: UserId) => {
    const cKey = projectId.toString() + ':' + userId.toString()
    const x = projectMembershipObjectCache.get(cKey)
    if (x) return x
    const db = firestoreDatabase()
    const projectMembershipsCollection = db.collection('kacherycloud.projectMemberships')
    const pmKey = projectId.toString() + ':' + userId.toString()
    const projectMembershipSnapshot = await projectMembershipsCollection.doc(pmKey).get()
    if (!projectMembershipSnapshot.exists) {
        return undefined
    }
    const pm = projectMembershipSnapshot.data()
    if (!isProjectMembership(pm)) throw Error('Invalid project membership in database')
    projectMembershipObjectCache.set(cKey, pm)
    return pm
}