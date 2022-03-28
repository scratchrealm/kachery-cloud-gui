import React, { FunctionComponent } from 'react';
import ProjectsTable from './ProjectsTable';
import ClientsTable from './ClientsTable';

type Props = {
}

const HomePage: FunctionComponent<Props> = () => {
    return (
        <div>
            <h3>Welcome to kachery cloud</h3>
            <ProjectsTable />
            <ClientsTable />
        </div>
    )
}

export default HomePage