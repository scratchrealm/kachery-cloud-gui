import guiApiRequest from "common/guiApiRequest"
import { useSignedIn } from "components/googleSignIn/GoogleSignIn"
import useErrorMessage from "errorMessageContext/useErrorMessage"
import { useCallback, useEffect, useState } from "react"
import { GetProjectMembershipsForUserRequest, isGetProjectMembershipsForUserResponse } from "types/GuiRequest"
import { ProjectMembership } from "types/ProjectMembership"

const useProjectMembershipsForUser = () => {
    const [projectMemberships, setProjectMemberships] = useState<ProjectMembership[] | undefined>(undefined)
    const { userId, googleIdToken } = useSignedIn()
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const refreshProjectMemberships = useCallback(() => {
        setRefreshCode(c => (c + 1))
    }, [])
    const {setErrorMessage} = useErrorMessage()

    useEffect(() => {
        ; (async () => {
            setErrorMessage('')
            setProjectMemberships(undefined)
            if (!userId) return
            let canceled = false
            const req: GetProjectMembershipsForUserRequest = {
                type: 'getProjectMembershipsForUser',
                userId,
                auth: { userId, googleIdToken }
            }
            const resp = await guiApiRequest(req, { reCaptcha: false, setErrorMessage })
            if (!resp) return
            if (!isGetProjectMembershipsForUserResponse(resp)) {
                console.warn(resp)
                throw Error('Unexpected response')
            }
            if (canceled) return
            setProjectMemberships(resp.projectMemberships)
            return () => { canceled = true }
        })()
    }, [userId, googleIdToken, refreshCode, setErrorMessage])

    return { projectMemberships, refreshProjectMemberships }
}

export default useProjectMembershipsForUser