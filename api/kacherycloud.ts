import { VercelRequest, VercelResponse } from '@vercel/node'
import finalizeIpfsUploadHandler from '../apiHelpers/kacherycloudRequestHandlers/finalizeIpfsUploadHandler'
import findIpfsFileHandler from '../apiHelpers/kacherycloudRequestHandlers/findIpfsFileHandler'
import getClientInfoHandler from '../apiHelpers/kacherycloudRequestHandlers/getClientInfoHandler'
import initiateIpfsUploadHandler from '../apiHelpers/kacherycloudRequestHandlers/initiateIpfsUploadHandler'
import { hexToPublicKey, verifySignature } from '../src/commonInterface/crypto/signatures'
import { JSONValue, NodeId, nodeIdToPublicKeyHex } from '../src/commonInterface/kacheryTypes'
import { isFinalizeIpfsUploadRequest, isFindIpfsFileRequest, isGetClientInfoRequest, isInitiateIpfsUploadRequest, isKacherycloudRequest } from '../src/types/KacherycloudRequest'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req

    // CORS ///////////////////////////////////
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    if ([
        'http://localhost:3000',
        'http://localhost:3001',
        'https://figurl.org',
        'https://www.figurl.org'
    ].includes(req.headers.origin)) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }
    ///////////////////////////////////////////

    ;(async () => {
        if (!isKacherycloudRequest(request)) {
            throw Error('Invalid kacherycloud request')
        }

        const { payload, fromClientId, signature } = request
        const { timestamp } = payload
        const elapsed = Date.now() - timestamp
        if ((elapsed > 30000) || (elapsed < -500)) {
            throw Error(`Invalid timestamp. ${timestamp} ${Date.now()} ${elapsed}`)
        }
        if ((fromClientId) && (!await verifySignature(payload as any as JSONValue, hexToPublicKey(nodeIdToPublicKeyHex(fromClientId)), signature))) {
            throw Error('Invalid signature')
        }
        const verifiedClientId: NodeId | undefined = fromClientId

        if (isGetClientInfoRequest(request)) {
            return await getClientInfoHandler(request, verifiedClientId)
        }
        else if (isInitiateIpfsUploadRequest(request)) {
            return await initiateIpfsUploadHandler(request, verifiedClientId)
        }
        else if (isFinalizeIpfsUploadRequest(request)) {
            return await finalizeIpfsUploadHandler(request, verifiedClientId)
        }
        else if (isFindIpfsFileRequest(request)) {
            return await findIpfsFileHandler(request, verifiedClientId)
        }
        else {
            throw Error(`Unexpected request type: ${payload.type}`)
        }
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        res.status(500).send(`Error: ${error.message}`)
    })
}