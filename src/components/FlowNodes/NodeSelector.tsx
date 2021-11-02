import React, { memo } from 'react'
import { NodeBox, NodeBoxContent } from '../FlowNodeBox'
import { NodeTagOuter } from '../FlowNodeHelper/NodeTagOuter'
import IcSwitch from '@material-ui/icons/SwapHoriz'
import { calcPxByView, calcPyByView } from '../FlowNodeBox/NodeBoxHelper'
import { NodeSelectorContent, NodeSelectorContentProps } from './NodeSelectorContent'
import { FlowStateViewData } from '../FlowState/FlowTypes'

export interface NodeSelectorProps<T extends string = '_selector'> {
    isDragging: boolean
    selected: boolean
    label: string | undefined
    type: T
    id: string
    view?: FlowStateViewData
    NodeSelectorContent?: React.ComponentType<NodeSelectorContentProps>
}

export const NodeSelectorBase = <T extends string = '_selector'>(
    {
        selected,
        isDragging,
        type,
        id,
        view,
        NodeSelectorContent: CustomNodeSelector,
    }: NodeSelectorProps<T>
): React.ReactElement => {
    // todo: replace with injectable FlowContext components
    const NodeSelectorComp = CustomNodeSelector || NodeSelectorContent
    return <NodeBox
        isDragging={isDragging}
    >
        <NodeTagOuter
            label={<><IcSwitch fontSize={'inherit'}/> Select</>}
            highlight
        />

        <NodeBoxContent
            type={type} id={id}
            selected={selected}
            allowClicks
            px={calcPxByView(view)}
            py={calcPyByView(view)}
            {...view}
            boxStyles={{
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <NodeSelectorComp
                id={id}
                type={type}
            />
        </NodeBoxContent>
    </NodeBox>
}
export const NodeSelector = memo(NodeSelectorBase)
