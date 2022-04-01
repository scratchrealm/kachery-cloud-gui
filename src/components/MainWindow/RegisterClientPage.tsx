import { Button, Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import guiApiRequest from 'common/guiApiRequest';
import { NodeId, Signature } from 'commonInterface/kacheryTypes';
import { useSignedIn } from 'components/googleSignIn/GoogleSignIn';
import useRoute from 'components/useRoute';
import useErrorMessage from 'errorMessageContext/useErrorMessage';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { AddClientRequest } from 'types/GuiRequest';
import EditableTextField from './EditableTextField';
import SelectProjectControl from './SelectProjectControl';
import useProjects from './useProjects';

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
    const { projects, addProject } = useProjects()
    const [defaultProjectId, setDefaultProjectId] = useState<string>('')

    const heading = <h3>Register a client</h3>

    const handleYes = useCallback(() => {
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

    const okayToProceed = useMemo(() => {
        if (!userId) return false
        if (!label) return false
        if (!defaultProjectId) return false
        return true
    }, [label, userId, defaultProjectId])

    // add a default project if none exists
    useEffect(() => {
        if ((projects) && (projects.length === 0)) {
            addProject('default')
        }
    }, [projects, addProject])

    if (!signedIn) {
        return (
            <div>
                {heading}
                <p>To associate this client with your user, you must first log in.</p>
            </div>
        )
    }

    return (
        <div>
            {heading}
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
                                        <SelectProjectControl
                                            projects={projects || []}
                                            selectedProjectId={defaultProjectId}
                                            setSelectedProjectId={setDefaultProjectId}
                                        />
                                    ) : (
                                        <span>Adding default project, please wait...</span>
                                    )
                                ) : (
                                    <span>Loading projects...</span>
                                )
                            }                            
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            {
                !defaultProjectId && (
                    <p style={{color: 'red'}}>You must select a default project above.</p>
                )
            }
            {
                (okayToProceed && (status === 'waiting')) && (
                    <div>
                        <p>Would you like to associate this client with this logged in user?</p>
                        <Button onClick={handleYes}>
                            Yes, proceed
                        </Button>
                    </div>
                )
            }
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
            }
        </div>
    )
}

export default RegisterClientPage