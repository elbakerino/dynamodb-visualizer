import React from 'react'
import { FlowElement } from 'react-flow-renderer'
import { FlowContextActionsType } from '../FlowState/FlowContext'
import { FlowStateDataScopes } from '../FlowState/FlowTypes'

export interface FlowToolbarEditProps<FSD extends FlowStateDataScopes, K extends keyof FSD = keyof FSD> {
    showEdit: Element | undefined
    setShowEdit: React.Dispatch<React.SetStateAction<Element | undefined>>
    onClose?: () => void
    selectedElement: undefined | FlowElement<FSD[K][keyof FSD[K]]>
    updateView: FlowContextActionsType<FSD>['updateView']
}
