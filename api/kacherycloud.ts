import { VercelRequest, VercelResponse } from '@vercel/node'
import getClientInfoHandler from '../apiHelpers/kacheryhubRequestHandlers/getClientInfoHandler'
import { hexToPublicKey, verifySignature } from '../src/commonInterface/crypto/signatures'
import { JSONValue, nodeIdToPublicKeyHex } from '../src/commonInterface/kacheryTypes'
import { isKacherycloudRequest } from '../src/types/KacherycloudRequest'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req

    if (!isKacherycloudRequest(request)) {
        throw Error('Invalid kacherycloud request')
    }

    ;(async () => {
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

        if (payload.type === 'getClientInfo') {
            return await getClientInfoHandler(request, verifiedClientId)
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