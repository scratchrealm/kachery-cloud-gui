import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { isClient } from "../../src/types/Client";
import { InitiateIpfsUploadRequest, InitiateIpfsUploadResponse } from "../../src/types/KacherycloudRequest";
import { InitiateIpfsUploadLogItem } from "../../src/types/LogItem";
import { isProject } from "../../src/types/Project";
import { isProjectMembership } from "../../src/types/ProjectMembership";
import firestoreDatabase from '../common/firestoreDatabase';
import { randomAlphaLowerString } from "../guiRequestHandlers/helpers/randomAlphaString";
import s3 from "./s3";
import { getSignedUploadUrl } from "./s3Helpers";

export const MAX_UPLOAD_SIZE = 50 * 1000 * 1000

const initiateIpfsUploadHandler = async (request: InitiateIpfsUploadRequest, verifiedClientId: NodeId): Promise<InitiateIpfsUploadResponse> => {
    const { size } = request.payload

    if (size > MAX_UPLOAD_SIZE) {
        throw Error(`File too large: ${size} > ${MAX_UPLOAD_SIZE}`)
    }

    const clientId = verifiedClientId

    const db = firestoreDatabase()
    const clientsCollection = db.collection('kacherycloud.clients')
    const clientSnapshot = await clientsCollection.doc(clientId.toString()).get()
    if (!clientSnapshot.exists) throw Error('Client does not exist')
    const client = clientSnapshot.data()
    if (!isClient(client)) throw Error('Invalid client in database')

    const projectId = request.payload.projectId || client.defaultProjectId
    if (!projectId) throw Error('No project ID')
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

    const uploadId = randomAlphaLowerString(20)
    const u = uploadId
    const objectKey = `projects/${projectId}/uploads/${u[0]}${u[1]}/${u[2]}${u[3]}/${u[4]}${u[5]}/${uploadId}`

    const signedUploadUrl = await getSignedUploadUrl(objectKey)

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