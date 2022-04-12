import { isNodeId, isSignature, NodeId, Signature, UserId } from 'commonInterface/kacheryTypes'
import QueryString from 'querystring'
import { useCallback, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

export type Route = {
    page: 'home'
} | {
    page: 'project',
    projectId: string
} | {
    page: 'projectMembership',
    projectId: string,
    memberId: UserId
} | {
    page: 'client'
    clientId: NodeId
} | {
    page: 'user',
    userId: UserId
} | {
    page: 'registerClient',
    clientId: NodeId,
    signature: Signature,
    label: string
} | {
    page: 'timing'
} | {
    page: 'testTaskBackend',
    projectId: string
}

const useRoute = () => {
    const location = useLocation()
    const history = useHistory()
    const query = useMemo(() => (QueryString.parse(location.search.slice(1))), [location.search]);

    const p = location.pathname
    let route: Route = {page: 'home'}
    if (p.startsWith('/project')) {
        const x = p.split('/')
        if (x.length === 3) {
            route = {
                page: 'project',
                projectId: x[2]
            }
        }
        else if ((x.length === 5) && (x[3] === 'member')) {
            route = {
                page: 'projectMembership',
                projectId: x[2],
                memberId: x[4] as any as UserId
            }
        }
    }
    else if (p.startsWith('/client')) {
        const x = p.split('/')
        if (x.length === 3) {
            route = {
                page: 'client',
                clientId: x[2] as any as NodeId
            }
        }
    }
    else if (p.startsWith('/user')) {
        const x = p.split('/')
        if (x.length === 3) {
            route = {
                page: 'user',
                userId: x[2] as any as UserId
            }
        }
    }
    else if (p.startsWith('/registerClient')) {
        const x = p.split('/')
        if (x.length === 3) {
            const clientId = x[2]
            const signature = query.signature
            const label = query.label as string
            if ((isNodeId(clientId)) && (isSignature(signature))) {
                route = {
                    page: 'registerClient',
                    clientId,
                    signature,
                    label
                }
            }
        }
    }
    else if (p === '/timing') {
        route = {
            page: 'timing'
        }
    }
    else if (p.startsWith('/testTaskBackend')) {
        const x = p.split('/')
        if (x.length === 3) {
            route = {
                page: 'testTaskBackend',
                projectId: x[2]
            }
        }
    }

    const setRoute = useCallback((route: Route) => {
        const query2 = {...query}
        let pathname2 = '/home'
        if (route.page === 'project') {
            pathname2 = `/project/${route.projectId}`
        }
        else if (route.page === 'projectMembership') {
            pathname2 = `/project/${route.projectId}/member/${route.memberId}`
        }
        else if (route.page === 'client') {
            pathname2 = `/client/${route.clientId}`
        }
        else if (route.page === 'user') {
            pathname2 = `/user/${route.userId}`
        }
        else if (route.page === 'registerClient') {
            pathname2 = `/registerClient/${route.clientId}`
            query2['signature'] = route.signature.toString()
            query2['label'] = route.label.toString()
        }
        else if (route.page === 'timing') {
            pathname2 = '/timing'
        }
        else if (route.page === 'testTaskBackend') {
            pathname2 = `/testTaskBackend/${route.projectId}`
        }
        const search2 = queryString(query2)
        history.push({...location, pathname: pathname2, search: search2})
    }, [location, history, query])
    
    return {route, query, setRoute}
}

const queryString = (params: { [key: string]: string | string[] | undefined }) => {
    const keys = Object.keys(params)
    if (keys.length === 0) return ''
    return '?' + (
        keys.map((key) => {
            const v = params[key]
            if (v === undefined) {
                return encodeURIComponent(key) + '='
            }
            else if (typeof(v) === 'string') {
                return encodeURIComponent(key) + '=' + v
            }
            else {
                return v.map(a => (encodeURIComponent(key) + '=' + a)).join('&')
            }
        }).join('&')
    )
}

export default useRoute