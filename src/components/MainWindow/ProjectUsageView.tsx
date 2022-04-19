import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import guiApiRequest from 'common/guiApiRequest';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import useErrorMessage from 'errorMessageContext/useErrorMessage';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { GetProjectUsageRequest, isGetProjectUsageResponse } from 'types/GuiRequest';
import { ProjectUsage } from 'types/ProjectUsage';

type Props = {
    projectId: string
}

const useProjectUsage = (projectId: string) => {
    const [usage, setUsage] = useState<ProjectUsage | undefined>(undefined)
    const {setErrorMessage} = useErrorMessage()
    const {userId, googleIdToken} = useSignedIn()
    useEffect(() => {
        ;(async () => {
            const req: GetProjectUsageRequest = {
                type: 'getProjectUsage',
                projectId,
                auth: {userId, googleIdToken}
            }
            const resp = await guiApiRequest(req, {reCaptcha: false, setErrorMessage})
            if (!isGetProjectUsageResponse(resp)) throw Error('Unexpected response')
            setUsage(resp.projectUsage)
        })()
    }, [projectId, userId, googleIdToken, setErrorMessage])
    return usage
}

const ProjectUsageView: FunctionComponent<Props> = ({projectId}) => {
    const projectUsage = useProjectUsage(projectId)
    const tableData = useMemo(() => {
        if (!projectUsage) return []
        return Object.keys(projectUsage).sort().map(k => (
            {key: k, label: k, value: (projectUsage as any)[k]}
        ))
    }, [projectUsage])
    return (
        <div>
            <h3>Project usage</h3>
            <Table className="NiceTable2">
                <TableBody>
                    {
                        tableData.map(x => (
                            <TableRow key={x.key}>
                                <TableCell>{x.label}: </TableCell>
                                <TableCell style={{wordBreak: 'break-word'}}>{x.value}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default ProjectUsageView