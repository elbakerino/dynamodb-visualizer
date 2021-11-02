import React, { memo } from 'react'
import { ExplorerTableHandlerSave } from '../../feature/DynamoTables'
import { FlowToolbarNode } from './Toolbars/FlowToolbarNode'
import { FlowToolbarPane } from './Toolbars/FlowToolbarPane'

const FlowToolbarBase: React.ComponentType<{
    activeTable: string | undefined
    save: ExplorerTableHandlerSave
}> = ({
          activeTable,
          save,
      }) => {
    return <>
        <FlowToolbarNode/>
        <FlowToolbarPane
            activeTable={activeTable}
            save={save}
        />
    </>
}

export const FlowToolbar = memo(FlowToolbarBase)
