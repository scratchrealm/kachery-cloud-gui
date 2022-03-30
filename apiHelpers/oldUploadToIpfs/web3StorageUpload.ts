import { VercelRequest } from "@vercel/node";
import axios from "axios";

const web3StorageUpload = async (req: VercelRequest) => {
    const url = 'https://api.web3.storage/upload'
    const token = process.env['WEB3_STORAGE_TOKEN']
    if (!token) {
        throw Error('Environment variable not set: WEB3_STORAGE_TOKEN')
    }
    const headers = {
        'Authorization': `Bearer ${token}`
    }

    const timer = Date.now()
    const resp = await axios.post(url, req, {headers})
    if (resp.status !== 200) {
        throw Error(`Error posting to web3.storage (${resp.status}): ${resp.data}`)
    }
    const cid = resp.data['cid']
    const elapsed = Date.now() - timer

    return {cid, elapsed}
}

export default web3StorageUpload