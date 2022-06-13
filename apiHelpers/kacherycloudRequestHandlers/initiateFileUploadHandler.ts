import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { InitiateFileUploadRequest, InitiateFileUploadResponse } from "../../src/types/KacherycloudRequest";
import { InitiateFileUploadLogItem } from "../../src/types/LogItem";
import firestoreDatabase from '../common/firestoreDatabase';
import { getClient, getProject, getProjectMembership } from "../common/getDatabaseItems";
import { getSignedUploadUrl } from "./s3Helpers";

export const MAX_UPLOAD_SIZE = 5 * 1000 * 1000 * 1000

const initiateFileUploadHandler = async (request: InitiateFileUploadRequest, verifiedClientId?: NodeId): Promise<InitiateFileUploadResponse> => {
    const { size, hashAlg, hash } = request.payload

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
    // check that the project exists
    if (project.projectId !== projectId) {
        throw Error('Unexpected projectId')
    }

    const pm = await getProjectMembership(projectId, userId)
    if (!pm) {
        throw Error(`User ${userId} is not a member of project ${projectId}`)
    }
    if (!pm.permissions.write) {
        throw Error(`User ${userId} does not have write access on project ${projectId}`)
    }

    const filesCollection = db.collection('kacherycloud.files')
    const fKey = `${projectId}:${hashAlg}:${hash}`
    const fileSnapshot = await filesCollection.doc(fKey).get()
    if (fileSnapshot.exists) {
        return {
            type: 'initiateFileUpload',
            alreadyExists: true
        }
    }

    const h = hash
    const objectKey = `projects/${projectId}/${hashAlg}/${h[0]}${h[1]}/${h[2]}${h[3]}/${h[4]}${h[5]}/${hash}`

    const signedUploadUrl = await getSignedUploadUrl(objectKey)

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: InitiateFileUploadLogItem = {
        type: 'initiateFileUpload',
        clientId: client.clientId,
        projectId,
        userId,
        size,
        hashAlg,
        hash,
        objectKey,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'initiateFileUpload',
        alreadyExists: false,
        objectKey,
        signedUploadUrl
    }
}



export default initiateFileUploadHandler