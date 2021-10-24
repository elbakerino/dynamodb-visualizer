import { Map } from 'immutable'
import { combineReducers } from 'redux-immutable'
import {  reducersExplorerTablesMaker } from './DynamoTables'
import { reducersUserProfiles } from './useUserProfile'

export const reducers = combineReducers<Map<string, any>>({
    // @ts-ignore
    explorer_tables: reducersExplorerTablesMaker,
    user_profiles: reducersUserProfiles,
})
