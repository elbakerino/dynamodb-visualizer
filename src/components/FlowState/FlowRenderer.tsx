import React, { KeyboardEventHandler, MouseEvent as ReactMouseEvent, MouseEventHandler, ReactNode } from 'react'
import ReactFlow, { Node, SnapGrid, Connection, Edge, Elements, useZoomPanHelper, useStore, useStoreActions } from 'react-flow-renderer'
import { FlowContextProps, useFlowActions } from './FlowContext'
import { FlowState, FlowStateDataScopes, FlowStateView, FlowStateViewCombined, FlowStateViewData, FlowStateViewInternalOnly, FlowViewListEntryNode } from './FlowTypes'
import { OnEdgeUpdateFunc } from 'react-flow-renderer/dist/types'
import { updateNodeView, createNode, updateConnection, createConnection, deleteConnectionById, deleteNodeById } from './ActionHandler'

export interface FlowRendererProps<FSD extends FlowStateDataScopes, FV extends FlowStateView = FlowStateView> {
    viewList: FlowState<FSD>['viewList'] | undefined
    setFlowState: FlowContextProps<FSD, FV>['update']
    getEdgeType?: (connection: Edge | Connection) => string
    nodeTypes: {
        [key in keyof FSD]: ReactNode;
    }
    edgeTypes: {
        [key: string]: ReactNode;
    }
    snapToGrid?: boolean
    snapGrid?: SnapGrid
}

export const FlowRenderer = <FSD extends FlowStateDataScopes, FV extends FlowStateViewData = FlowStateViewData>(
    {
        viewList,
        setFlowState,
        nodeTypes,
        edgeTypes,
        snapToGrid,
        snapGrid,
        getEdgeType,
    }: FlowRendererProps<FSD, FV>
): React.ReactElement => {
    const doubleClickTime = React.useRef<{ n: number }>({n: 0})
    const {project} = useZoomPanHelper()
    const store = useStore()
    const setSelectedElements = useStoreActions(s => s.setSelectedElements)
    const {duplicate, duplicateAll} = useFlowActions()

    const onElementsRemove: (elements: Elements) => void = React.useCallback((elementsToRemove) => {
        elementsToRemove.forEach((elem => {
            if('source' in elem && 'target' in elem) {
                setFlowState(fs => deleteConnectionById<FSD, FV>(fs, elem.id))
            } else if(elem.type) {
                setFlowState(fs => deleteNodeById<FSD, FV>(fs, elem.type as keyof FSD, elem.id))
            }
        }))
    }, [setFlowState])

    const onConnect: (connection: Edge | Connection) => void = React.useCallback((connection) => {
        setFlowState((fs) => createConnection<FSD, FV>(fs, connection, getEdgeType))
    }, [setFlowState, getEdgeType])

    const onEdgeUpdate: OnEdgeUpdateFunc = React.useCallback((oldEdge, newConnection) => {
        setFlowState((fs) => updateConnection<FSD, FV>(fs, oldEdge, newConnection))
    }, [setFlowState])

    const onClick: MouseEventHandler = React.useCallback((e) => {
        // todo: better offsetParent finding, needs to be the total offset to screen,
        //       not only between flow-div and parent div,
        //       what makes it depending on usage position and the parent HTML layout
        //       e.g. here getting the Box which contains the renderer 100% (h/w)
        //       two offsetParents resolve to `.react-flow` one time
        e.stopPropagation()
        const now = Date.now()
        const c = doubleClickTime.current.n
        if((now - c) > 350 || (now - c) === now || (now - c) === 0) {
            doubleClickTime.current.n = now
            return
        }
        doubleClickTime.current.n = Date.now()
        // @ts-ignore
        const offsetParent = e.target?.offsetParent?.offsetParent?.offsetParent
        const ol = offsetParent?.offsetLeft || 0
        const ot = offsetParent?.offsetTop || 0
        const x = e.clientX - ol
        const y = e.clientY - ot
        const pos = project({
            x: x,
            y: y
        })
        setFlowState((fs) =>
            createNode<FSD, FV>(
                fs,
                {
                    position: {
                        x: pos.x,
                        y: pos.y,
                    },
                    created: true,
                } as Partial<FlowStateViewCombined & FV>,
                (id, node) => {
                    if(node) {
                        // todo: make a better "only set-as-selected after mounted"
                        window.setTimeout(() => {
                            setSelectedElements([node])
                        }, 150)
                    }
                }
            )
        )
    }, [setFlowState, doubleClickTime, project, setSelectedElements])

    const onElementMoved: (event: ReactMouseEvent, node: Node) => void = React.useCallback((e, node) => {
        if(node.type) {
            setFlowState(fs => {
                const selectedElems = store.getState().selectedElements
                const nodes = store.getState().nodes.filter(n => selectedElems?.findIndex(se => se.id === n.id) !== -1)
                nodes?.forEach(elem => {
                    fs = updateNodeView<FSD, FV>(
                        fs,
                        elem.type as keyof FSD,
                        elem.id,
                        (view) => ({
                            ...view,
                            // @ts-ignore
                            position: elem.__rf && elem.__rf.position ? elem.__rf.position : elem.position,
                        })
                    )
                })
                return fs
            })
        }
    }, [setFlowState, store])

    const onKeyboardInteract: KeyboardEventHandler<HTMLDivElement> = React.useCallback((e) => {
        if(e.key.toLowerCase() === 'd' && e.ctrlKey) {
            e.preventDefault()
            e.stopPropagation()
            const selectedElems = store.getState().selectedElements
            if(selectedElems?.length === 1) {
                const {type, id} = selectedElems[0] as FlowStateViewInternalOnly
                duplicate(type, id, 1, (id, node) => {
                    if(node) {
                        setSelectedElements([node])
                    }
                })
            } else if((selectedElems?.length || 0) > 1) {
                const selectors: FlowStateViewInternalOnly[] = []
                selectedElems?.forEach((elem) => {
                    selectors.push({
                        id: elem.id,
                        type: (elem as FlowStateViewInternalOnly).type,
                    })
                })
                const offset: number = 1
                const newElems: FlowViewListEntryNode<FSD, FV>[] = []
                duplicateAll(
                    selectors, offset,
                    (newOnes) => {
                        newOnes?.forEach((newOne) => {
                            if(newOne) {
                                newElems.push(newOne.node as FlowViewListEntryNode<FSD, FV>)
                            }
                        })
                    }
                )
                setSelectedElements(newElems)
            }
        }
    }, [store, setSelectedElements, duplicateAll, duplicate])

    return <ReactFlow
        elements={viewList || []}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onElementsRemove={onElementsRemove}
        //onElementClick={onElementSelect}
        onNodeDragStop={onElementMoved}
        onConnect={onConnect}
        onEdgeUpdate={onEdgeUpdate}
        paneMoveable
        //onPaneScroll={e => console.log(e, e?.deltaX, e?.deltaY,)}
        //onConnectStop={e => console.log('stop', e)}
        onPaneClick={onClick}
        deleteKeyCode={46} /* 'delete'-key */
        style={style}
        snapToGrid={snapToGrid}
        snapGrid={snapGrid}
        zoomOnDoubleClick={false}
        multiSelectionKeyCode={17}
        //onKeyPress={onKeyBoardInteract}
        onKeyDown={onKeyboardInteract}
        tabIndex={-1}

        //onNodeMouseEnter={e => console.log('mouse enter', e)}
        //onNodeMouseLeave={e => console.log('mouse leave', e)}
    />
}
const style = {zIndex: 1}
