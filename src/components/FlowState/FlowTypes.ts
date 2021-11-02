import { Node } from 'react-flow-renderer'
import { Map } from 'immutable'

/**
 * Always makes `label` optional for nodes and available inside default typings
 */
export interface NodeData {
    label?: string
}

/**
 * How the Node `data` is saved in the states `data` part
 */
export interface FlowNodeStateData<D extends NodeData = NodeData> {
    type: string
    data: D
}

/**
 * Normalizing mostly used view options for nodes
 */
export interface FlowNodeViewOptions {
    color?: string
    fontSize?: number
    elevate?: boolean
    outline?: boolean
    fontWeight?: 'bold' | 'normal'
    link?: {
        target?: string
        iconUrl?: string
    }
    // todo: `icon` must be typed with | to be fully correct, but this introduces a lot of typing headaches / needed extra vars and explicit typings
    icon?: {
        name?: string
        provider?: string
        color?: string
    } & {
        url?: string
    } & {
        emoji?: string
    }
    pointer?: {
        direction?: 'right' | 'left' | 'both'
        width?: number
        widthRight?: number
        widthLeft?: number
    }
}

export interface FlowStateViewPosition {
    position: {
        x: number
        y: number
    }
}

export interface FlowStateView extends FlowNodeViewOptions, FlowStateViewPosition {
}

export interface FlowStateViewInternalOnly {
    id: string
    type: string
}

export type FlowStateViewCombined<FV extends FlowStateView = FlowStateView> = FlowStateViewInternalOnly & FV

export type FlowStateViewPersistentData<V extends FlowStateView> = Omit<V, keyof FlowStateViewInternalOnly>

/**
 * The actual structure of the `data` property for Nodes
 */
export interface FlowNodePayload<D extends NodeData, V extends FlowStateView, VD extends FlowStateViewPersistentData<V> = FlowStateViewPersistentData<V>> {
    _data?: D
    _view?: VD
}

export interface FlowNodeViewProps {
    selected: boolean
    isDragging: boolean
}

export interface FlowStateViewData extends FlowStateView {
    created?: boolean
}

export interface FlowNodeInternalStateData<D extends NodeData, V extends FlowStateView = FlowStateView, P extends FlowNodePayload<D, V> = FlowNodePayload<D, V>> {
    type: string
    data: P
}

export interface FlowStateDataScopes<D extends NodeData = NodeData> {
    [k: string]: D
}

export interface FlowConnection {
    id: string
    type?: string
    source: string
    sourceHandle: string
    target: string
    targetHandle: string
}

export interface FlowState<FSD extends FlowStateDataScopes, FV extends FlowStateView = FlowStateView, KS extends keyof FSD = keyof FSD, ID extends string = string> {
    data: {
        [dataScope in KS]: {
            [id in ID]: FlowNodeStateData<FSD[dataScope]>
        }
    }
    view: {
        [dataScope in KS]: {
            // todo: this actually contains only the `position` and maybe extra persistent view settings data
            [id in ID]: FV & FlowStateViewInternalOnly
        }
    }
    connections: FlowConnection[]
    // todo: in custom Flow Widgets the `id` property value decides what is what
    //viewList: (FlowElement<FlowNodeInternalStateData<FSD[keyof FSD], FV>> | FlowConnection)[]
    viewList: (FlowViewListEntryNode<FSD, FV> | FlowConnection)[]
}

export type FlowViewListEntryNode<FSD extends FlowStateDataScopes, FV extends FlowStateView = FlowStateView> = FlowNodeInternalStateData<FSD[keyof FSD], FlowStateViewCombined<FV>> & FlowStateViewInternalOnly & FlowStateViewPosition

export type FlowStateType<FSD extends FlowStateDataScopes, FV extends FlowStateView = FlowStateView, FS extends FlowState<FSD, FV> = FlowState<FSD, FV>, K extends keyof FS = keyof FS> =
    Map<K, FS[K]>

export interface FlowStateData<FSD extends FlowStateDataScopes, T extends keyof FSD = keyof FSD, FV extends FlowStateView = FlowStateView> {
    _data: {
        type: T
    } & FSD[T]
    _view: FV
}

export type FlowNodeType<FSD extends FlowStateDataScopes, T extends keyof FSD = keyof FSD, FV extends FlowStateView = FlowStateView> =
    Node<FlowStateData<FSD, T, FV>> &
    {
        type: T
    } &
    FlowNodeViewProps
