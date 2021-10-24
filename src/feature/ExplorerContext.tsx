import React from 'react'
import { fetcher } from '../lib/ApiHelper'
import { useHistory, useLocation } from 'react-router-dom'
import { parseParams, rebuildSearch } from '../lib/SearchParams'
import jwtDecode from 'jwt-decode'

export interface ExplorerContextConnection {
    name?: string
    expire?: number | undefined
    auth?: {
        token?: string
        user?: string
    }
}

export interface ExplorerContextType {
    id: string | undefined
    connection: ExplorerContextConnection
}

export interface ExplorerAuthToken {
    token: string,
    user: string
}

export interface ExplorerActions {
    getToken: (endpoint: string) => ExplorerAuthToken | undefined
    login: (email: string, password: string) => Promise<boolean>
    logout: (endpoint: string) => void
    logoutFromAll: () => void
    setActive: (endpoint: string | undefined) => void
    createUser: (email: string, password: string) => Promise<void>
}

// @ts-ignore
const ExplorerContext = React.createContext<ExplorerContextType & ExplorerActions>({connection: {}, id: undefined})

export const useExplorerContext = (): ExplorerContextType & ExplorerActions => React.useContext(ExplorerContext)

const ExplorerContextProviderBase: React.ComponentType<React.PropsWithChildren<{
    setOpenLogin: React.Dispatch<React.SetStateAction<boolean>>
}>> = ({children, setOpenLogin}) => {
    const location = useLocation()
    const locationRef = React.useRef<Location | undefined>()
    // @ts-ignore
    locationRef.current = location
    const searchParams = parseParams(location.search)
    const explorerParam = searchParams['explorer'] ? decodeURIComponent(searchParams['explorer']) : undefined
    const [nextId, setNextId] = React.useState<string>(explorerParam || '')
    const [explorerContextValue, setExplorerContext] = React.useState<ExplorerContextType>({connection: {}, id: undefined})
    const {replace} = useHistory()
    const {id, connection} = explorerContextValue

    const getToken: ExplorerActions['getToken'] = React.useCallback((endpoint) => {
        const tokenRaw = window.localStorage.getItem('auth_explorer_ep__' + encodeURIComponent(endpoint))
        if(tokenRaw) {
            try {
                return JSON.parse(tokenRaw)
            } catch(e) {
                console.error('Error while parsing cached token: ', e)
            }
        }
        return undefined
    }, [])

    const login: ExplorerActions['login'] = React.useCallback((email, password) => {
        if(!id) return Promise.resolve(false)

        return fetcher(id + '/login', 'POST', {
            email, password
        })
            .then(res => {
                if(res.status === 200) {
                    const nextToken = {
                        token: res.data.token,
                        user: email,
                    }
                    window.localStorage.setItem('auth_explorer_ep__' + encodeURIComponent(id), JSON.stringify(nextToken))
                    const decoded = nextToken?.token ? jwtDecode(nextToken?.token) : undefined
                    setExplorerContext(ctx => ({
                        ...ctx,
                        connection: {
                            ...ctx.connection,
                            auth: nextToken,
                            expire: (decoded as { exp: number }).exp || undefined
                        }
                    }))
                    return true
                }
                return false
            })
            .catch(e => {
                return false
            })
    }, [id, setExplorerContext])
    const logoutState = React.useCallback(() => {
        setExplorerContext(ctx => ({
            ...ctx,
            connection: {
                ...ctx.connection,
                auth: undefined,
                expire: undefined,
            }
        }))
    }, [setExplorerContext])

    const logout: ExplorerActions['logout'] = React.useCallback((endpoint) => {
        window.localStorage.removeItem('auth_explorer_ep__' + encodeURIComponent(endpoint))
        logoutState()
    }, [logoutState])

    const logoutFromAll: ExplorerActions['logoutFromAll'] = React.useCallback(() => {
        Array(window.localStorage.length).fill(null).forEach((_v, i) => {
            const key = window.localStorage.key(i)
            if(key && key.indexOf('auth_explorer_ep__') === 0) {
                window.localStorage.removeItem(key)
            }
        })
        logoutState()
    }, [logoutState])

    const setActive: ExplorerActions['setActive'] = React.useCallback((endpoint) => {
        setNextId(endpoint || '')
    }, [setNextId])

    React.useEffect(() => {
        setNextId(explorerParam || '')
    }, [explorerParam, setNextId])

    React.useEffect(() => {
        console.log('nextId',nextId)
        if(nextId) {
            const cachedToken = getToken(nextId)
            const decoded = cachedToken?.token ? jwtDecode(cachedToken?.token) as { exp: number } : undefined
            setExplorerContext(ctx => ({
                connection: {
                    ...(ctx.id === nextId ? ctx.connection : {}),
                    ...(cachedToken ? {
                        auth: cachedToken,
                        expire: (decoded as { exp: number }).exp || undefined
                    } : {}),
                },
                id: nextId,
            }))
            console.log(rebuildSearch('explorer', encodeURIComponent(nextId), locationRef.current?.search || ''))
            replace({
                search: rebuildSearch('explorer', encodeURIComponent(nextId), locationRef.current?.search || ''),
            })
        } else {
            setExplorerContext({connection: {}, id: undefined})
            replace({
                search: rebuildSearch('explorer', undefined, locationRef.current?.search || ''),
            })
        }
    }, [setExplorerContext, getToken, replace, nextId, locationRef])

    const expires = connection?.expire
    const token = connection?.auth?.token
    React.useEffect(() => {
        if(!expires) return

        let timer: number | undefined
        const now = Number((Date.now() / 1000).toFixed(0))
        const secondsLeft = expires - now - 240
        console.log('secondsLeft', secondsLeft)
        timer = window.setTimeout(() => {
            fetcher(id + '/token', 'GET', undefined, token)
                .then(res => {
                    if(res.status === 200 && res.data?.token) {
                        const decoded = res.data?.token ? jwtDecode(res.data.token) as { exp: number } : undefined
                        setExplorerContext(ctx => ({
                            ...ctx,
                            connection: {
                                ...ctx.connection,
                                auth: {
                                    ...(ctx.connection?.auth || {}),
                                    token: res.data.token
                                },
                                expire: (decoded as { exp: number }).exp || undefined,
                            },
                        }))
                        return
                    }
                    return Promise.reject()
                })
                .catch(e => {
                    setExplorerContext({
                        connection: {
                            auth: undefined,
                            expire: undefined,
                        },
                        id: id,
                    })
                })
        }, secondsLeft * 1000)
        return () => window.clearTimeout(timer)
    }, [expires, id, token])

    const createUser: ExplorerActions['createUser'] = React.useCallback((email, password) => {
        return fetcher(id + '/user', 'POST', {
            email, password
        })
            .then(res => {
            })
            .catch(e => {
            })
    }, [id])

    const ctx = React.useMemo(() => ({
        ...explorerContextValue,
        login,
        logout, logoutFromAll,
        createUser,
        getToken,
        setActive,
    }), [
        explorerContextValue,
        login,
        logout, logoutFromAll,
        createUser,
        getToken,
        setActive,
    ])

    const loginRequired = id && !connection.auth?.token
    React.useEffect(() => {
        if(loginRequired) {
            setOpenLogin(true)
        }
    }, [loginRequired, setOpenLogin])

    return <ExplorerContext.Provider value={ctx}>
        {children}
    </ExplorerContext.Provider>
}
export const ExplorerContextProvider = React.memo(ExplorerContextProviderBase)
