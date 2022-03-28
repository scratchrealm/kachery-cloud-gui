import guiApiRequest from "common/guiApiRequest"
import { UserId } from "commonInterface/kacheryTypes"
import { useSignedIn } from "components/googleSignIn/GoogleSignIn"
import useErrorMessage from "errorMessageContext/useErrorMessage"
import { useCallback, useEffect, useState } from "react"
import { ProjectMembership, ProjectMembershipPermissions } from "types/ProjectMembership"
import { AddProjectMembershipRequest, DeleteProjectMembershipRequest, GetProjectMembershipsRequest, isAddProjectMembershipResponse, isDeleteProjectMembershipResponse, isGetProjectMembershipsResponse, isSetProjectMembershipPermissionsResponse, SetProjectMembershipPermissionsRequest } from "types/GuiRequest"

const useProjectMemberships = () => {
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
            const req: GetProjectMembershipsRequest = {
                type: 'getProjectMemberships',
                userId,
                auth: { userId, googleIdToken }
            }
            const resp = await guiApiRequest(req, { reCaptcha: false, setErrorMessage })
            if (!resp) return
            if (!isGetProjectMembershipsResponse(resp)) {
                console.warn(resp)
                throw Error('Unexpected response')
            }
            if (canceled) return
            setProjectMemberships(resp.projectMemberships)
            return () => { canceled = true }
        })()
    }, [userId, googleIdToken, refreshCode, setErrorMessage])

    const addProjectMembership = useCallback((projectId: string, memberId: UserId) => {
        if (!userId) return
            ; (async () => {
                const req: AddProjectMembershipRequest = {
                    type: 'addProjectMembership',
                    projectId,
                    memberId,
                    auth: { userId, googleIdToken }
                }
                const resp = await guiApiRequest(req, { reCaptcha: true, setErrorMessage })
                if (!resp) return
                if (!isAddProjectMembershipResponse(resp)) {
                    throw Error('Unexpected response')
                }
                refreshProjectMemberships()
            })()
    }, [userId, googleIdToken, refreshProjectMemberships, setErrorMessage])

    const deleteProjectMembership = useCallback((projectId: string, memberId: UserId) => {
        if (!userId) return
            ; (async () => {
                const req: DeleteProjectMembershipRequest = {
                    type: 'deleteProjectMembership',
                    projectId,
                    memberId,
                    auth: { userId, googleIdToken }
                }
                const resp = await guiApiRequest(req, { reCaptcha: true, setErrorMessage })
                if (!resp) return
                if (!isDeleteProjectMembershipResponse(resp)) {
                    throw Error('Unexpected response')
                }
                refreshProjectMemberships()
            })()
    }, [userId, googleIdToken, refreshProjectMemberships, setErrorMessage])

    const setProjectMembershipPermissions = useCallback((o: {projectId: string, memberId: UserId, projectMembershipPermissions: ProjectMembershipPermissions}) => {
        const {projectId, memberId, projectMembershipPermissions} = o
        if (!userId) return
            ; (async () => {
                const req: SetProjectMembershipPermissionsRequest = {
                    type: 'setProjectMembershipPermissions',
                    projectId,
                    memberId,
                    projectMembershipPermissions,
                    auth: { userId, googleIdToken }
                }
                const resp = await guiApiRequest(req, { reCaptcha: true, setErrorMessage })
                if (!resp) return
                if (!isSetProjectMembershipPermissionsResponse(resp)) {
                    throw Error('Unexpected response')
                }
                refreshProjectMemberships()
            })()
    }, [userId, googleIdToken, refreshProjectMemberships, setErrorMessage])

    return { projectMemberships, refreshProjectMemberships, addProjectMembership, deleteProjectMembership, setProjectMembershipPermissions }
}

export default useProjectMemberships