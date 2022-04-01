import { Button } from '@material-ui/core';
import axios from 'axios';
import useErrorMessage from 'errorMessageContext/useErrorMessage';
import React, { FunctionComponent, useCallback, useState } from 'react';
import { isTimingResponse, TimingRequest, TimingResponse } from '../../types/TimingRequest';

type Props = {
}

const TimingPage: FunctionComponent<Props> = () => {
    const [timingResponse, setTimingResponse] = useState<TimingResponse | undefined>(undefined)
    const [status, setStatus] = useState<'waiting' | 'running'>('waiting')
    const { setErrorMessage } = useErrorMessage()


    const handleStart = useCallback(() => {
        ;(async () => {
            setStatus('running')
            setErrorMessage('')
            setTimingResponse(undefined)
            const req: TimingRequest = {
                type: 'timing'
            }
            let response
            try {
                const resp = await axios.post('/api/timing', req)
                response = resp.data
            }
            catch(err: any) {
                console.warn(err)
                setErrorMessage(err.message)
                setStatus('waiting')
                return
            }
            if (!isTimingResponse(response)) {
                console.warn(response)
                throw Error('Invalid timing response')
            }
            setTimingResponse(response)
            setStatus('waiting')
        })()
    }, [setErrorMessage])

    return (
        <div>
            <h3>Timing tests</h3>
            <Button disabled={status !== 'waiting'} onClick={handleStart}>Run timing test</Button>
            {
                status === 'running' && (
                    <p>running...</p>
                )
            }
            {
                timingResponse && (
                    <span><pre>{JSON.stringify(timingResponse, null, 4)}</pre></span>
                )
            }
        </div>
    )
}

export default TimingPage