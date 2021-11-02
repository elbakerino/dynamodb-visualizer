import React, { memo } from 'react'
import { Map } from 'immutable'
import { FlowRenderer, FlowRendererProps } from '../FlowState/FlowRenderer'
import { FlowState, FlowStateDataScopes, FlowStateType, FlowStateView, FlowStateViewData } from '../FlowState/FlowTypes'
import { FlowContextProvider } from '../FlowState/FlowContext'
import { useDynamoTables } from '../../feature/DynamoTables'
import { EdgeTypesType } from 'react-flow-renderer'
import { EdgeInteractive } from '../FlowEdges/EdgeInteractive'
import { FlowToolbar } from '../FlowToolbar/FlowToolbar'
import { FlowNoticer } from '../FlowNoticer/FlowNoticer'
import { NodeEntity, NodeEntityData } from './FlowComponents/FlowNodeEntity'
import { EdgeEntityConnection } from './FlowComponents/EdgeEntityConnection'
import { buildViewList } from '../FlowState/ActionHandler'
import { FlowHistoryProvider, useFlowHistoryMaker } from '../FlowState/FlowHistory'
import { NamedColorsProvider } from '../../lib/NamedColors/NamedColorsProvider'
import { green, grey } from '@material-ui/core/colors'
import { flowBoxContentColorMap } from '../FlowNodeBox'
import { FlowToolbarProvider, useFlowToolbar } from '../FlowToolbar/FlowToolbarProvider'
import { NodeCardLabel, NodeCardLabelFlowStateDataScopes } from '../FlowNodes/NodeCardLabel'
import { NodeCardNote, NodeCardNoteFlowStateDataScopes } from '../FlowNodes/NodeCardNote'
import { parseHandleId } from '../FlowNodeHelper/parseHandleId'
import { CustomNodeSelector } from './FlowComponents/CustomNodeSelector'

export interface DesignerFlowStateDataScopes extends FlowStateDataScopes, NodeCardLabelFlowStateDataScopes, NodeCardNoteFlowStateDataScopes {
    entity: NodeEntityData
}

const nodeTypes: FlowRendererProps<DesignerFlowStateDataScopes>['nodeTypes'] = {
    _selector: CustomNodeSelector,
    card_label: NodeCardLabel,
    card_note: NodeCardNote,
    entity: NodeEntity,
}

const edgeTypes: EdgeTypesType = {
    default: EdgeInteractive,
    entity_property_connection: EdgeEntityConnection,
}

const getEdgeType: FlowRendererProps<DesignerFlowStateDataScopes>['getEdgeType'] = (connection) => {
    const {action: sourceHandleAction, type: sourceHandleType} = parseHandleId(connection.sourceHandle) || {}
    const {type: targetHandleType} = parseHandleId(connection.targetHandle) || {}
    if(sourceHandleType === '_prop' && targetHandleType === '_prop') {
        if(sourceHandleAction === 'out') {
            return 'entity_property_connection'
        }
    }
    return 'default'
}

export type DesignerFlowState = FlowState<DesignerFlowStateDataScopes>
export type DesignerFlowStateType = FlowStateType<DesignerFlowStateDataScopes>

const shadedColors = {green, grey}

const colorMaps = {
    flow_box: flowBoxContentColorMap,
}

export const DesignerEntities: React.ComponentType<{
    activeTable: string | undefined
    contentContainerRef: React.MutableRefObject<HTMLDivElement | null>
}> = (
    {
        activeTable,
        contentContainerRef,
    }
) => {
    const {tableDetails, save} = useDynamoTables()
    const table = activeTable ? tableDetails.get(activeTable) : undefined
    const tableEntities = table?.entities

    const [flowState, setFlowStateState] = React.useState<DesignerFlowStateType>(() =>
        buildViewList<DesignerFlowStateDataScopes, FlowStateViewData>(
            tableEntities?.flow_layers,
            Map<keyof DesignerFlowState, DesignerFlowState[keyof DesignerFlowState]>({
                // @ts-ignore
                data: {
                    ...(tableEntities?.flow_cards || {}),
                    entity: tableEntities?.entity_definitions || {},
                },
                view: tableEntities?.flow_view || {},
                viewList: [],
                connections: tableEntities?.flow_connections,
            })
        )
    )

    const {setFlowState, ...history} = useFlowHistoryMaker<DesignerFlowStateDataScopes>(setFlowStateState, flowState)

    console.log(flowState.toJS())

    return <NamedColorsProvider
        shadedColors={shadedColors}
        colorMaps={colorMaps}
    >
        <FlowHistoryProvider {...history}>
            <FlowContextProvider<DesignerFlowStateDataScopes>
                update={setFlowState}
                flowState={flowState}
                container={contentContainerRef}
            >
                <FlowToolbarProvider>
                    <FlowToolbar
                        activeTable={activeTable}
                        save={save}
                    />
                    <FlowNoticer
                        showEmptyNotice={((flowState?.get('viewList') as DesignerFlowState['viewList'])?.length || 0) < 1}
                    />
                    <EnhancedFlowRenderer<DesignerFlowStateDataScopes>
                        viewList={flowState.get('viewList') as DesignerFlowState['viewList']}
                        setFlowState={setFlowState}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        getEdgeType={getEdgeType}
                    />
                </FlowToolbarProvider>
            </FlowContextProvider>
        </FlowHistoryProvider>
    </NamedColorsProvider>
}

const EnhancedFlowRendererBase = <FSD extends FlowStateDataScopes, FV extends FlowStateView = FlowStateView>(
    props: React.PropsWithChildren<FlowRendererProps<FSD, FV>>
): React.ReactElement => {
    const {snapGrid, snapToGrid} = useFlowToolbar()
    return <FlowRenderer<FSD, FV>
        snapToGrid={snapToGrid}
        snapGrid={snapGrid}
        {...props}
    />
}
const EnhancedFlowRenderer = memo(EnhancedFlowRendererBase) as typeof EnhancedFlowRendererBase
