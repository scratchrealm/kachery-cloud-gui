import { Button } from '@material-ui/core';
import useFeed from 'kacheryCloudFeeds/useFeed';
import React, { FunctionComponent, useCallback, useState } from 'react';

type Props = {
}

const TestFeedsPage: FunctionComponent<Props> = () => {
    const [editFeedId, setEditFeedId] = useState<string>('mbgzbyyfjomn')
    const [feedId, setFeedId] = useState<string>('')
    const {messages} = useFeed(feedId)
    const handleSubmit = useCallback(() => {
        setFeedId(editFeedId)
    }, [editFeedId])
    return (
        <div>
            Feed ID: <TextInput value={editFeedId} onChange={setEditFeedId} />
            <Button onClick={handleSubmit}>Submit</Button>
            <p>Feed: {feedId}</p>
            <div>
                {
                    messages.slice(0).map((message, ii) => ({message, ii})).reverse().map(({message, ii}) => (
                        <pre key={ii}>{ii}: {JSON.stringify(message)}</pre>
                    ))
                }
            </div>
        </div>
    )
}

const TextInput: FunctionComponent<{value: string, onChange: (x: string) => void}> = ({value, onChange}) => {
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
        onChange(e.target.value as string)
    }, [onChange])
    return (
        <div>
            <input type="text" value={value} onChange={handleChange} />
        </div>
    )
}

export default TestFeedsPage