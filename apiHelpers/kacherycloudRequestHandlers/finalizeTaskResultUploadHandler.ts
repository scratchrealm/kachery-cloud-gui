import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { FinalizeTaskResultUploadRequest, FinalizeTaskResultUploadResponse } from "../../src/types/KacherycloudRequest";
import { FinalizeTaskResultUploadLogItem } from "../../src/types/LogItem";
import { TaskResult } from "../../src/types/TaskResult";
import firestoreDatabase from '../common/firestoreDatabase';
import { getBucket, getClient, getProject, getProjectMembership } from "../common/getDatabaseItems";
import { deleteObject, headObject } from "./s3Helpers";

const finalizeTaskResultUploadHandler = async (request: FinalizeTaskResultUploadRequest, verifiedClientId?: NodeId): Promise<FinalizeTaskResultUploadResponse> => {
    const { taskName, taskJobId, size } = request.payload

    const clientId = verifiedClientId
    if (!clientId) {
        throw Error('No verified client ID')
    }

    const db = firestoreDatabase()

    const client = await getClient(clientId)

    const projectId = request.payload.projectId || client.defaultProjectId
    if (!projectId) throw Error('No default project ID')
    const userId = client.ownerId

    const project = await getProject(projectId)
    const bucket = await getBucket(project.bucketId)
    
    const pm = await getProjectMembership(projectId, userId)
    if ((!pm) || (!pm.permissions.write)) {
        throw Error(`User ${userId} does not have write access on project ${projectId}`)
    }

    const s = taskJobId
    const objectKey = `projects/${projectId}/taskResults/${taskName}/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`

    const x = await headObject(bucket, objectKey)
    const size2 = x.ContentLength
    if (size2 !== size) {
        await deleteObject(bucket, objectKey)
        throw Error(`Unexpected size in uploaded task result *: ${size2} <> ${size}`)
    }

    const taskResultsCollection = db.collection('kacherycloud.taskResults')
    const trKey = `${projectId}:${taskName}:${taskJobId}`
    const taskResultSnapshot = await taskResultsCollection.doc(trKey).get()
    const alreadyExisted = taskResultSnapshot.exists
    const taskResult: TaskResult = {
        clientId,
        userId,
        projectId,
        taskName,
        taskJobId,
        size,
        objectKey,
        timestampCreated: Date.now()
    }
    await taskResultsCollection.doc(trKey).set(taskResult)

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: FinalizeTaskResultUploadLogItem = {
        type: 'finalizeTaskResultUpload',
        clientId,
        projectId,
        userId,
        taskName,
        taskJobId,
        size,
        objectKey,
        alreadyExisted,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'finalizeTaskResultUpload'
    }
}

export default finalizeTaskResultUploadHandler