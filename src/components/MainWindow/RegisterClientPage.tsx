import { Button, Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import guiApiRequest from 'common/guiApiRequest';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import { NodeId, Signature } from 'commonInterface/kacheryTypes';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import useRoute from 'components/useRoute';
import useErrorMessage from 'errorMessageContext/useErrorMessage';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { AddClientRequest } from 'types/GuiRequest';
import EditableTextField from './EditableTextField';
import SelectProjectControl from './SelectProjectControl';
import useProjectsForUser from './useProjectsForUser';

type Props = {
    clientId: NodeId
    signature: Signature
    label: string
}

type Status = 'waiting' | 'starting' | 'running' | 'error' | 'finished'

const RegisterClientPage: FunctionComponent<Props> = ({clientId, signature, label}) => {
    const {userId, googleIdToken, signedIn} = useSignedIn()
    const [status, setStatus] = useState<Status>('waiting')
    const { errorMessage, setErrorMessage } = useErrorMessage()
    const { setRoute } = useRoute()
    const { projects, addProject } = useProjectsForUser()
    const [defaultProjectId, setDefaultProjectId] = useState<string | undefined>()

    const handleRegister = useCallback(() => {
        setStatus('starting')
    }, [])

    const [editLabel, setEditLabel] = useState<string>('')
    useEffect(() => {
        setEditLabel(label)
    }, [label])
    const handleLabelChange = useCallback((x: string) => {
        setEditLabel(x)
    }, [])

    useEffect(() => {
        if (!userId) return
        if (!googleIdToken) return
        ;(async () => {
            if (status === 'starting') {
                setStatus('running')
                const req: AddClientRequest = {
                    type: 'addClient',
                    clientId,
                    ownerId: userId,
                    label: editLabel,
                    defaultProjectId: defaultProjectId || undefined,
                    verificationDocument: {
                        type: 'addClient'
                    },
                    verificationSignature: signature,
                    auth: {
                        userId,
                        googleIdToken
                    }
                }
                const response = await guiApiRequest(req, {reCaptcha: true, setErrorMessage})
                if (response) {
                    setStatus('finished')
                }
                else {
                    setStatus('error')
                }
            }
        })()
    }, [status, userId, clientId, setErrorMessage, signature, googleIdToken, setRoute, editLabel, defaultProjectId])

    // add a default project if none exists
    useEffect(() => {
        if ((projects) && (projects.length === 0)) {
            addProject('default', '')
        }
    }, [projects, addProject])

    useEffect(() => {
        setDefaultProjectId(undefined)
        if (!projects) return
        if (projects.length === 0) return
        const d = projects.filter(p => (p.label === 'default'))
        if (d.length > 0) {
            setDefaultProjectId(d[0].projectId)
        }
        setDefaultProjectId(projects[0].projectId)
    }, [projects])

    const submitOkay = useMemo(() => {
        if (!userId) return false
        if (!label) return false
        if (!defaultProjectId) return false
        return true
    }, [label, userId, defaultProjectId])

    if (!signedIn) {
        return (
            <div>
                <h2>Register a client</h2>
                <p>To associate this client with your user, you must first log in above.</p>
            </div>
        )
    }

    return (
        <div>
            <h2>Register a client</h2>
            <p>Please upgrade your version of kachery-cloud to 0.3.1 or later.</p>
            {/* <p>You are associating this client with your logged in user and a kachery-cloud project.</p>
            <p>Complete this form and then click the REGISTER CLIENT button below.</p>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>Client ID</TableCell>
                        <TableCell>{clientId}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>{userId}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Label</TableCell>
                        <TableCell><EditableTextField value={editLabel} onChange={handleLabelChange} /></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Default project</TableCell>
                        <TableCell>
                            {
                                projects ? (
                                    projects.length > 0 ? (
                                        <div>
                                            <SelectProjectControl
                                                projects={projects || []}
                                                selectedProjectId={defaultProjectId || ''}
                                                setSelectedProjectId={setDefaultProjectId}
                                            />
                                            <p>
                                                You can select from this list or&nbsp;
                                                <Hyperlink href={`${window.location.protocol}://${window.location.host}`} target='_blank'>add a new project</Hyperlink>.&nbsp;
                                                Refresh this page to update the project list.
                                            </p>
                                        </div>
                                    ) : (
                                        <span>Adding default project, please wait...</span>
                                    )
                                ) : (
                                    <span style={{color: 'orange'}}>Loading projects...</span>
                                )
                            }
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            {
                (projects) && (!defaultProjectId) && (
                    <p style={{color: 'red'}}>You must select a default project above.</p>
                )
            }
            <div>
                <Button disabled={(!submitOkay) || (status !== 'waiting')} onClick={handleRegister}>
                    Register client
                </Button>
            </div>
            {
                (status === 'running') && (
                    <p>Please wait...</p>
                )
            }
            {
                (status === 'finished') && (
                    <p>Your client was successfully registered.</p>
                )
            }
            {
                status === 'error' && (
                    <p><span style={{color: 'red'}}>Error registering client: {errorMessage}</span></p>
                )
            } */}
        </div>
    )
}

export default RegisterClientPage