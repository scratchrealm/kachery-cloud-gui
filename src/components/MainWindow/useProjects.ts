import guiApiRequest from "common/guiApiRequest"
import { useSignedIn } from "components/googleSignIn/GoogleSignIn"
import useErrorMessage from "errorMessageContext/useErrorMessage"
import { useCallback, useEffect, useState } from "react"
import { Project, ProjectSettings } from "types/Project"
import { AddProjectRequest, DeleteProjectRequest, GetProjectsRequest, isAddProjectResponse, isDeleteProjectResponse, isGetProjectsResponse, isSetProjectSettingsResponse, SetProjectSettingsRequest } from "types/GuiRequest"

const useProjects = () => {
    const [projects, setProjects] = useState<Project[] | undefined>(undefined)
    const { userId, googleIdToken } = useSignedIn()
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const refreshProjects = useCallback(() => {
        setRefreshCode(c => (c + 1))
    }, [])
    const {setErrorMessage} = useErrorMessage()

    useEffect(() => {
        ; (async () => {
            setErrorMessage('')
            setProjects(undefined)
            if (!userId) return
            let canceled = false
            const req: GetProjectsRequest = {
                type: 'getProjects',
                userId,
                auth: { userId, googleIdToken }
            }
            const resp = await guiApiRequest(req, { reCaptcha: false, setErrorMessage })
            if (!resp) return
            if (!isGetProjectsResponse(resp)) {
                console.warn(resp)
                throw Error('Unexpected response')
            }
            console.log(resp)
            if (canceled) return
            setProjects(resp.projects)
            return () => { canceled = true }
        })()
    }, [userId, googleIdToken, refreshCode, setErrorMessage])

    const addProject = useCallback((projectName: string) => {
        if (!userId) return
            ; (async () => {
                const req: AddProjectRequest = {
                    type: 'addProject',
                    projectName,
                    ownerId: userId,
                    auth: { userId, googleIdToken }
                }
                const resp = await guiApiRequest(req, { reCaptcha: true, setErrorMessage })
                if (!resp) return
                if (!isAddProjectResponse(resp)) {
                    throw Error('Unexpected response')
                }
                refreshProjects()
            })()
    }, [userId, googleIdToken, refreshProjects, setErrorMessage])

    const deleteProject = useCallback((projectId: string) => {
        if (!userId) return
            ; (async () => {
                const req: DeleteProjectRequest = {
                    type: 'deleteProject',
                    projectId,
                    auth: { userId, googleIdToken }
                }
                const resp = await guiApiRequest(req, { reCaptcha: true, setErrorMessage })
                if (!resp) return
                if (!isDeleteProjectResponse(resp)) {
                    throw Error('Unexpected response')
                }
                refreshProjects()
            })()
    }, [userId, googleIdToken, refreshProjects, setErrorMessage])

    const setProjectSettings = useCallback((o: {projectId: string, projectSettings: ProjectSettings}) => {
        const {projectId, projectSettings} = o
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
                refreshProjects()
            })()
    }, [userId, googleIdToken, refreshProjects, setErrorMessage])

    return { projects, refreshProjects, addProject, deleteProject, setProjectSettings }
}

export default useProjects