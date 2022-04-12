import { Button } from '@material-ui/core';
import Hyperlink from 'commonComponents/Hyperlink/Hyperlink';
import useRoute from 'components/useRoute';
import { useKacheryCloudTaskManager } from 'kacheryCloudTasks/context/KacheryCloudTaskManagerContext';
import KacheryCloudTaskManagerSetup from 'kacheryCloudTasks/context/KacheryCloudTaskManagerSetup';
import useTask from 'kacheryCloudTasks/useTask';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import TaskStatusView from './TaskStatusView';

type Props = {
    projectId: string
}

const TestTaskBackendPage: FunctionComponent<Props> = ({projectId}) => {
    return (
        <KacheryCloudTaskManagerSetup projectId={projectId}>
            <TestTaskBackendPage2 projectId={projectId} />
        </KacheryCloudTaskManagerSetup>
    )
}

const TestTaskBackendPage2: FunctionComponent<Props> = ({projectId}) => {
    const [taskName, setTaskName] = useState<string | undefined>(undefined)
    const taskInput = useMemo(() => ({}), [])
    const {task, returnValue} = useTask({
        taskType: 'calculation',
        taskName,
        taskInput
    })

    const {setRoute} = useRoute()

    useEffect(() => {
        setTaskName('')
    }, [])

    const handleGotoProject = useCallback(() => {
        setRoute({page: 'project', projectId})
    }, [projectId, setRoute])

    const [editTaskName, setEditTaskName] = useState<string>('test_task_2.1')

    const handleRun = useCallback(() => {
        setTaskName(editTaskName)
    }, [editTaskName])

    const taskManager = useKacheryCloudTaskManager()

    const [specialTestOutput, setSpecialTestOutput] = useState<any | undefined>(undefined)
    const [specialTestRunning, setSpecialTestRunning] = useState<boolean>(false)

    const handleSpecialTest = useCallback(() => {
        ;(async () => {
            if (!taskManager) return
            setSpecialTestOutput(undefined)
            setSpecialTestRunning(true)
            const tasks = [1, 2, 3, 4, 5, 6].map(x => (taskManager.runTask({
                taskType: 'calculation',
                taskName: 'test_task.1',
                taskInput: {a: x}
            })))
            while (true) {
                await sleepMsec(200)
                setSpecialTestOutput(tasks.map(
                    task => ({status: task.status, result: task.result, error: task.errorMessage})
                ))
                if (tasks.filter(task => ((task.status === 'waiting') || (task.status === 'started'))).length === 0)
                    break
            }
            setSpecialTestRunning(false)
        })()
    }, [taskManager])

    return (
        <div>
            <h2>Test task backend</h2>
            <p>Project: <Hyperlink onClick={handleGotoProject}>{projectId}</Hyperlink></p>
            Task name: <TextInput
                value={editTaskName}
                onChange={setEditTaskName}
            />
            <Button onClick={handleRun}>Run</Button>
            <h3>Result:</h3>
            {
                returnValue ? (
                    <pre>{JSON.stringify(returnValue)}</pre>
                ) : (
                    <TaskStatusView
                        label={taskName || 'no task'}
                        task={task}
                    />
                )
            }
            <Button onClick={handleSpecialTest} disabled={specialTestRunning}>Special test</Button>
            <div>
                {
                    specialTestOutput &&
                    <pre>{JSON.stringify(specialTestOutput, null, 4)}</pre>
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

const sleepMsec = async (ms: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

export default TestTaskBackendPage