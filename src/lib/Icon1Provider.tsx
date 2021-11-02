import React from 'react'
import { fetcher } from './ApiHelper'
import { useExplorerContext } from '../feature/ExplorerContext'

export interface Icon1Icon {
    title?: string
    data: string
}

export interface Icon1ContextType {
    iconDetails: {
        [provider: string]: {
            [id: string]: {
                [color: string]: Icon1Icon
            }
        }
    }
    icons: {
        [k: string]: Icon1ProviderIconList
    }
}

export interface Icon1ProviderIconList {
    total: number
    list: Icon1ProviderIconListItem[]
}

export interface Icon1ProviderIconListItem {
    id: string,
    provider: string
    colorDefault: string
    title?: string
    source?: string
    variants?: []
}

export interface Icon1ContextActions {
    listIcons: (provider: string) => void
    loadIcon: (provider: string, icon: string, color: string) => void
}

const Icon1ContextDefault: Icon1ContextType = {
    icons: {},
    iconDetails: {},
}

const Icon1ContextState = React.createContext<Icon1ContextType>(Icon1ContextDefault)
// @ts-ignore
const Icon1ContextSetState = React.createContext<React.Dispatch<React.SetStateAction<Icon1ContextType>>>()

export const useIcon1 = (): Icon1ContextType => React.useContext(Icon1ContextState)

const loaderCache: { [p: string]: boolean } = {}
const loaderCacheIcon: {
    [provider: string]: {
        [id: string]: {
            [color: string]: boolean
        }
    }
} = {}

export const useIcon1Actions = (): Icon1ContextActions => {
    const {id} = useExplorerContext()
    const setIcons = React.useContext(Icon1ContextSetState)

    const loadIcon: Icon1ContextActions['loadIcon'] = React.useCallback((provider, icon, color) => {
        if(loaderCacheIcon[provider] && loaderCacheIcon[provider][icon] && loaderCacheIcon[provider][icon][color]) return

        if(!loaderCacheIcon[provider]) loaderCacheIcon[provider] = {}
        if(!loaderCacheIcon[provider][icon]) loaderCacheIcon[provider][icon] = {}
        loaderCacheIcon[provider][icon][color] = true

        fetcher(id + '/icon/' + provider + '/' + icon + (color ? '?color=' + encodeURIComponent(color) : ''), 'GET')
            .then(r => {
                setIcons((si) => {
                    return {
                        ...si,
                        iconDetails: {
                            [provider]: {
                                ...(si.iconDetails[provider] || {}),
                                [icon]: {
                                    ...(si.iconDetails[provider] ? si.iconDetails[provider][icon] || {} : {}),
                                    [color]: r.data,
                                }
                            }
                        }
                    }
                })
            })
            .catch(r => {
                delete loaderCacheIcon[provider][icon][color]
                console.log('catch icon', provider, r)
            })
    }, [setIcons, id])

    const listIcons: Icon1ContextActions['listIcons'] = React.useCallback((provider) => {
        if(loaderCache[provider]) return

        loaderCache[provider] = true

        fetcher(id + '/icons?provider=' + encodeURIComponent(provider) + '&per_page=10000', 'GET')
            .then(r => {
                setIcons((si) => {
                    return {
                        ...si,
                        icons: {
                            [provider]: {
                                total: r.data.total,
                                list: r.data.list,
                            }
                        }
                    }
                })
            })
            .catch(r => {
                console.log('catch icon', provider, r)
                delete loaderCache[provider]
            })
    }, [setIcons, id])

    return {
        listIcons,
        loadIcon,
    }
}

export interface Icon1ProviderProps {
}

export const Icon1Provider = (
    {
        children,
    }: React.PropsWithChildren<Icon1ProviderProps>
): React.ReactElement => {
    const [icons, setIcons] = React.useState<{
        icons: Icon1ContextType['icons'],
        iconDetails: Icon1ContextType['iconDetails'],
    }>({
        icons: {},
        iconDetails: {},
    })

    const ctx = React.useMemo(() => ({
        icons: icons.icons,
        iconDetails: icons.iconDetails,
    }), [
        icons,
    ])

    return <Icon1ContextState.Provider value={ctx}>
        <Icon1ContextSetState.Provider value={setIcons}>
            {children}
        </Icon1ContextSetState.Provider>
    </Icon1ContextState.Provider>
}
