import { VercelRequest, VercelResponse } from '@vercel/node'
import finalizeIpfsUploadHandler from '../apiHelpers/kacherycloudRequestHandlers/finalizeIpfsUploadHandler'
import getClientInfoHandler from '../apiHelpers/kacherycloudRequestHandlers/getClientInfoHandler'
import initiateIpfsUploadHandler from '../apiHelpers/kacherycloudRequestHandlers/initiateIpfsUploadHandler'
import { hexToPublicKey, verifySignature } from '../src/commonInterface/crypto/signatures'
import { JSONValue, nodeIdToPublicKeyHex } from '../src/commonInterface/kacheryTypes'
import { isFinalizeIpfsUploadRequest, isGetClientInfoRequest, isInitiateIpfsUploadRequest, isKacherycloudRequest } from '../src/types/KacherycloudRequest'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req

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
        if (!await verifySignature(payload as any as JSONValue, hexToPublicKey(nodeIdToPublicKeyHex(fromClientId)), signature)) {
            throw Error('Invalid signature')
        }
        const verifiedClientId = fromClientId

        if (isGetClientInfoRequest(request)) {
            return await getClientInfoHandler(request, verifiedClientId)
        }
        else if (isInitiateIpfsUploadRequest(request)) {
            return await initiateIpfsUploadHandler(request, verifiedClientId)
        }
        else if (isFinalizeIpfsUploadRequest(request)) {
            return await finalizeIpfsUploadHandler(request, verifiedClientId)
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