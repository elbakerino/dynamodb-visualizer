import { fetcher } from '../lib/ApiHelper'
import { useExplorerContext } from './ExplorerContext'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { List, Map } from 'immutable'
import { ColorizeRulesetType } from '../components/DataTableSidebar/Colorize'
import { FlowNodeStateData, FlowState } from '../components/FlowState/FlowTypes'
import { DesignerFlowStateDataScopes } from '../components/Designer/DesignerEntities'
import { FlowLayerList } from '../components/FlowState/buildLayerList'

export interface ExplorerTableType {
    uuid: string
    data_key: string
    created_at: string
    updated_at: string
    name: string
    table_schema_name?: string
}

export interface DynamoDbKeyIndex {
    AttributeName: string
    KeyType: string
}

export type DynamoDbAttributeType = 'S' | 'SS' | 'N' | 'M' | 'L' | 'B' | 'BOOL' | 'BS' | 'NS' | 'NULL'

export interface DynamoDbInspectResult {
    '@metadata'?: {
        effectiveUri?: string
    }
    Table?: DynamoDbSchemaTable
}

export interface ExplorerTableSchemaType {
    uuid: string
    created_at: string
    updated_at: string
    data_key: string
    schema: DynamoDbInspectResult
}

export interface DynamoDbGlobalSecondaryIndex {
    IndexName?: string
    KeySchema?: [DynamoDbKeyIndex] | [DynamoDbKeyIndex, DynamoDbKeyIndex]
}

export interface DynamoDbSchemaTable {
    TableName?: string
    KeySchema?: [DynamoDbKeyIndex] | [DynamoDbKeyIndex, DynamoDbKeyIndex]
    GlobalSecondaryIndexes?: DynamoDbGlobalSecondaryIndex[]
    AttributeDefinitions?: {
        AttributeName: string
        AttributeType: DynamoDbAttributeType
    }[]
    // AttributeDefinitions?: {
    //     Items?: {
    //         AttributeName: string
    //         AttributeType: DynamoDbAttributeType
    //     }[]
    // }
}

// todo: add all options
export interface DynamoDbAttributeS {
    S: string
}

export interface DynamoDbAttributeN {
    N: string
}

export interface DynamoDbAttributeM {
    M: DynamoDbItem
}

export type DynamoDbAttribute = DynamoDbAttributeS | DynamoDbAttributeN | DynamoDbAttributeM

export interface DynamoDbItem {
    [k: string]: DynamoDbAttribute
}

export interface DynamoDbScanResult {
    Items: DynamoDbItem[]
}

export interface ExplorerTableExampleDataType {
    uuid: string
    created_at: string
    updated_at: string
    data_key: string
    example_items?: DynamoDbScanResult
}

export interface ExplorerTablePresetType {
    uuid: string
    created_at: string
    updated_at: string
    data_key: string
    display_keys?: string[]
}

export interface ExplorerTableColorType {
    uuid: string
    created_at: string
    updated_at: string
    data_key: string
    color_pk?: ColorizeRulesetType['pk']
    color_sk?: ColorizeRulesetType['sk']
}

export type ExplorerTablePresetsType = ExplorerTablePresetType[]

export interface ExplorerTableHierarchicalType<FSD extends DesignerFlowStateDataScopes = DesignerFlowStateDataScopes> {
    meta: ExplorerTableType
    schema?: ExplorerTableSchemaType
    exampleData?: ExplorerTableExampleDataType
    presets?: ExplorerTablePresetsType
    colors?: ExplorerTableColorType[]
    entities?: {
        entity_definitions: {
            [id: string]: FlowNodeStateData<FSD['entity']>
        }
        flow_cards: {
            [key in keyof Omit<FSD, 'entity'>]: FlowNodeStateData<Omit<FSD, 'entity'>[keyof Omit<FSD, 'entity'>]>
        }
        flow_view: FlowState<FSD>['view']
        flow_connections: FlowState<FSD>['connections']
        flow_layers: FlowLayerList
    }
}

export interface ExplorerTableEntity {
    id: string
}

