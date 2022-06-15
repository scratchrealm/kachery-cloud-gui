import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import useRoute from 'components/useRoute';
import { FunctionComponent } from 'react';
import TabWindow from './TabWindow';

const adminUsersJson = process.env.REACT_APP_ADMIN_USERS || "[]"
const adminUsers = JSON.parse(adminUsersJson) as any as string[]

type Props = {
}

const HomePage: FunctionComponent<Props> = () => {
    const {signedIn, userId} = useSignedIn()
    const {setRoute} = useRoute()
    return (
        <div>
            <h3>Welcome to kachery cloud</h3>
            <p>
            <a href="https://github.com/scratchrealm/kachery-cloud" target="_blank" rel="noreferrer">Get started</a>
            </p>
            {
                signedIn ? (
                    <TabWindow />
                ) : (
                    <p>Sign in above</p>
                )
            }
            {
                userId && adminUsers.includes(userId.toString()) && (
                    <ul>
                        <li><Hyperlink onClick={() => {setRoute({page: 'admin'})}}>admin</Hyperlink></li>
                        <li><Hyperlink onClick={() => {setRoute({page: 'testFeeds'})}}>test feeds</Hyperlink></li>
                    </ul>
                )
            }
        </div>
    )
}

export default HomePage