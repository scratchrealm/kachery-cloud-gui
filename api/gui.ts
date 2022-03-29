import { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import googleVerifyIdToken from '../apiHelpers/common/googleVerifyIdToken'
import addProjectHandler from '../apiHelpers/guiRequestHandlers/addProjectHandler'
import addProjectMembershipHandler from '../apiHelpers/guiRequestHandlers/addProjectMembershipHandler'
import deleteProjectHandler from '../apiHelpers/guiRequestHandlers/deleteProjectHandler'
import deleteProjectMembershipHandler from '../apiHelpers/guiRequestHandlers/deleteProjectMembershipHandler'
import deleteClientHandler from '../apiHelpers/guiRequestHandlers/deleteClientHandler'
import getProjectsHandler from '../apiHelpers/guiRequestHandlers/getProjectsHandler'
import getClientsHandler from '../apiHelpers/guiRequestHandlers/getClientsHandler'
import addClientHandler from '../apiHelpers/guiRequestHandlers/addClientHandler'
import setProjectSettingsHandler from '../apiHelpers/guiRequestHandlers/setProjectSettingsHandler'
import { UserId } from '../src/commonInterface/kacheryTypes'
import { isGuiRequest } from '../src/types/GuiRequest'
import getProjectMembershipsHandler from '../apiHelpers/guiRequestHandlers/getProjectMembershipsHandler'
import setProjectMembershipPermissionsHandler from '../apiHelpers/guiRequestHandlers/setProjectMembershipPermissionsHandler'
import getUserSettingsHandler from '../apiHelpers/guiRequestHandlers/getUserSettingsHandler'
import setUserSettingsHandler from '../apiHelpers/guiRequestHandlers/setUserSettingsHandler'
import setClientInfoHandler from '../apiHelpers/guiRequestHandlers/setClientInfoHandler'
import setProjectInfoHandler from '../apiHelpers/guiRequestHandlers/setProjectInfoHandler'

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

const verifyReCaptcha = async (token: string | undefined) => {
    if (!RECAPTCHA_SECRET_KEY) return undefined
    if (!token) return undefined

    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`
    const x = await axios.post(url)
    return x.data
}

export type VerifiedReCaptchaInfo = {
    success: boolean,
    challenge_ts: string,
    hostname: string,
    score: number,
    action: string
}

module.exports = (req: VercelRequest, res: VercelResponse) => {    
    const {body: request} = req
    if (!isGuiRequest(request)) {
        res.status(400).send(`Invalid request: ${JSON.stringify(request)}`)
        return
    }

    const auth = request.auth
    const {userId, googleIdToken, reCaptchaToken} = auth
    if ((userId) && (!googleIdToken)) throw Error('No google id token')

    ;(async () => {
        const verifiedUserId = userId ? await googleVerifyIdToken(userId.toString(), googleIdToken) as any as UserId : undefined
        const verifiedReCaptchaInfo: VerifiedReCaptchaInfo | undefined = await verifyReCaptcha(reCaptchaToken)
        if (verifiedReCaptchaInfo) {
            if (!verifiedReCaptchaInfo.success) {
                throw Error('Error verifying reCaptcha token')
            }
            if (verifiedReCaptchaInfo.score < 0.4) {
                throw Error(`reCaptcha score is too low: ${verifiedReCaptchaInfo.score}`)
            }
        }
        if (request.type === 'addProject') {
            if (!verifiedReCaptchaInfo) {
                throw Error('ReCaptcha required')
            }
            return await addProjectHandler(request, verifiedUserId)
        }
        else if (request.type === 'getProjectMemberships') {
            // no recaptcha required
            return await getProjectMembershipsHandler(request, verifiedUserId)
        }
        else if (request.type === 'addProjectMembership') {
            if (!verifiedReCaptchaInfo) {
                throw Error('ReCaptcha required')
            }
            return await addProjectMembershipHandler(request, verifiedUserId)
        }
        else if (request.type === 'deleteProject') {
            if (!verifiedReCaptchaInfo) {
                throw Error('ReCaptcha required')
            }
            return await deleteProjectHandler(request, verifiedUserId)
        }
        else if (request.type === 'deleteProjectMembership') {
            if (!verifiedReCaptchaInfo) {
                throw Error('ReCaptcha required')
            }
            return await deleteProjectMembershipHandler(request, verifiedUserId)
        }
        else if (request.type === 'getProjects') {
            // no recaptcha required
            return await getProjectsHandler(request, verifiedUserId)
        }
        else if (request.type === 'setProjectSettings') {
            if (!verifiedReCaptchaInfo) {
                throw Error('ReCaptcha required')
            }
            return await setProjectSettingsHandler(request, verifiedUserId)
        }
        else if (request.type === 'addClient') {
            if (!verifiedReCaptchaInfo) {
                throw Error('ReCaptcha required')
            }
            return await addClientHandler(request, verifiedUserId)
        }
        else if (request.type === 'deleteClient') {
            if (!verifiedReCaptchaInfo) {
                throw Error('ReCaptcha required')
            }
            return await deleteClientHandler(request, verifiedUserId)
        }
        else if (request.type === 'getClients') {
            // no recaptcha required
            return await getClientsHandler(request, verifiedUserId)
        }
        else if (request.type === 'setProjectMembershipPermissions') {
            if (!verifiedReCaptchaInfo) {
                throw Error('ReCaptcha required')
            }
            return await setProjectMembershipPermissionsHandler(request, verifiedUserId)
        }
        else if (request.type === 'getUserSettings') {
            // no recaptcha required
            return await getUserSettingsHandler(request, verifiedUserId)
        }
        else if (request.type === 'setUserSettings') {
            if (!verifiedReCaptchaInfo) {
                throw Error('ReCaptcha required')
            }
            return await setUserSettingsHandler(request, verifiedUserId)
        }
        else if (request.type === 'setClientInfo') {
            if (!verifiedReCaptchaInfo) {
                throw Error('ReCaptcha required')
            }
            return await setClientInfoHandler(request, verifiedUserId)
        }
        else if (request.type === 'setProjectInfo') {
            if (!verifiedReCaptchaInfo) {
                throw Error('ReCaptcha required')
            }
            return await setProjectInfoHandler(request, verifiedUserId)
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