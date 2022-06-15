import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { FinalizeFileUploadRequest, FinalizeFileUploadResponse } from "../../src/types/KacherycloudRequest";
import { FinalizeFileUploadLogItem } from "../../src/types/LogItem";
import firestoreDatabase from '../common/firestoreDatabase';
import { getBucket, getClient, getProject, getProjectMembership } from "../common/getDatabaseItems";
import { MAX_UPLOAD_SIZE } from "./initiateFileUploadHandler";
import { deleteObject, headObject } from "./s3Helpers";
import { FileRecord } from '../../src/types/FileRecord'
import getDefaultBucketId from "./getDefaultBucketId";

const finalizeFileUploadHandler = async (request: FinalizeFileUploadRequest, verifiedClientId?: NodeId): Promise<FinalizeFileUploadResponse> => {
    const { objectKey, hashAlg, hash } = request.payload

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
    const bucketId = project.bucketId ? project.bucketId : getDefaultBucketId()
    const bucket = await getBucket(bucketId)
    const service = bucket.service
    const cred = JSON.parse(bucket.credentials || '{}')
    const bucketUri = bucket.uri
    const bucketName = bucketUri.split('?')[0].split('/')[2]
    let bucketBaseUrl: string
    if (service === 'filebase') {
        bucketBaseUrl = `https://${bucketName}.s3.filebase.com`
    }
    else if (service === 'aws') {
        bucketBaseUrl = `https://${bucketName}.s3.amazonaws.com`
    }
    else if (service === 'wasabi') {
        bucketBaseUrl = `https://s3.${cred.region || 'us-east-1'}.wasabisys.com/${bucketName}`
    }
    else if (service === 'google') {
        bucketBaseUrl = `https://storage.googleapis.com/${bucketName}`
    }
    else {
        throw Error(`Unsupported service: ${service}`)
    }

    const pm = await getProjectMembership(projectId, userId)
    if ((!pm) || (!pm.permissions.write)) {
        throw Error(`User ${userId} does not have write access on project ${projectId}`)
    }

    const x = await headObject(bucket, objectKey)
    const size = x.ContentLength
    if (size === undefined) {
        throw Error('Not ContentLength in object')
    }
    if (size > MAX_UPLOAD_SIZE) {
        await deleteObject(bucket, objectKey)
        throw Error(`File too large *: ${size} > ${MAX_UPLOAD_SIZE}`)
    }

    const filesCollection = db.collection('kacherycloud.files')
    const fKey = `${projectId}:${hashAlg}:${hash}`
    const fileSnapshot = await filesCollection.doc(fKey).get()
    const alreadyExisted = fileSnapshot.exists
    let url: string
    if (alreadyExisted) {
        url = (fileSnapshot.data() || {})['url']
        if (!url) {
            throw Error('Unexpected: file exists but no url found')
        }
        await deleteObject(bucket, objectKey)
    }
    else {
        url = `${bucketBaseUrl}/${objectKey}`
        const uri = `${hashAlg}://${hash}`
        const fileRecord: FileRecord = {
            projectId,
            hashAlg,
            hash,
            uri,
            size,
            url
        }
        await filesCollection.doc(fKey).set(fileRecord)
    }

    const usageLogCollection = db.collection('kacherycloud.usageLog')
    const logItem: FinalizeFileUploadLogItem = {
        type: 'finalizeFileUpload',
        clientId: client.clientId,
        projectId,
        userId,
        size,
        objectKey,
        hashAlg,
        hash,
        url,
        alreadyExisted,
        timestamp: Date.now()
    }
    await usageLogCollection.add(logItem)

    return {
        type: 'finalizeFileUpload'
    }
}

export default finalizeFileUploadHandler