import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { isClient } from "../../src/types/Client";
import { FinalizeTaskResultUploadRequest, FinalizeTaskResultUploadResponse } from "../../src/types/KacherycloudRequest";
import { FinalizeTaskResultUploadLogItem } from "../../src/types/LogItem";
import { isProject } from "../../src/types/Project";
import { isProjectMembership } from "../../src/types/ProjectMembership";
import { TaskResult } from "../../src/types/TaskResult";
import firestoreDatabase from '../common/firestoreDatabase';
import { deleteObject, headObject } from "./s3Helpers";

const finalizeTaskResultUploadHandler = async (request: FinalizeTaskResultUploadRequest, verifiedClientId: NodeId): Promise<FinalizeTaskResultUploadResponse> => {
    const { taskName, taskJobId, size } = request.payload

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

    const s = taskJobId
    const objectKey = `projects/${projectId}/taskResults/${taskName}/${s[0]}${s[1]}/${s[2]}${s[3]}/${s[4]}${s[5]}/${s}`

    const x = await headObject(objectKey)
    const size2 = x.ContentLength
    if (size2 !== size) {
        await deleteObject(objectKey)
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