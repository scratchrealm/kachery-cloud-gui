import crypto from 'crypto';
import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { AccessGroupEncryptRequest, AccessGroupEncryptResponse } from "../../src/types/KacherycloudRequest";
import { getAccessGroup, getClient } from "../common/getDatabaseItems";

const accessGroupEncryptHandler = async (request: AccessGroupEncryptRequest, verifiedClientId?: NodeId): Promise<AccessGroupEncryptResponse> => {
    const { accessGroupId, text } = request.payload
    if (text.length > 500) throw Error(`Text string too long ${text.length} > 500`)

    const accessGroup = await getAccessGroup(accessGroupId)
    const client = verifiedClientId ? await getClient(verifiedClientId) : undefined
    if (!accessGroup.publicWrite) {
        if (!client) throw Error('Not authorized to write to this access group (no client)')
        if (!accessGroup.users.map(u => (u.userId)).includes(client.ownerId.toString())) {
            throw Error('Not authorized to write to this access group')
        }
    }

    const key = Buffer.from(accessGroup.keyHex, 'hex')
    const iv = Buffer.from(accessGroup.ivHex, 'hex')
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
    let encrypted = cipher.update(Buffer.from(text))
    encrypted = Buffer.concat([encrypted, cipher.final()])
    const encryptedText = encrypted.toString('hex')

    return {
        type: 'accessGroupEncrypt',
        encryptedText
    }
}

export default accessGroupEncryptHandler