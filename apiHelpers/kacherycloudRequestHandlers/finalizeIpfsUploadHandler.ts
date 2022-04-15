import { HeadObjectOutput, PutObjectRequest } from "aws-sdk/clients/s3";
import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { isClient } from "../../src/types/Client";
import { IpfsFile } from "../../src/types/IpfsFile";
import { FinalizeIpfsUploadRequest, FinalizeIpfsUploadResponse } from "../../src/types/KacherycloudRequest";
import { FinalizeIpfsUploadLogItem } from "../../src/types/LogItem";
import { isProject } from "../../src/types/Project";
import { isProjectMembership } from "../../src/types/ProjectMembership";
import firestoreDatabase from '../common/firestoreDatabase';
import { getClient, getProject, getProjectMembership } from "../common/getDatabaseItems";
import { MAX_UPLOAD_SIZE } from "./initiateIpfsUploadHandler";
import { deleteObject, headObject } from "./s3Helpers";

const finalizeIpfsUploadHandler = async (request: FinalizeIpfsUploadRequest, verifiedClientId: NodeId): Promise<FinalizeIpfsUploadResponse> => {
    const { objectKey } = request.payload

    const clientId = verifiedClientId

    const db = firestoreDatabase()

    const client = await getClient(clientId)

    const projectId = request.payload.projectId || client.defaultProjectId
    if (!projectId) throw Error('No default project ID')
    const userId = client.ownerId

    // const project = await getProject(projectId)

    const pm = await getProjectMembership(projectId, userId)
    if (!pm.permissions.write) {
        throw Error(`User ${userId} does not have write access on project ${projectId}`)
    }

    const x = await headObject(objectKey)
    const size = x.ContentLength
    if (size > MAX_UPLOAD_SIZE) {
        await deleteObject(objectKey)
        throw Error(`File too large *: ${size} > ${MAX_UPLOAD_SIZE}`)
    }
    const cid = x.Metadata.cid
    if (!cid) {
        throw Error(`No cid field in metaData of object: ${objectKey}`)
    }

    const ipfsFilesCollection = db.collection('kacherycloud.ipfsFiles')
    const ifKey = `${projectId}:${cid}`
    const ipfsFileSnapshot = await ipfsFilesCollection.doc(ifKey).get()
    const alreadyExisted = ipfsFileSnapshot.exists
    let url: string
    if (alreadyExisted) {
        url = ipfsFileSnapshot.data()['url']
        await deleteObject(objectKey)
    }
    else {
        url = `https://kachery-cloud.s3.filebase.com/${objectKey}`
        const ipfsFile: IpfsFile = {
            projectId,
            cid,
            size,
            url
        }
        await ipfsFilesCollection.doc(ifKey).set(ipfsFile)
    }

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: FinalizeIpfsUploadLogItem = {
        type: 'finalizeIpfsUpload',
        clientId: client.clientId,
        projectId,
        userId,
        size,
        objectKey,
        url,
        alreadyExisted,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'finalizeIpfsUpload',
        cid
    }
}

export default finalizeIpfsUploadHandler