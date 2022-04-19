import guiApiRequest from "common/guiApiRequest"
import { UserId } from "commonInterface/kacheryTypes"
import { useSignedIn } from "components/googleSignIn/GoogleSignIn"
import useErrorMessage from "errorMessageContext/useErrorMessage"
import { useCallback, useEffect, useState } from "react"
import { AddProjectMembershipRequest, DeleteProjectMembershipRequest, GetProjectRequest, isAddProjectMembershipResponse, isDeleteProjectMembershipResponse, isGetProjectResponse, isSetProjectMembershipPermissionsResponse, isSetProjectSettingsResponse, SetProjectMembershipPermissionsRequest, SetProjectSettingsRequest } from "types/GuiRequest"
import { Project, ProjectSettings } from "types/Project"
import { ProjectMembership, ProjectMembershipPermissions } from "types/ProjectMembership"
import { ProjectUsage } from "types/ProjectUsage"

const useProject = (projectId: string) => {
    const [project, setProject] = useState<Project | undefined>(undefined)
    const [projectUsage, setProjectUsage] = useState<ProjectUsage | undefined>(undefined)
    const [projectMemberships, setProjectMemberships] = useState<ProjectMembership[] | undefined>(undefined)
    const { userId, googleIdToken } = useSignedIn()
    const {setErrorMessage} = useErrorMessage()

    const [refreshCode, setRefreshCode] = useState<number>(0)
    const refresh = useCallback(() => {
        setRefreshCode(c => (c + 1))
    }, [])

    useEffect(() => {
        ; (async () => {
            setErrorMessage('')
            setProject(undefined)
            setProjectUsage(undefined)
            setProjectMemberships(undefined)
            if (!userId) return
            let canceled = false
            const req: GetProjectRequest = {
                type: 'getProject',
                projectId,
                auth: { userId, googleIdToken }
            }
            const resp = await guiApiRequest(req, { reCaptcha: false, setErrorMessage })
            if (!resp) return
            if (!isGetProjectResponse(resp)) {
                console.warn(resp)
                throw Error('Unexpected response')
            }
            console.log(resp)
            if (canceled) return
            setProject(resp.project)
            setProjectUsage(resp.projectUsage)
            setProjectMemberships(resp.projectMemberships)
            return () => { canceled = true }
        })()
    }, [userId, googleIdToken, projectId, setErrorMessage, refreshCode])

    const addProjectMembership = useCallback((memberId: UserId) => {
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
                refresh()
            })()
    }, [projectId, userId, googleIdToken, refresh, setErrorMessage])

    const deleteProjectMembership = useCallback((memberId: UserId) => {
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
                refresh()
            })()
    }, [projectId, userId, googleIdToken, refresh, setErrorMessage])

    const setProjectMembershipPermissions = useCallback((o: {memberId: UserId, projectMembershipPermissions: ProjectMembershipPermissions}) => {
        const {memberId, projectMembershipPermissions} = o
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
                refresh()
            })()
    }, [projectId, userId, googleIdToken, refresh, setErrorMessage])

    const setProjectSettings = useCallback((o: {projectSettings: ProjectSettings}) => {
        const {projectSettings} = o
        if (!userId) return
            ; (async () => {
                const req: SetProjectSettingsRequest = {
                    type: 'setProjectSettings',
                    projectId,
                    projectSettings,
                    auth: { userId, googleIdToken }
                }
                const resp = await guiApiRequest(req, { reCaptcha: true, setErrorMessage })
                if (!resp) return
                if (!isSetProjectSettingsResponse(resp)) {
                    throw Error('Unexpected response')
                }
                refresh()
            })()
    }, [projectId, userId, googleIdToken, refresh, setErrorMessage])

    return { project, projectUsage, projectMemberships, addProjectMembership, deleteProjectMembership, setProjectMembershipPermissions, setProjectSettings, refreshProject: refresh }
}

export default useProject