import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import useRoute from 'components/useRoute';
import { FunctionComponent } from 'react';

const adminUsersJson = process.env.REACT_APP_ADMIN_USERS || "[]"
const adminUsers = JSON.parse(adminUsersJson) as any as string[]

type Props = {
}

const HomePage: FunctionComponent<Props> = () => {
    const {signedIn, userId} = useSignedIn()
    const {setRoute} = useRoute()
    return (
        <div>
            <div className='PageHeading'>
                Welcome to kachery cloud
            </div>
            {
                signedIn ? (
                    <p>You are signed in as {userId}</p>
                ) : (
                    <p>You are not logged in. Sign in above.</p>
                )
            }
            <hr />
            <p />
            <div className='PageBlurb'>
                Kachery cloud resources are organized into projects which are accessed via registered clients. Projects may be connected to cloud storage buckets.
            </div>
            <p />
            <div><Hyperlink onClick={() => {setRoute({page: 'projects'})}}>Projects</Hyperlink></div>
            <div><Hyperlink onClick={() => {setRoute({page: 'clients'})}}>Clients</Hyperlink></div>
            <div><Hyperlink onClick={() => {setRoute({page: 'buckets'})}}>Buckets</Hyperlink></div>
            <p />
            <hr />
            <p />
            {
                userId && adminUsers.includes(userId.toString()) && (
                    <Hyperlink onClick={() => {setRoute({page: 'testFeeds'})}}>test feeds</Hyperlink>
                )
            }
        </div>
    )
}

export default HomePage