export interface ExplorerTableContext {
    tables: List<ExplorerTableType>
    tableDetails: Map<string, Partial<ExplorerTableHierarchicalType>>
}

export type ExplorerTableHandlerList = () => Promise<void>
export type ExplorerTableHandlerDetails = (uuid: string) => Promise<number>
export type ExplorerTableHandlerCreate = (name: string) => Promise<boolean>
export type ExplorerTableHandlerSave = (uuid: string, data: Partial<{
    name: ExplorerTableType['name']
    schema: ExplorerTableSchemaType['schema']
    exampleData: ExplorerTableExampleDataType['example_items']
    entities: ExplorerTableHierarchicalType['entities']
}>) => Promise<boolean>
export type ExplorerTableHandlerSavePreset = (tableUuid: string, presetName: string, data: Pick<ExplorerTablePresetType, 'display_keys'>) => Promise<boolean>
export type ExplorerTableHandlerSaveColor = (tableUuid: string, colorName: string, data: Pick<ExplorerTableColorType, 'color_pk' | 'color_sk'>) => Promise<boolean>

export interface ExplorerTableHandler {
    list: ExplorerTableHandlerList
    loadDetails: ExplorerTableHandlerDetails
    create: ExplorerTableHandlerCreate
    save: ExplorerTableHandlerSave
    savePreset: ExplorerTableHandlerSavePreset
    saveColor: ExplorerTableHandlerSaveColor
}

export interface ExplorerTableActionHookPersist {
    persist?: boolean
}

export interface ExplorerTableActionClear extends ExplorerTableActionHookPersist {
    type: 'explorer_tables.clear'
}

export interface ExplorerTableActionList extends ExplorerTableActionHookPersist {
    type: 'explorer_tables.list'
    list: ExplorerTableType[]
}

export interface ExplorerTableActionRead extends ExplorerTableActionHookPersist {
    type: 'explorer_tables.read'
    uuid: string
    table: ExplorerTableHierarchicalType
}

export type ExplorerTableActions = ExplorerTableActionList | ExplorerTableActionRead | ExplorerTableActionClear

const explorerTableContextDefault: ExplorerTableContext = {
    tables: List(),
    tableDetails: Map(),
}

export const reducersExplorerTablesMaker = (
    state: ExplorerTableContext = explorerTableContextDefault, action: ExplorerTableActions
): ExplorerTableContext => {
    const newState = reducersExplorerTables(state, action)
    if(action.persist) {
        try {
            const tables = JSON.parse(window.localStorage.getItem('dynamodb_visualizer__tables') || '{}')
            newState.tableDetails.forEach((t, k) => {
                tables[k] = t
            })
            window.localStorage.setItem('dynamodb_visualizer__tables', JSON.stringify(tables))
        } catch(e) {
            console.log('Error while merging/saving local data')
        }
    }
    return newState
}
export const reducersExplorerTables = (
    state: ExplorerTableContext = {...explorerTableContextDefault}, action: ExplorerTableActions
): ExplorerTableContext => {
    switch(action.type) {
        case 'explorer_tables.clear':
            return {...explorerTableContextDefault}
        case 'explorer_tables.list':
            return {
                ...state,
                tables: List(action.list.sort((a, b) => a.uuid.localeCompare(b.uuid)))
            }
        case 'explorer_tables.read':
            return {
                ...state,
                tables: (() => {
                    if(!action.table.meta) return state.tables
                    let tables = state.tables

                    const index = tables.findIndex(t => t.uuid === action.uuid)
                    if(index !== -1) {
                        tables = tables.splice(index, 1)
                    }
                    return tables.push(action.table.meta)
                        .sort((a, b) => a.uuid.localeCompare(b.uuid))
                })(),
                tableDetails: state.tableDetails.update(action.uuid, (tb = {}) => ({
                    ...tb,
                    ...action.table,
                    ...((() => {
                        if(!action.table.presets) return {}
                        const presets = [...(tb.presets || [])]
                        return {
                            presets: [
                                ...presets.filter(p => !action.table.presets?.find(p2 => p2.uuid === p.uuid && p2.data_key === p.data_key)),
                                ...action.table.presets,
                            ].sort((a, b) => a.data_key.localeCompare(b.data_key))
                        }
                    })()),
                    ...((() => {
                        if(!action.table.colors) return {}
                        const colors = [...(tb.colors || [])]
                        return {
                            colors: [
                                ...colors.filter(p => !action.table.colors?.find(p2 => p2.uuid === p.uuid && p2.data_key === p.data_key)),
                                ...action.table.colors,
                            ].sort((a, b) => a.data_key.localeCompare(b.data_key))
                        }
                    })()),
                    ...((() => {
                        if(!action.table.entities) return {}
                        return {
                            entities: {
                                entity_definitions: action.table.entities?.entity_definitions || {},
                                flow_cards: action.table.entities?.flow_cards || {},
                                flow_view: action.table.entities?.flow_view || {},
                                flow_connections: action.table.entities?.flow_connections || [],
                            } as ExplorerTableHierarchicalType['entities']
                        }
                    })()),
                })),
            }
        default:
            return state
    }
}

