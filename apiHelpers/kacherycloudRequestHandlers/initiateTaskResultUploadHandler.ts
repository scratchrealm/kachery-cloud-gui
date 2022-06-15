import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { InitiateTaskResultUploadRequest, InitiateTaskResultUploadResponse } from "../../src/types/KacherycloudRequest";
import { InitiateTaskResultUploadLogItem } from "../../src/types/LogItem";
import firestoreDatabase from '../common/firestoreDatabase';
import { getBucket, getClient, getProject, getProjectMembership } from "../common/getDatabaseItems";
import { getSignedUploadUrl } from "./s3Helpers";

export const MAX_TASK_RESULT_UPLOAD_SIZE = 50 * 1000 * 1000

const initiateTaskResultUploadHandler = async (request: InitiateTaskResultUploadRequest, verifiedClientId?: NodeId): Promise<InitiateTaskResultUploadResponse> => {
    const { taskName, taskJobId, size } = request.payload

    if (size > MAX_TASK_RESULT_UPLOAD_SIZE) {
        throw Error(`Task result file too large: ${size} > ${MAX_TASK_RESULT_UPLOAD_SIZE}`)
    }

    const clientId = verifiedClientId
    if (!clientId) {
        throw Error('No verified client ID')
    }

    const db = firestoreDatabase()

    const client = await getClient(clientId)

    const projectId = request.payload.projectId || client.defaultProjectId
    if (!projectId) throw Error('No project ID')
    const userId = client.ownerId

    const project = await getProject(projectId)
    const bucket = project.bucketId ? await getBucket(project.bucketId) : undefined

    const pm = await getProjectMembership(projectId, userId)
    if ((!pm) || (!pm.permissions.write)) {
        throw Error(`User ${userId} does not have write access on project ${projectId}`)
    }

    const s = taskJobId
    const objectKey = `projects/${projectId}/taskResults/${taskName}/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`

    const signedUploadUrl = await getSignedUploadUrl(bucket, objectKey)

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: InitiateTaskResultUploadLogItem = {
        type: 'initiateTaskResultUpload',
        clientId: client.clientId,
        projectId,
        userId,
        taskName,
        taskJobId,
        size,
        objectKey,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'initiateTaskResultUpload',
        signedUploadUrl
    }
}

export default initiateTaskResultUploadHandler