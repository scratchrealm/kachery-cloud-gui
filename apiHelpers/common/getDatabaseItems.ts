import { NodeId, UserId } from "../../src/commonInterface/kacheryTypes"
import { Client, isClient } from "../../src/types/Client"
import { isProject, Project } from "../../src/types/Project"
import { isBucket, Bucket } from "../../src/types/Bucket"
import { isProjectMembership, ProjectMembership } from "../../src/types/ProjectMembership"
import firestoreDatabase from "./firestoreDatabase"
import getDefaultBucketId from "../kacherycloudRequestHandlers/getDefaultBucketId"
import { AccessGroup, isAccessGroup } from "../../src/types/AccessGroup"

export class ObjectCache<ObjectType> {
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
    delete(key: string) {
        if (this.#cache[key]) {
            delete this.#cache[key]
        }
    }
}

const expirationMSec = 20000
const clientObjectCache = new ObjectCache<Client>(expirationMSec)
const projectObjectCache = new ObjectCache<Project>(expirationMSec)
const bucketObjectCache = new ObjectCache<Bucket>(expirationMSec)
const accessGroupObjectCache = new ObjectCache<AccessGroup>(expirationMSec)
const projectMembershipObjectCache = new ObjectCache<ProjectMembership>(expirationMSec)

export const getClient = async (clientId: NodeId, o: {includeSecrets?: boolean}={}) => {
    const x = clientObjectCache.get(clientId.toString())
    if (x) {
        if (!o.includeSecrets) x.privateKeyHex = undefined
        return x
    }
    const db = firestoreDatabase()
    const clientsCollection = db.collection('kacherycloud.clients')
    const clientSnapshot = await clientsCollection.doc(clientId.toString()).get()
    if (!clientSnapshot.exists) throw Error('Client not registered. Use kachery-cloud-init to register this kachery-cloud client.')
    const client = clientSnapshot.data()
    if (!isClient(client)) throw Error('Invalid client in database')
    clientObjectCache.set(clientId.toString(), {...client})
    if (!o.includeSecrets) client.privateKeyHex = undefined
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

export const getBucket = async (bucketId?: string) => {
    if (!bucketId) bucketId = getDefaultBucketId()
    const x = bucketObjectCache.get(bucketId.toString())
    if (x) return x
    const db = firestoreDatabase()
    const bucketsCollection = db.collection('kacherycloud.buckets')
    const bucketSnapshot = await bucketsCollection.doc(bucketId).get()
    if (!bucketSnapshot.exists) throw Error(`Bucket does not exist: ${bucketId}`)
    const bucket = bucketSnapshot.data()
    if (!isBucket(bucket)) throw Error('Invalid bucket in database')
    bucketObjectCache.set(bucketId.toString(), bucket)
    return bucket
}

export const invalidateBucketInCache = async (bucketId: string) => {
    bucketObjectCache.delete(bucketId)
}

export const getAccessGroup = async (accessGroupId: string) => {
    const x = accessGroupObjectCache.get(accessGroupId.toString())
    if (x) return x
    const db = firestoreDatabase()
    const accessGroupsCollection = db.collection('kacherycloud.accessGroups')
    const accessGroupSnapshot = await accessGroupsCollection.doc(accessGroupId).get()
    if (!accessGroupSnapshot.exists) throw Error(`Access group does not exist: ${accessGroupId}`)
    const accessGroup = accessGroupSnapshot.data()
    if (!isAccessGroup(accessGroup)) throw Error('Invalid access group in database')
    accessGroupObjectCache.set(accessGroupId.toString(), accessGroup)
    return accessGroup
}

export const invalidateAccessGroupInCache = async (accessGroupId: string) => {
    accessGroupObjectCache.delete(accessGroupId)
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