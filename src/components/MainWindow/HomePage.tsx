import React, { FunctionComponent } from 'react';
import ProjectsTable from './ProjectsTable';
import ClientsTable from './ClientsTable';

type Props = {
}

const HomePage: FunctionComponent<Props> = () => {
    return (
        <div>
            <h3>Welcome to kachery cloud</h3>
            <p>
                Get started by installing the
                &nbsp;<a href="https://github.com/scratchrealm/kachery-cloud" target="_blank" rel="noreferrer">kachery-cloud</a>&nbsp;
                Python package.
            </p>
            <ProjectsTable />
            <ClientsTable />
        </div>
    )
}

export default HomePage