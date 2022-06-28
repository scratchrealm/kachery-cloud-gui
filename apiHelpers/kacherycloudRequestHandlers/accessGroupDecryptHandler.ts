import crypto from 'crypto';
import { NodeId } from "../../src/commonInterface/kacheryTypes";
import { AccessGroupDecryptRequest, AccessGroupDecryptResponse } from "../../src/types/KacherycloudRequest";
import { getAccessGroup, getClient } from "../common/getDatabaseItems";

const accessGroupDecryptHandler = async (request: AccessGroupDecryptRequest, verifiedClientId?: NodeId): Promise<AccessGroupDecryptResponse> => {
    const { accessGroupId, encryptedText } = request.payload
    if (encryptedText.length > 5000) throw Error(`Encrypted text string too long ${encryptedText.length} > 5000`)

    const accessGroup = await getAccessGroup(accessGroupId)
    const client = verifiedClientId ? await getClient(verifiedClientId) : undefined
    if (!accessGroup.publicRead) {
        if (!client) throw Error('Not authorized to read in this access group (no client)')
        const user = accessGroup.users.filter(u => (u.userId === client.ownerId.toString()))[0]
        if ((!user) || (!user.read)) {
            throw Error('Not authorized to read in this access group')
        }
    }

    const key = Buffer.from(accessGroup.keyHex, 'hex')
    const iv = Buffer.from(accessGroup.ivHex, 'hex')

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    const decryptedText = decrypted.toString()

    return {
        type: 'accessGroupDecrypt',
        decryptedText
    }
}

export default accessGroupDecryptHandler