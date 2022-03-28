import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import { ProjectSettings } from 'types/Project';
import IPFSDownloadGatewayControl from './projectSettingsControls/IPFSDownloadGatewayControl';
import IPFSUploadGatewayControl from './projectSettingsControls/IPFSUploadGatewayControl';
import PublicPrivateControl from './projectSettingsControls/PublicPrivateControl';

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
                    <TableRow>
                        <TableCell>Public or private?:</TableCell>
                        <TableCell><PublicPrivateControl projectId={projectId} projectSettings={projectSettings} setProjectSettings={setProjectSettings} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>IPFS download gateway:</TableCell>
                        <TableCell><IPFSDownloadGatewayControl projectId={projectId} projectSettings={projectSettings} setProjectSettings={setProjectSettings} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>IPFS upload gateway:</TableCell>
                        <TableCell><IPFSUploadGatewayControl projectId={projectId} projectSettings={projectSettings} setProjectSettings={setProjectSettings} /></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}

export default ProjectSettingsView