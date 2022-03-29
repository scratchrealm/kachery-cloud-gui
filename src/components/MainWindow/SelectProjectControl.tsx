import { MenuItem, Select } from '@material-ui/core';
import React, { FunctionComponent, useCallback } from 'react';
import { Project } from 'types/Project';

type Props = {
    projects: Project[]
    selectedProjectId: string
    setSelectedProjectId: (x: string) => void
}

const SelectProjectControl: FunctionComponent<Props> = ({projects, selectedProjectId, setSelectedProjectId}) => {
    const handleChange = useCallback((e) => {
        const projectId = e.target.value
        setSelectedProjectId(projectId !== '<none>' ? projectId : '')
    }, [setSelectedProjectId])
    return (
        <div>
            <Select
                value={selectedProjectId || '<none>'}
                onChange={handleChange}
            >
                {
                    <MenuItem key='<none>' value='<none>'>None</MenuItem>
                }
                {
                    projects.map(project => (
                        <MenuItem key={project.projectId} value={project.projectId}>{project.label} ({project.projectId})</MenuItem>
                    ))
                }
            </Select>
        </div>
    )
}

export default SelectProjectControl