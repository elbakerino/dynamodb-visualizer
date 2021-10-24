import { fetcher } from '../lib/ApiHelper'
import { useExplorerContext } from './ExplorerContext'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { List, Map } from 'immutable'

export interface UserProfileType {
    uuid: string
    created_at: string
    updated_at: string
    email: string
}

export interface UserProfileHierarchicalType {
    meta: UserProfileType
}

export interface UserProfileContext {
    users: List<UserProfileType>
    userDetails: Map<string, Partial<UserProfileHierarchicalType>>
}

export type UserProfileHandlerList = () => Promise<void>
export type UserProfileHandlerDetails = (uuid: string) => Promise<boolean>
export type UserProfileHandlerSave = (uuid: string, data: Partial<{
    password: string
}>) => Promise<boolean>

export interface UserProfileHandler {
    list: UserProfileHandlerList
    loadDetails: UserProfileHandlerDetails
    save: UserProfileHandlerSave
}

export interface UserProfileActionClear {
    type: 'user_profiles.clear'
}

export interface UserProfileActionList {
    type: 'user_profiles.list'
    list: UserProfileType[]
}

export interface UserProfileActionRead {
    type: 'user_profiles.read'
    uuid: string
    user: UserProfileType
}

export type UserProfileActions = UserProfileActionList | UserProfileActionRead | UserProfileActionClear

const userProfileContextDefault: UserProfileContext = {
    users: List(),
    userDetails: Map(),
}

export const reducersUserProfiles = (
    state: UserProfileContext = {...userProfileContextDefault}, action: UserProfileActions
): UserProfileContext => {
    switch(action.type) {
        case 'user_profiles.clear':
            return {...userProfileContextDefault}
        case 'user_profiles.list':
            return {
                ...state,
                users: List(action.list)
                    .sort((a, b) => a.uuid.localeCompare(b.uuid))
            }
        case 'user_profiles.read':
            return {
                ...state,
                userDetails: state.userDetails.update(action.uuid, (user = {}) => ({
                    ...user,
                    ...action.user,
                })),
            }
        default:
            return state
    }
}

export const useUserProfile = (): UserProfileContext & UserProfileHandler => {
    const {connection, id} = useExplorerContext()
    const userProfilesState = useSelector((a: Map<'user_profiles', UserProfileContext> = Map()) => a.get('user_profiles')) as UserProfileContext

    const dispatch = useDispatch()
    const token = connection?.auth?.token

    const list: UserProfileHandlerList = React.useCallback(() => {
        if(!token) return Promise.resolve()

        return fetcher(id + '/tables', 'GET', undefined, token)
            .then(res => {
                console.log(res)
                dispatch({
                    type: 'user_profiles.list',
                    list: res.data.tables.items,
                } as UserProfileActionList)
            })
    }, [id, token, dispatch])

    const loadDetails: UserProfileHandlerDetails = React.useCallback((email) => {
        if(!token) return Promise.resolve(false)

        return fetcher(id + '/user/' + encodeURIComponent(email), 'GET', undefined, token)
            .then(res => {
                console.log('fetch user', res)
                dispatch({
                    type: 'user_profiles.read',
                    uuid: email,
                    user: res.data.user,
                } as UserProfileActionRead)
                return true
            })
    }, [id, token, dispatch])

    const save: UserProfileHandlerSave = React.useCallback((uuid, data) => {
        if(!token) return Promise.resolve(false)

        return fetcher(id + '/user/' + encodeURIComponent(uuid), 'POST', {
            ...(data?.password ? {password: data.password} : {}),
        }, token)
            .then(res => {
                console.log(res)
                if(res.status === 200) {
                    dispatch({
                        type: 'user_profiles.read',
                        uuid: uuid,
                        user: res.data.user,
                    } as UserProfileActionRead)
                    return true
                }
                return false
            })
    }, [id, token, dispatch])

    return {
        list, loadDetails, save,
        ...userProfilesState,
    }
}
