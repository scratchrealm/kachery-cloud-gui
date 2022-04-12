import axios from "axios"
import { KacherycloudRequest, KacherycloudResponse } from "types/KacherycloudRequest"

const kacherycloudApiRequest = async (request: KacherycloudRequest): Promise<KacherycloudResponse> => {
    const x = await axios.post('/api/kacherycloud', request)
    return x.data
}

export default kacherycloudApiRequest