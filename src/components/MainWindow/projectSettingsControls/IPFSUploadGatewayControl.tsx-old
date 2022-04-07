import React, { FunctionComponent, useCallback } from 'react';
import { ProjectSettings } from 'types/Project';
import EditableTextField from '../EditableTextField';

type Props = {
    projectId: string
    projectSettings: ProjectSettings
    setProjectSettings?: (o: {projectId: string, projectSettings: ProjectSettings}) => void
}

const IPFSUploadGatewayControl: FunctionComponent<Props> = ({projectId, projectSettings, setProjectSettings}) => {
    const handleChange = useCallback((x: string) => {
        if (!setProjectSettings) return
        const newSettings: ProjectSettings = {
            ...projectSettings,
            ipfsUploadGateway: x ? {
                hostName: x || '',
                authenticationToken: (projectSettings.ipfsUploadGateway || {}).authenticationToken
            } : undefined
        }
        setProjectSettings({projectId, projectSettings: newSettings})
    }, [projectId, projectSettings, setProjectSettings])
    const handleChangeAuth = useCallback((x: string) => {
        if (!setProjectSettings) return
        const newSettings: ProjectSettings = {
            ...projectSettings,
            ipfsUploadGateway: {
                ...(projectSettings.ipfsUploadGateway || {hostName: ''}),
                authenticationToken: x ? x : undefined
            }
        }
        setProjectSettings({projectId, projectSettings: newSettings})
    }, [projectId, projectSettings, setProjectSettings])
    const authToken = projectSettings.ipfsUploadGateway?.authenticationToken
    return (
        <div>
            <span style={{color: 'blue'}}>Hostname:</span>
            <EditableTextField
                value={projectSettings.ipfsUploadGateway?.hostName || ''}
                onChange={handleChange}
            /><br />
            <span style={{color: 'blue'}}>Authentication token:</span>
            <EditableTextField
                value={authToken === null ? '*hidden*' : authToken || ''}
                clearOnEdit={true}
                onChange={handleChangeAuth}
            /><br />
        </div>
    )
}

export default IPFSUploadGatewayControl