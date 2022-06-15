import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { InitiateIpfsUploadRequest, InitiateIpfsUploadResponse } from "../../src/types/KacherycloudRequest";
import { InitiateIpfsUploadLogItem } from "../../src/types/LogItem";
import { isProject } from "../../src/types/Project";
import { isProjectMembership } from "../../src/types/ProjectMembership";
import firestoreDatabase from '../common/firestoreDatabase';
import { getBucket, getClient, getProject, getProjectMembership } from "../common/getDatabaseItems";
import { randomAlphaLowerString } from "../guiRequestHandlers/helpers/randomAlphaString";
import { getSignedUploadUrl } from "./s3Helpers";

export const MAX_UPLOAD_SIZE = 5 * 1000 * 1000 * 1000

const initiateIpfsUploadHandler = async (request: InitiateIpfsUploadRequest, verifiedClientId?: NodeId): Promise<InitiateIpfsUploadResponse> => {
    const { size } = request.payload

    const clientId = verifiedClientId
    if (!clientId) {
        throw Error('No verified client ID')
    }

    if (size > MAX_UPLOAD_SIZE) {
        throw Error(`File too large: ${size} > ${MAX_UPLOAD_SIZE}`)
    }

    const db = firestoreDatabase()
    const client = await getClient(clientId)

    const projectId = request.payload.projectId || client.defaultProjectId
    if (!projectId) throw Error('No project ID')
    const userId = client.ownerId
    const project = await getProject(projectId)
    const bucket = await getBucket(project.bucketId)

    const pm = await getProjectMembership(projectId, userId)
    if (!pm) {
        throw Error(`User ${userId} is not a member of project ${projectId}`)
    }
    if (!pm.permissions.write) {
        throw Error(`User ${userId} does not have write access on project ${projectId}`)
    }

    const uploadId = randomAlphaLowerString(20)
    const u = uploadId
    const objectKey = `projects/${projectId}/uploads/${u[0]}${u[1]}/${u[2]}${u[3]}/${u[4]}${u[5]}/${uploadId}`

    const signedUploadUrl = await getSignedUploadUrl(bucket, objectKey)

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: InitiateIpfsUploadLogItem = {
        type: 'initiateIpfsUpload',
        clientId: client.clientId,
        projectId,
        userId,
        size,
        objectKey,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'initiateIpfsUpload',
        signedUploadUrl,
        objectKey
    }
}



export default initiateIpfsUploadHandler