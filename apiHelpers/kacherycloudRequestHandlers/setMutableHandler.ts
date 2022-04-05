import { HeadObjectOutput, PutObjectRequest } from "aws-sdk/clients/s3";
import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { isClient } from "../../src/types/Client";
import { IpfsFile } from "../../src/types/IpfsFile";
import { FinalizeIpfsUploadRequest, FinalizeIpfsUploadResponse, SetMutableRequest, SetMutableResponse } from "../../src/types/KacherycloudRequest";
import { FinalizeIpfsUploadLogItem, SetMutableLogItem } from "../../src/types/LogItem";
import { MutableRecord } from "../../src/types/MutableRecord";
import { isProject } from "../../src/types/Project";
import { isProjectMembership } from "../../src/types/ProjectMembership";
import firestoreDatabase from '../common/firestoreDatabase';
import { MAX_UPLOAD_SIZE } from "./initiateIpfsUploadHandler";
import { deleteObject, headObject } from "./s3Helpers";

const setMutableHandler = async (request: SetMutableRequest, verifiedClientId: NodeId): Promise<SetMutableResponse> => {
    const { mutableKey, cid } = request.payload

    if (!isValidCid(cid)) {
        throw Error('invalid CID')
    }

    const clientId = verifiedClientId

    const db = firestoreDatabase()
    const clientsCollection = db.collection('kacherycloud.clients')
    const clientSnapshot = await clientsCollection.doc(clientId.toString()).get()
    if (!clientSnapshot.exists) throw Error('Client does not exist')
    const client = clientSnapshot.data()
    if (!isClient(client)) throw Error('Invalid client in database')

    const projectId = request.payload.projectId || client.defaultProjectId
    if (!projectId) throw Error('No default project ID')
    const userId = client.ownerId
    const projectsCollection = db.collection('kacherycloud.projects')
    const projectSnapshot = await projectsCollection.doc(projectId).get()
    if (!projectSnapshot.exists) throw Error(`Project does not exist: ${projectId}`)
    const project = projectSnapshot.data()
    if (!isProject(project)) throw Error('Invalid project in database')

    const projectMembershipsCollection = db.collection('kacherycloud.projectMemberships')
    const pmKey = projectId.toString() + ':' + userId.toString()
    const projectMembershipSnapshot = await projectMembershipsCollection.doc(pmKey).get()
    if (!projectMembershipSnapshot.exists) {
        throw Error(`User ${userId} is not a member of project ${projectId}`)
    }
    const pm = projectMembershipSnapshot.data()
    if (!isProjectMembership(pm)) throw Error('Invalid project membership in database')
    if (!pm.permissions.write) {
        throw Error(`User ${userId} does not have write access on project ${projectId}`)
    }

    const mutablesCollection = db.collection('kacherycloud.mutables')
    const mKey = `${projectId}:${mutableKey.replace('/', ':')}`
    const mutableSnapshot = await mutablesCollection.doc(mKey).get()
    const alreadyExisted = mutableSnapshot.exists
    const mutableRecord: MutableRecord = {
        projectId,
        mutableKey,
        cid
    }
    await mutablesCollection.doc(mKey).set(mutableRecord)

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: SetMutableLogItem = {
        type: 'setMutable',
        clientId: client.clientId,
        projectId,
        userId,
        mutableKey,
        cid,
        alreadyExisted,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'setMutable',
        projectId
    }
}

const isValidCid = (x: string) => {
    return x.length < 100
}

export default setMutableHandler