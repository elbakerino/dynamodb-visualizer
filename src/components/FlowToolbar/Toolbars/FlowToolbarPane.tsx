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
import IcFullScreen from '@material-ui/icons/Fullscreen'
import React, { memo } from 'react'
import { useZoomPanHelper } from 'react-flow-renderer'
import { useFlowToolbar } from '../FlowToolbarProvider'
import { useFlowHistory } from '../../FlowState/FlowHistory'
import { useFlowActions } from '../../FlowState/FlowContext'
import { FlowStateDataScopes } from '../../FlowState/FlowTypes'
import { Paper, useMediaQuery, useTheme } from '@material-ui/core'
import { useSimpleGestures } from 'react-simple-gestures'

export const FlowToolbarPaneHistory: React.ComponentType<{}> = () => {
    const {goHistory, hasFuture, hasPast} = useFlowHistory()
    return <Box
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
}

const FlowToolbarPaneBase: React.ComponentType<{}> = () => {
    const {handler, addListener} = useSimpleGestures({
        minMovementX: 3, minMovementY: 50,
        noMultiTouch: true,
    })
    const [sideTagClicked, setSideTagClicked] = React.useState<boolean>(false)
    const {zoomIn, zoomOut, zoomTo, setCenter, fitView} = useZoomPanHelper()
    const {updateToolbar, snapToGrid} = useFlowToolbar()
    const {container: containerRef} = useFlowActions<FlowStateDataScopes>()
    const {palette, breakpoints} = useTheme()
    const isMd = useMediaQuery(breakpoints.up('md'))

    React.useEffect(() => {
        const unsub = addListener('move', (evt) => {
            if(evt.dir === 'left' && evt.posMovedX > 50 && evt.mPxPerMsX > 200) {
                setSideTagClicked(true)
            }
        })
        return () => unsub()
    }, [addListener, setSideTagClicked])

    return <>
        <div
            style={{
                position: 'absolute',
                zIndex: 10,
                right: 0,
                width: isMd ? 0 : 15,
                top: 0,
                bottom: 0,
                //background: 'pink'
            }}
            {...handler}
        >
            {isMd ? null : <Button
                style={{
                    width: 9,
                    height: 80,
                    position: 'absolute',
                    right: 0,
                    //right: sideTagClicked ? '-100%' : 0,
                    transition: '0.35s ease-in left',
                    bottom: 75,
                    zIndex: sideTagClicked ? 11 : 9,
                    padding: 0,
                    minWidth: 0,
                    display: 'block',
                }}
                variant={'contained'}
                color={'primary'}
                onClick={() => setSideTagClicked(c => !c)}
            />}
        </div>
        <Paper
            elevation={isMd ? 0 : 2}
            style={{
                position: 'absolute',
                zIndex: 2,
                top: isMd ? 0 : '5%',
                background: isMd ? 'transparent' : palette.background.paper,
                right: isMd ? 0 : sideTagClicked ? 5 : '-100%',
                //right: isMd ? 0 : 0,
                transition: '0.32s ease-out background, 0.25s ease-out left',
            }}
        >
            <Box
                px={isMd ? 2 : 1.5}
                py={1}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
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
                {containerRef?.current ? <Button
                    onClick={() => {
                        if(
                            document.fullscreenElement
                        ) {
                            if(window.document.exitFullscreen) {
                                window.document.exitFullscreen().then(() => null)
                            }
                        } else if(containerRef?.current?.requestFullscreen) {
                            containerRef?.current?.requestFullscreen()
                        }
                    }}
                    style={{minWidth: 30, marginRight: 4}}
                    title={'Fullscreen'}
                    size={'medium'}
                ><IcFullScreen/></Button> : null}
            </Box>
        </Paper>
    </>
}

export const FlowToolbarPane = memo(FlowToolbarPaneBase)
