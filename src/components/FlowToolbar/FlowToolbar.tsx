import React, { memo } from 'react'
import { ExplorerTableHandlerSave } from '../../feature/DynamoTables'
import { FlowToolbarNode } from './Toolbars/FlowToolbarNode'
import { FlowToolbarPane, FlowToolbarPaneHistory } from './Toolbars/FlowToolbarPane'
import { FlowToolbarSave } from './Toolbars/FlowToolbarSave'

const FlowToolbarBase: React.ComponentType<{
    activeTable: string | undefined
    save: ExplorerTableHandlerSave
}> = ({
          activeTable,
          save,
      }) => {
    return <>
        <FlowToolbarNode/>

        <FlowToolbarSave
            activeTable={activeTable}
            save={save}
        />

        <FlowToolbarPaneHistory/>

        <FlowToolbarPane/>
    </>
}

export const FlowToolbar = memo(FlowToolbarBase)
