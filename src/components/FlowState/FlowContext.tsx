import React from 'react'
import { ReactFlowProvider } from 'react-flow-renderer'
import {
    FlowConnection,
    FlowState, FlowStateDataScopes, FlowStateType,
    FlowStateView, FlowViewListEntryNode,
} from './FlowTypes'
import { deleteNodeById, updateNodeData, updateNodeView, switchNodeType } from './ActionHandler'
import { duplicateNode } from './ActionHandler/duplicateNode'

export interface FlowContextProps<FSD extends FlowStateDataScopes, FV extends FlowStateView = FlowStateView, FS extends FlowState<FSD, FV> = FlowState<FSD, FV>, FST extends FlowStateType<FSD, FV, FS> = FlowStateType<FSD, FV, FS>> {
    update: React.Dispatch<React.SetStateAction<FST>>
    flowState: FST
}

export interface FlowContextActionsType<FSD extends FlowStateDataScopes, FV extends FlowStateView = FlowStateView, FS extends FlowState<FSD, FV> = FlowState<FSD, FV>> {
    update: <K extends keyof FSD>(
        dataScope: K,
        id: string,
        updater: (data: FSD[K]) => FSD[K]
    ) => void
    duplicate: <K extends keyof FSD>(
        dataScope: K,
        id: string,
        offset: number,
        getId: (id: string | undefined, node: FlowViewListEntryNode<FSD, FV> | undefined) => void
    ) => void
    duplicateAll: <K extends keyof FSD>(
        selectors: {
            type: K
            id: string
        }[],
        offset: number,
        getNewOnes: (newOnes: undefined | ({
            id: string | undefined
            node: FlowViewListEntryNode<FSD, FV> | undefined
        })[]) => void
    ) => void
    updateView: <K extends keyof FSD = keyof FSD, ID extends string = string, FVD extends FS['view'][K][ID] = FS['view'][K][ID]>(
        dataScope: K,
        id: ID,
        //updater: (viewData: FSD[K]) => FSD[K]
        updater: (viewData: FVD) => FVD
    ) => void
    //deleteById: <K extends keyof FSD, ID extends keyof FSDA['data'][K] = keyof FSDA['data'][K]>(
    deleteById: <K extends keyof FSD, ID extends string = string, D extends FSD[K] = FSD[K]>(
        dataScope: K,
        id: ID,
        maybe?: (data: D) => boolean,
        partial?: (data: D) => D,
        // when it returns `true` deletes the connection data
        connectionMatch?: (connection: FlowConnection) => boolean,
        connectionRename?: <C extends FlowConnection = FlowConnection>(connection: C) => C | undefined
    ) => void
    switchType: <K1 extends keyof FSD, K2 extends keyof FSD>(
        fromDataScope: K1,
        id: string,
        toDataScope: K2
    ) => void
}

// @ts-ignore
const FlowContextActions = React.createContext<FlowContextActionsType>({})

export const useFlowActions = <FSD extends FlowStateDataScopes>(): FlowContextActionsType<FSD> => React.useContext(FlowContextActions)

// @ts-ignore
const FlowContextState = React.createContext<FlowStateType>({})

export const useFlowState = <FSD extends FlowStateDataScopes, FST extends FlowStateType<FSD> = FlowStateType<FSD>>(): FST => React.useContext(FlowContextState)

export const FlowContextProvider = <FSD extends FlowStateDataScopes, FV extends FlowStateView = FlowStateView, FS extends FlowState<FSD, FV> = FlowState<FSD, FV>, FST extends FlowStateType<FSD, FV, FS> = FlowStateType<FSD, FV, FS>>(
    {
        children,
        update: updateState,
        flowState,
    }: React.PropsWithChildren<FlowContextProps<FSD, FV, FS, FST>>
): React.ReactElement => {
    const deleteByIdFn: FlowContextActionsType<FSD, FV, FS>['deleteById'] = React.useCallback((a, b, c, d, e, f) => {
        updateState(fs => deleteNodeById<FSD, FV, FS, FST>(fs, a, b,
            // @ts-ignore
            c,
            d, e, f))
    }, [updateState])

    const update: FlowContextActionsType<FSD, FV, FS>['update'] = React.useCallback((a, b, c) => {
        updateState(fs => updateNodeData<FSD, FV, FS, FST>(fs, a, b,
            // @ts-ignore
            c))
    }, [updateState])

    const duplicate: FlowContextActionsType<FSD, FV, FS>['duplicate'] = React.useCallback((a, b, c, d) => {
        updateState(fs => {
            const r = duplicateNode<FSD, FV, FS, FST>(fs, a, b, c)
            if(d) {
                d(r.id, r.node)
            }
            return r.fs
        })
    }, [updateState])

    const duplicateAll: FlowContextActionsType<FSD, FV, FS>['duplicateAll'] = React.useCallback((selectors, offset, getNewOnes) => {
        updateState(fs => {
            const newOnes: any[] = []
            selectors.forEach(s => {
                const r = duplicateNode<FSD, FV, FS, FST>(fs, s.type, s.id, offset, (fs.get('viewList') as FS['viewList'])?.length)
                if(r.id) {
                    newOnes.push(
                        r.id && r.node ? {
                            id: r.id,
                            node: r.node,
                        } : undefined
                    )
                    fs = r.fs
                }
            })
            getNewOnes(newOnes)
            return fs
        })
    }, [updateState])

    const updateView: FlowContextActionsType<FSD, FV, FS>['updateView'] = React.useCallback((dataScope, id, updater) => {
        updateState(fs =>
            updateNodeView<FSD, FV, FS, FST>(
                fs,
                dataScope,
                id,
                // @ts-ignore
                updater,
            )
        )
    }, [updateState])

    const switchTypeFn: FlowContextActionsType<FSD>['switchType'] = React.useCallback((fromDataScope, id, toDataScope) => {
        updateState(fs => switchNodeType<FSD, FV, FS, FST>(fs, fromDataScope, id, toDataScope))
    }, [updateState])

    const ctx = React.useMemo(() => ({
        update,
        deleteById: deleteByIdFn,
        switchType: switchTypeFn,
        updateView,
        duplicate,
        duplicateAll,
    }), [
        update,
        deleteByIdFn,
        switchTypeFn,
        updateView,
        duplicate,
        duplicateAll,
    ])

    return <FlowContextActions.Provider value={ctx}>
        <FlowContextState.Provider value={flowState}>
            <ReactFlowProvider>
                {children}
            </ReactFlowProvider>
        </FlowContextState.Provider>
    </FlowContextActions.Provider>
}
//export const FlowContextProvider = React.memo(FlowContextProviderBase)
