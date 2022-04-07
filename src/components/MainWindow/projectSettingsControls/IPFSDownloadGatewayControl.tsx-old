import React, { FunctionComponent, useCallback } from 'react';
import { ProjectSettings } from 'types/Project';
import EditableTextField from '../EditableTextField';

type Props = {
    projectId: string
    projectSettings: ProjectSettings
    setProjectSettings?: (o: {projectId: string, projectSettings: ProjectSettings}) => void
}

const IPFSDownloadGatewayControl: FunctionComponent<Props> = ({projectId, projectSettings, setProjectSettings}) => {
    const handleChange = useCallback((x: string) => {
        if (!setProjectSettings) return
        const newSettings: ProjectSettings = {
            ...projectSettings,
            ipfsDownloadGateway: x ? {
                ...(projectSettings.ipfsDownloadGateway || {}),
                hostName: x || ''
            } : undefined
        }
        setProjectSettings({projectId, projectSettings: newSettings})
    }, [projectId, projectSettings, setProjectSettings])
    return (
        <div>
            <span style={{color: 'blue'}}>Hostname:</span>
            <EditableTextField
                value={projectSettings.ipfsDownloadGateway?.hostName || ''}
                onChange={handleChange}
            />
        </div>
    )
}

export default IPFSDownloadGatewayControl