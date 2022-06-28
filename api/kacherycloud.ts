import { VercelRequest, VercelResponse } from '@vercel/node'
import accessGroupDecryptHandler from '../apiHelpers/kacherycloudRequestHandlers/accessGroupDecryptHandler'
import accessGroupEncryptHandler from '../apiHelpers/kacherycloudRequestHandlers/accessGroupEncryptHandler'
import appendFeedMessagesHandler from '../apiHelpers/kacherycloudRequestHandlers/appendFeedMessagesHandler'
import createFeedHandler from '../apiHelpers/kacherycloudRequestHandlers/createFeedHandler'
import finalizeFileUploadHandler from '../apiHelpers/kacherycloudRequestHandlers/finalizeFileUploadHandler'
import finalizeIpfsUploadHandler from '../apiHelpers/kacherycloudRequestHandlers/finalizeIpfsUploadHandler'
import finalizeTaskResultUploadHandler from '../apiHelpers/kacherycloudRequestHandlers/finalizeTaskResultUploadHandler'
import findFileHandler from '../apiHelpers/kacherycloudRequestHandlers/findFileHandler'
import findIpfsFileHandler from '../apiHelpers/kacherycloudRequestHandlers/findIpfsFileHandler'
import getClientInfoHandler from '../apiHelpers/kacherycloudRequestHandlers/getClientInfoHandler'
import getFeedInfoHandler from '../apiHelpers/kacherycloudRequestHandlers/getFeedInfoHandler'
import getFeedMessagesHandler from '../apiHelpers/kacherycloudRequestHandlers/getFeedMessagesHandler'
import getMutableHandler from '../apiHelpers/kacherycloudRequestHandlers/getMutableHandler'
import getProjectBucketBaseUrlHandler from '../apiHelpers/kacherycloudRequestHandlers/getProjectBucketBaseUrlHandler'
import initiateFileUploadHandler from '../apiHelpers/kacherycloudRequestHandlers/initiateFileUploadHandler'
import initiateIpfsUploadHandler from '../apiHelpers/kacherycloudRequestHandlers/initiateIpfsUploadHandler'
import initiateTaskResultUploadHandler from '../apiHelpers/kacherycloudRequestHandlers/initiateTaskResultUploadHandler'
import publishToPubsubChannelHandler from '../apiHelpers/kacherycloudRequestHandlers/publishToPubsubChannelHandler'
import setMutableHandler from '../apiHelpers/kacherycloudRequestHandlers/setMutableHandler'
import subscribeToPubsubChannelHandler from '../apiHelpers/kacherycloudRequestHandlers/subscribeToPubsubChannelHandler'
import { hexToPublicKey, verifySignature } from '../src/commonInterface/crypto/signatures'
import { JSONValue, NodeId, nodeIdToPublicKeyHex } from '../src/commonInterface/kacheryTypes'
import { isAccessGroupDecryptRequest, isAccessGroupEncryptRequest, isAppendFeedMessagesRequest, isCreateFeedRequest, isFinalizeFileUploadRequest, isFinalizeIpfsUploadRequest, isFinalizeTaskResultUploadRequest, isFindFileRequest, isFindIpfsFileRequest, isGetClientInfoRequest, isGetFeedInfoRequest, isGetFeedMessagesRequest, isGetMutableRequest, isGetProjectBucketBaseUrlRequest, isInitiateFileUploadRequest, isInitiateIpfsUploadRequest, isInitiateTaskResultUploadRequest, isKacherycloudRequest, isPublishToPubsubChannelRequest, isSetMutableRequest, isSubscribeToPubsubChannelRequest } from '../src/types/KacherycloudRequest'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req

    // CORS ///////////////////////////////////
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    if ([
        'http://localhost:3000',
        'http://localhost:3001',
        'https://figurl.org',
        'https://v2.figurl.org',
        'https://www.figurl.org'
    ].includes(req.headers.origin || '')) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '')
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
        if (fromClientId) {
            if (!signature) {
                throw Error('Missing signature')
            }
            if (!(await verifySignature(payload as any as JSONValue, hexToPublicKey(nodeIdToPublicKeyHex(fromClientId)), signature))) {
                throw Error('Invalid signature')
            }
        }
        const verifiedClientId: NodeId | undefined = fromClientId

        if (isGetClientInfoRequest(request)) {
            return await getClientInfoHandler(request, verifiedClientId)
        }
        else if (isGetProjectBucketBaseUrlRequest(request)) {
            return await getProjectBucketBaseUrlHandler(request, verifiedClientId)
        }
        else if (isAccessGroupEncryptRequest(request)) {
            return await accessGroupEncryptHandler(request, verifiedClientId)
        }
        else if (isAccessGroupDecryptRequest(request)) {
            return await accessGroupDecryptHandler(request, verifiedClientId)
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
        else if (isInitiateFileUploadRequest(request)) {
            return await initiateFileUploadHandler(request, verifiedClientId)
        }
        else if (isFinalizeFileUploadRequest(request)) {
            return await finalizeFileUploadHandler(request, verifiedClientId)
        }
        else if (isFindFileRequest(request)) {
            return await findFileHandler(request, verifiedClientId)
        }
        else if (isSetMutableRequest(request)) {
            return await setMutableHandler(request, verifiedClientId)
        }
        else if (isGetMutableRequest(request)) {
            return await getMutableHandler(request, verifiedClientId)
        }
        else if (isInitiateTaskResultUploadRequest(request)) {
            return await initiateTaskResultUploadHandler(request, verifiedClientId)
        }
        else if (isFinalizeTaskResultUploadRequest(request)) {
            return await finalizeTaskResultUploadHandler(request, verifiedClientId)
        }
        else if (isSubscribeToPubsubChannelRequest(request)) {
            return await subscribeToPubsubChannelHandler(request, verifiedClientId)
        }
        else if (isPublishToPubsubChannelRequest(request)) {
            return await publishToPubsubChannelHandler(request, verifiedClientId)
        }
        else if (isCreateFeedRequest(request)) {
            return await createFeedHandler(request, verifiedClientId)
        }
        else if (isGetFeedInfoRequest(request)) {
            return await getFeedInfoHandler(request, verifiedClientId)
        }
        else if (isAppendFeedMessagesRequest(request)) {
            return await appendFeedMessagesHandler(request, verifiedClientId)
        }
        else if (isGetFeedMessagesRequest(request)) {
            return await getFeedMessagesHandler(request, verifiedClientId)
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