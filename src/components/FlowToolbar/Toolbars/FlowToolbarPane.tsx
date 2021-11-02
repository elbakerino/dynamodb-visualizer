import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import IcUndo from '@material-ui/icons/Undo'
import IcRedo from '@material-ui/icons/Redo'
import IcGridOn from '@material-ui/icons/GridOn'
import IcGridOff from '@material-ui/icons/GridOff'
import IcZoomOut from '@material-ui/icons/ZoomOut'
import IcZoomClear from '@material-ui/icons/CenterFocusWeak'
import IcZoomIn from '@material-ui/icons/ZoomIn'
import IcCenter from '@material-ui/icons/CenterFocusStrong'
import IcFitView from '@material-ui/icons/FitScreen'
import React, { memo } from 'react'
import { useZoomPanHelper } from 'react-flow-renderer'
import { ExplorerTableHandlerSave } from '../../../feature/DynamoTables'
import { useFlowToolbar } from '../FlowToolbarProvider'
import { useFlowHistory } from '../../FlowState/FlowHistory'
import { FlowToolbarSave } from './FlowToolbarSave'

const FlowToolbarPaneBase: React.ComponentType<{
    activeTable: string | undefined
    save: ExplorerTableHandlerSave
}> = (
    {activeTable, save}
) => {
    const {zoomIn, zoomOut, zoomTo, setCenter, fitView} = useZoomPanHelper()
    const {updateToolbar, snapToGrid} = useFlowToolbar()
    const {goHistory, hasFuture, hasPast} = useFlowHistory()
    return <>
        <FlowToolbarSave
            activeTable={activeTable}
            save={save}
        />
        <Box
            mx={2}
            my={1}
            style={{
                display: 'flex',
                position: 'absolute',
                zIndex: 2,
                bottom: 0,
                right: 0,
            }}
        >
            <Button
                onClick={() => goHistory(-1)}
                style={{minWidth: 30, marginRight: 4}}
                title={'Undo'}
                size={'medium'}
                disabled={!hasPast}
            ><IcUndo/></Button>
            <Button
                onClick={() => goHistory(1)}
                style={{minWidth: 30, marginRight: 4}}
                title={'Redo'}
                size={'medium'}
                disabled={!hasFuture}
            ><IcRedo/></Button>
        </Box>
        <Box
            mx={2}
            my={1}
            style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                zIndex: 2,
                top: 0,
                right: 0,
            }}
        >
            <Button
                onClick={() => updateToolbar(s => ({
                    ...s,
                    snapToGrid: !s.snapToGrid,
                }))}
                style={{minWidth: 30, marginRight: 4}}
                title={snapToGrid ? 'Turn off: snap to grid' : 'Turn on: snap to grid'}
                size={'medium'}
            >{snapToGrid ? <IcGridOn/> : <IcGridOff/>}</Button>
            <Button
                onClick={() => zoomOut()}
                style={{minWidth: 30, marginRight: 4}}
                title={'Zoom Out'}
                size={'medium'}
            ><IcZoomOut/></Button>
            <Button
                onClick={() => zoomIn()}
                style={{minWidth: 30, marginRight: 4}}
                title={'Zoom In'}
                size={'medium'}
            ><IcZoomIn/></Button>
            <Button
                onClick={() => zoomTo(1)}
                style={{minWidth: 30, marginRight: 4}}
                title={'Clear Zoom'}
                size={'medium'}
            ><IcZoomClear/></Button>
            <Button
                onClick={() => setCenter(0, 0, 1)}
                style={{minWidth: 30, marginRight: 4}}
                title={'Center View'}
                size={'medium'}
            ><IcCenter/></Button>
            <Button
                onClick={() => fitView()}
                style={{minWidth: 30, marginRight: 4}}
                title={'Fit to View'}
                size={'medium'}
            ><IcFitView/></Button>
        </Box>
    </>
}

export const FlowToolbarPane = memo(FlowToolbarPaneBase)
