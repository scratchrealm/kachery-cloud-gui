import React, { FunctionComponent, useCallback } from 'react';
import { ProjectSettings } from 'types/Project';
import EditBooleanOpt from '../EditBooleanOpt';

type Props = {
    projectId: string
    projectSettings: ProjectSettings
    setProjectSettings?: (o: {projectId: string, projectSettings: ProjectSettings}) => void
}

const PublicPrivateControl: FunctionComponent<Props> = ({projectId, projectSettings, setProjectSettings}) => {
    const handleChangePublic = useCallback((val: boolean) => {
        if (!setProjectSettings) return
        const newSettings: ProjectSettings = {
            ...projectSettings,
            public: val
        }
        setProjectSettings({projectId, projectSettings: newSettings})
    }, [projectId, projectSettings, setProjectSettings])
    return (
        <div>
            <EditBooleanOpt
                label="public"
                value={projectSettings.public}
                setValue={(key, val) => {handleChangePublic(val)}}
            />
        </div>
    )
}

export default PublicPrivateControl