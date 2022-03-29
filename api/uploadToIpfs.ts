import { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import firestoreDatabase from '../apiHelpers/common/firestoreDatabase'
import { hexToPublicKey, verifySignature } from '../src/commonInterface/crypto/signatures'
import { isNodeId, isSignature, nodeIdToPublicKeyHex } from '../src/commonInterface/kacheryTypes'
import { isClient } from '../src/types/Client'
import { isProject } from '../src/types/Project'
import { isProjectMembership } from '../src/types/ProjectMembership'

const MAX_UPLOAD_SIZE = 50 * 1000 * 1000

module.exports = (req: VercelRequest, res: VercelResponse) => {
    ;(async () => {
        const clientId = req.headers['kachery-cloud-client-id']
        const clientSignature = req.headers['kachery-cloud-client-signature']
        if (!clientId) throw Error('Missing header kachery-cloud-client-id')
        if (!clientSignature) throw Error('Missing header kachery-cloud-client-signature')
        if (!isNodeId(clientId)) throw Error('Invalid client ID header')
        if (!isSignature(clientSignature)) throw Error('Invalid signature header')
        const doc = {'type': 'uploadToIpfs'}
        const okay = await verifySignature(doc, hexToPublicKey(nodeIdToPublicKeyHex(clientId)), clientSignature)
        if (!okay) {
            throw Error('Invalid signature for IPFS upload')
        }

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

        const url = 'https://api.web3.storage/upload'
        const token = process.env['WEB3_STORAGE_TOKEN']
        if (!token) {
            throw Error('Environment variable not set: WEB3_STORAGE_TOKEN')
        }
        const headers = {
            'Authorization': `Bearer ${token}`
        }
        const contentLength = parseInt(req.headers['content-length'])
        if (contentLength > MAX_UPLOAD_SIZE) {
            res.status(413).send(`File too large: ${contentLength} > ${MAX_UPLOAD_SIZE}`)
            return
        }

        const timer = Date.now()
        const resp = await axios.post(url, req, {headers})
        if (resp.status !== 200) {
            res.status(resp.status).send(resp.data)
            return
        }
        const cid = resp.data['cid']

        const elapsed = Date.now() - timer

        const usageLogCollection = db.collection('kacherycloud.usageLog')
        usageLogCollection.add({
            type: 'ipfsUpload',
            clientId: client.clientId,
            projectId,
            userId,
            size: contentLength,
            timestamp: Date.now(),
            elapsed
        })

        return {cid}
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        res.status(500).send(`Error: ${error.message}`)
    })
}