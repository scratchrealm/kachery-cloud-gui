import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { isClient } from "../../src/types/Client";
import { InitiateTaskResultUploadRequest, InitiateTaskResultUploadResponse } from "../../src/types/KacherycloudRequest";
import { InitiateTaskResultUploadLogItem } from "../../src/types/LogItem";
import { isProject } from "../../src/types/Project";
import { isProjectMembership } from "../../src/types/ProjectMembership";
import firestoreDatabase from '../common/firestoreDatabase';
import { getSignedUploadUrl } from "./s3Helpers";

export const MAX_TASK_RESULT_UPLOAD_SIZE = 50 * 1000 * 1000

const initiateTaskResultUploadHandler = async (request: InitiateTaskResultUploadRequest, verifiedClientId: NodeId): Promise<InitiateTaskResultUploadResponse> => {
    const { taskName, taskJobId, size } = request.payload

    if (size > MAX_TASK_RESULT_UPLOAD_SIZE) {
        throw Error(`Task result file too large: ${size} > ${MAX_TASK_RESULT_UPLOAD_SIZE}`)
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

    const s = taskJobId
    const objectKey = `projects/${projectId}/taskResults/${taskName}/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`

    const signedUploadUrl = await getSignedUploadUrl(objectKey)

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