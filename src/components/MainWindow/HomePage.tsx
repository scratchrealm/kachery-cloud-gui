import React, { FunctionComponent } from 'react';
import ProjectsTable from './ProjectsTable';
import ClientsTable from './ClientsTable';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import useRoute from 'components/useRoute';

const adminUsersJson = process.env.REACT_APP_ADMIN_USERS || "[]"
const adminUsers = JSON.parse(adminUsersJson) as any as string[]

type Props = {
}

const HomePage: FunctionComponent<Props> = () => {
    const {signedIn, userId} = useSignedIn()
    const {setRoute} = useRoute()
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
            {
                userId && adminUsers.includes(userId.toString()) && (
                    <ul>
                        <li><Hyperlink onClick={() => {setRoute({page: 'admin'})}}>admin</Hyperlink></li>
                        <li><Hyperlink onClick={() => {setRoute({page: 'testFeeds'})}}>test feeds</Hyperlink></li>
                        <li><Hyperlink onClick={() => {setRoute({page: 'timing'})}}>test timing</Hyperlink></li>
                    </ul>
                )
            }
        </div>
    )
}

export default HomePage