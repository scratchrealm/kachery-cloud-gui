import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import React, { FunctionComponent, useMemo, useState } from 'react';
import { ProjectUsage } from 'types/ProjectUsage';

type Props = {
    projectId: string
}

const useProjectUsage = (projectId: string) => {
    const [usage, setUsage] = useState<ProjectUsage | undefined>(undefined)
    ;(async () => {
        
    })()
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