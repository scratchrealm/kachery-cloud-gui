import { HeadObjectOutput, PutObjectRequest } from "aws-sdk/clients/s3";
import { NodeId, userId } from "../../src/commonInterface/kacheryTypes";
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
import { getClient, getProject, getProjectMembership } from '../common/getDatabaseItems'

const setMutableHandler = async (request: SetMutableRequest, verifiedClientId: NodeId): Promise<SetMutableResponse> => {
    const { mutableKey, value } = request.payload

    if (value.length > 1000) {
        throw Error(`Size of mutable value is too large: ${value.length}`)
    }

    const clientId = verifiedClientId

    const db = firestoreDatabase()
    const client = await getClient(clientId)

    const projectId = request.payload.projectId || client.defaultProjectId
    if (!projectId) throw Error('No default project ID')

    // const project = await getProject(projectId)

    const userId = client.ownerId
    const pm = await getProjectMembership(projectId, userId)

    if ((!pm) || (!pm.permissions.write)) {
        throw Error(`User ${userId} does not have write access on project ${projectId}`)
    }

    const mutablesCollection = db.collection('kacherycloud.mutables')
    const mKey = `${projectId}:${mutableKey.split('/').join(':')}`
    const mutableSnapshot = await mutablesCollection.doc(mKey).get()
    const alreadyExisted = mutableSnapshot.exists
    const mutableRecord: MutableRecord = {
        projectId,
        mutableKey,
        value
    }
    await mutablesCollection.doc(mKey).set(mutableRecord)

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: SetMutableLogItem = {
        type: 'setMutable',
        clientId: client.clientId,
        projectId,
        userId,
        mutableKey,
        value,
        alreadyExisted,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'setMutable',
        projectId
    }
}

export default setMutableHandler