import { VercelRequest } from "@vercel/node";
import axios from "axios";
import FormData from "form-data";

const pinataUpload = async (req: VercelRequest) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    //we gather a local file for this example, but any valid readStream source will work here.
    let data = new FormData()
    // This hack is is needed for pinata because: https://github.com/PinataCloud/Pinata-SDK/issues/28#issuecomment-816439078
    req['path'] = 'file.dat'
    data.append('file', req)

    const headers = {
        'Content-Type': `multipart/form-data; boundary=${data['_boundary']}`,
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
    }
    const timer = Date.now()
    const resp = await axios.post(url, data, {
        'maxBodyLength': 'Infinity' as any, //this is needed to prevent axios from erroring out with large files
        headers
    })
    if (resp.status !== 200) {
        throw Error(`Error posting to pinata (${resp.status}): ${resp.data}`)
    }
    const cid = resp.data['IpfsHash']
    const elapsed = Date.now() - timer

    return {cid, elapsed}
}

export default pinataUpload