import { VercelRequest, VercelResponse } from '@vercel/node'
import timingHandler from '../apiHelpers/timingHandlers/timingHandler'
import { isTimingRequest } from '../src/types/TimingRequest'

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isTimingRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    ;(async () => {
        if (request.type === 'timing') {
            return await timingHandler(request)
        }
        else {
            throw Error(`Unexpected request type: ${request.type}`)
        }
    })().then((result) => {
        res.json(result)
    }).catch((error: Error) => {
        console.warn(error.message)
        res.status(500).send(`Error: ${error.message}`)
    })
}