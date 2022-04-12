import { Table, TableBody } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import { ProjectSettings } from 'types/Project';

type Props = {
    projectId: string
    projectSettings: ProjectSettings
    setProjectSettings?: (o: {projectId: string, projectSettings: ProjectSettings}) => void
}

const ProjectSettingsView: FunctionComponent<Props> = ({projectId, projectSettings, setProjectSettings}) => {
    return (
        <div>
            <h3>Project settings</h3>
            <Table className="NiceTable2">
                <TableBody>
                </TableBody>
            </Table>
        </div>
    )
}

export default ProjectSettingsView