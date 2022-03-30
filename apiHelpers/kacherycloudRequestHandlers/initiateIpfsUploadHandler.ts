import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { isClient } from "../../src/types/Client";
import { InitiateIpfsUploadRequest, InitiateIpfsUploadResponse } from "../../src/types/KacherycloudRequest";
import { isProject } from "../../src/types/Project";
import { isProjectMembership } from "../../src/types/ProjectMembership";
import firestoreDatabase from '../common/firestoreDatabase';
import { randomAlphaLowerString } from "../guiRequestHandlers/helpers/randomAlphaString";
import s3 from "./s3";

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

    const projectId = client.defaultProjectId
    if (!projectId) throw Error('No default project ID')
    const userId = client.ownerId
    const projectsCollection = db.collection('kacherycloud.projects')
    const projectSnapshot = await projectsCollection.doc(projectId).get()
    if (!projectSnapshot.exists) throw Error(`Project does not exist: ${projectId}`)
    const project = projectSnapshot.data()
    if (!isProject(project)) throw Error('Invalid project in database')

    const projectMembershipsCollection = db.collection('kacherycloud.projectMemberships')
    const pmKey = projectId.toString() + '.' + userId.toString()
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
    const objectKey = `projects/${projectId}/uploads/${u[0]}${u[1]}/${u[2]}${u[3]}/${u[4]}${u[5]}/${u}`

    const signedUploadUrl = await getSignedUrl(objectKey)

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    await usageLogCollection.add({
        type: 'initiateIpfsUpload',
        clientId: client.clientId,
        projectId,
        userId,
        size,
        objectKey,
        timestamp: Date.now()
    })

    return {
        type: 'initiateIpfsUpload',
        signedUploadUrl,
        objectKey
    }
}

const getSignedUrl = async (key: string): Promise<string> => {
    return new Promise((resolve, reject) =>{
        s3.getSignedUrl('putObject', {
            Bucket: 'kachery-cloud',
            Key: key,
            Expires: 60 * 1 // seconds
        }, (err, url) => {
            if (err) {
                reject(new Error(`Error gettings signed url: ${err.message}`))
            }
            resolve(url)
        })
    })
}

export default initiateIpfsUploadHandler