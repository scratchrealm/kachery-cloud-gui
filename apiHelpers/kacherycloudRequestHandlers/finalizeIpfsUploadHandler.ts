import { HeadObjectOutput, PutObjectRequest } from "aws-sdk/clients/s3";
import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { isClient } from "../../src/types/Client";
import { IpfsFile } from "../../src/types/IpfsFile";
import { FinalizeIpfsUploadRequest, FinalizeIpfsUploadResponse } from "../../src/types/KacherycloudRequest";
import { FinalizeIpfsdUploadLogItem } from "../../src/types/LogItem";
import { isProject } from "../../src/types/Project";
import { isProjectMembership } from "../../src/types/ProjectMembership";
import firestoreDatabase from '../common/firestoreDatabase';
import { MAX_UPLOAD_SIZE } from "./initiateIpfsUploadHandler";
import s3 from "./s3";

const finalizeIpfsUploadHandler = async (request: FinalizeIpfsUploadRequest, verifiedClientId: NodeId): Promise<FinalizeIpfsUploadResponse> => {
    const { objectKey } = request.payload

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
    const ifKey = `${projectId}.${cid}`
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
    const logItem: FinalizeIpfsdUploadLogItem = {
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

const headObject = async (key: string): Promise<HeadObjectOutput> => {
    return new Promise((resolve, reject) =>{
        s3.headObject({
            Bucket: 'kachery-cloud',
            Key: key
        }, (err, data) => {
            if (err) {
                reject(new Error(`Error gettings metadata for object: ${err.message}`))
            }
            resolve(data)
        })
    })
}

// unused but maybe useful in the future
const putObject = async (params: PutObjectRequest): Promise<{cid: string}> => {
    return new Promise<{cid: string}>((resolve, reject) => {
        const request = s3.putObject(params)
        request.on('error', (err) => {
            reject(new Error(`Error uploading to filebase: ${err.message}`)) 
        })
        request.on('httpHeaders', (statusCode, headers, response, statusMessage) => {
            if (statusCode !== 200) {
                reject(`Error uploading to filebase * (${statusCode}): ${statusMessage}`)
                return
            }
            const cid = headers['x-amz-meta-cid']
            
            resolve({cid})
        })
        request.send()
    })
}

const deleteObject = async (key: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        s3.deleteObject({
            Bucket: 'kachery-cloud',
            Key: key
        }, (err, data) => {
            if (err) {
                reject(new Error('Problem deleting object'))
            }
            else {
                resolve()
            }
        })
    })
}

// unused but maybe useful
const objectExists = async (key: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
        s3.headObject({
            Bucket: 'kachery-cloud',
            Key: key
        }, (err, data) => {
            if (err) {
                if (err.statusCode === 404) { // not found
                    resolve(false)
                }
                else {
                    reject(new Error('Unexpected status code for headObject'))
                }
            }
            else {
                resolve(true)
            }
        })
    })
}

export default finalizeIpfsUploadHandler