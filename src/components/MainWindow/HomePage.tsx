import React, { FunctionComponent } from 'react';
import ProjectsTable from './ProjectsTable';
import ClientsTable from './ClientsTable';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';

type Props = {
}

const HomePage: FunctionComponent<Props> = () => {
    const {signedIn} = useSignedIn()
    return (
        <div>
            <h3>Welcome to kachery cloud (under construction)</h3>
            <p>
                Get started by installing the
                &nbsp;<a href="https://github.com/scratchrealm/kachery-cloud" target="_blank" rel="noreferrer">kachery-cloud</a>&nbsp;
                Python package.
            </p>
            {
                signedIn ? (
                    <div>
                        <ProjectsTable />
                        <ClientsTable />
                    </div>
                ) : (
                    <p>Sign in above</p>
                )
            }
        </div>
    )
}

export default HomePage