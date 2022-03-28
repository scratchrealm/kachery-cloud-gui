import { NodeId, UserId } from 'commonInterface/kacheryTypes'
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