export const useDynamoTables = (): ExplorerTableContext & ExplorerTableHandler => {
    const {connection, id, init} = useExplorerContext()
    const explorerTablesState = useSelector((a: Map<'explorer_tables', ExplorerTableContext> = Map()) => a.get('explorer_tables')) as ExplorerTableContext

    const dispatch = useDispatch()
    const token = connection?.auth?.token

    const list: ExplorerTableHandlerList = React.useCallback(() => {
        if(!id) {
            const listRaw = window.localStorage.getItem('dynamodb_visualizer__tables')
            const localList: ExplorerTableType[] = []
            if(listRaw) {
                const details: ExplorerTableContext['tableDetails'] = Map(JSON.parse(listRaw))
                details.forEach(t => {
                    if(t.meta) {
                        localList.push(t.meta)
                    }
                })
            }

            dispatch({
                type: 'explorer_tables.list',
                list: localList,
            } as ExplorerTableActionList)

            return Promise.resolve()
        }
        if(!token) return Promise.resolve()

        return fetcher(id + '/tables', 'GET', undefined, token)
            .then(res => {
                console.log(res)
                dispatch({
                    type: 'explorer_tables.list',
                    list: res.data.tables,
                } as ExplorerTableActionList)
            })
    }, [id, token, dispatch])

    const loadDetails: ExplorerTableHandlerDetails = React.useCallback((uuid) => {
        if(!init) return Promise.resolve(506)
        if(!id) {
            const listRaw = window.localStorage.getItem('dynamodb_visualizer__tables')
            let details: Partial<ExplorerTableHierarchicalType> | undefined
            if(listRaw) {
                details = (Map(JSON.parse(listRaw)) as ExplorerTableContext['tableDetails'])?.get(encodeURIComponent(uuid))
            }
            if(details) {
                dispatch({
                    type: 'explorer_tables.read',
                    uuid: encodeURIComponent(uuid),
                    table: details,
                } as ExplorerTableActionRead)
                return Promise.resolve(200)
            }
            return Promise.resolve(404)
        }
        if(!token) return Promise.resolve(407)

        return fetcher(id + '/table/' + uuid, 'GET', undefined, token)
            .then(res => {
                console.log('fetch table', res)
                if(res.status === 200) {
                    dispatch({
                        type: 'explorer_tables.read',
                        uuid: uuid,
                        table: res.data.table,
                    } as ExplorerTableActionRead)
                    return 200
                }
                return res.status
            })
    }, [id, token, dispatch, init])

    const create: ExplorerTableHandlerCreate = React.useCallback((name) => {
        if(!id) {
            dispatch({
                type: 'explorer_tables.read',
                uuid: encodeURIComponent(name),
                persist: true,
                table: {
                    meta: {
                        uuid: encodeURIComponent(name),
                        name: name,
                        data_key: 'v0#meta',
                    },
                },
            } as ExplorerTableActionRead)
            return Promise.resolve(true)
        }
        if(!token) return Promise.resolve(false)

        return fetcher(id + '/table', 'POST', {
            name: name,
        }, token)
            .then(res => {
                if(res.status === 200) {
                    dispatch({
                        type: 'explorer_tables.read',
                        uuid: res.data.table?.meta.uuid,
                        table: res.data.table,
                    } as ExplorerTableActionRead)
                    return true
                }
                return false
            })
    }, [id, token, dispatch])

    const save: ExplorerTableHandlerSave = React.useCallback((uuid, data) => {
        if(!id) {
            dispatch({
                type: 'explorer_tables.read',
                uuid: uuid,
                persist: true,
                table: {
                    ...(data.schema ? {
                        schema: {
                            uuid: uuid,
                            schema: data.schema,
                            data_key: 'v0#schema',
                        }
                    } : {}),
                    ...(data.exampleData ? {
                        exampleData: {
                            uuid: uuid,
                            data_key: 'v0#exampleData',
                            example_items: data.exampleData
                        }
                    } : {}),
                },
            } as ExplorerTableActionRead)
            return Promise.resolve(true)
        }
        if(!token) return Promise.resolve(false)

        return fetcher(id + '/table/' + uuid, 'POST', {
            ...(data?.name ? {name: data.name} : {}),
            ...(data?.schema ? {schema: data.schema} : {}),
            ...(data?.exampleData ? {exampleData: data.exampleData} : {}),
            ...(data?.entities ? {entities: data.entities} : {}),
        }, token)
            .then(res => {
                console.log(res)
                if(res.status === 200) {
                    dispatch({
                        type: 'explorer_tables.read',
                        uuid: uuid,
                        table: res.data.table,
                    } as ExplorerTableActionRead)
                    return true
                }
                return false
            })
    }, [id, token, dispatch])

    const savePreset: ExplorerTableHandlerSavePreset = React.useCallback((tableUuid, presetName, data) => {
        if(!id) {
            dispatch({
                type: 'explorer_tables.read',
                uuid: tableUuid,
                persist: true,
                table: {
                    presets: [
                        {
                            uuid: tableUuid,
                            display_keys: data.display_keys,
                            data_key: 'v0#preset#' + encodeURIComponent(presetName),
                        },
                    ],
                },
            } as ExplorerTableActionRead)
            return Promise.resolve(true)
        }
        if(!token) return Promise.resolve(false)

        return fetcher(id + '/table/' + tableUuid + '/preset/' + encodeURIComponent(presetName), 'POST', {
            ...(data?.display_keys ? {display_keys: data.display_keys} : {}),
        }, token)
            .then(res => {
                console.log(res)
                if(res.status === 200) {
                    dispatch({
                        type: 'explorer_tables.read',
                        uuid: tableUuid,
                        table: res.data.table,
                    } as ExplorerTableActionRead)
                    return true
                }
                return false
            })
    }, [id, token, dispatch])

    const saveColor: ExplorerTableHandlerSaveColor = React.useCallback((tableUuid, colorName, data) => {
        if(!id) {
            dispatch({
                type: 'explorer_tables.read',
                uuid: tableUuid,
                persist: true,
                table: {
                    colors: [
                        {
                            uuid: tableUuid,
                            color_pk: data.color_pk,
                            color_sk: data.color_sk,
                            data_key: 'v0#color#' + encodeURIComponent(colorName),
                        },
                    ],
                },
            } as ExplorerTableActionRead)
            return Promise.resolve(true)
        }
        if(!token) return Promise.resolve(false)

        return fetcher(id + '/table/' + tableUuid + '/color/' + encodeURIComponent(colorName), 'POST', {
            ...(data?.color_pk ? {color_pk: data.color_pk} : {}),
            ...(data?.color_sk ? {color_sk: data.color_sk} : {}),
        }, token)
            .then(res => {
                console.log(res)
                if(res.status === 200) {
                    dispatch({
                        type: 'explorer_tables.read',
                        uuid: tableUuid,
                        table: res.data.table,
                    } as ExplorerTableActionRead)
                    return true
                }
                return false
            })
    }, [id, token, dispatch])

    return {
        list, create, loadDetails, save,
        savePreset, saveColor,
        ...explorerTablesState,
    }
}
