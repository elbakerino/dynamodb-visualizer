import { Paper, useMediaQuery, useTheme } from '@material-ui/core'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import IcColor from '@material-ui/icons/FormatColorFill'
import Badge from '@material-ui/core/Badge'
import IcFormatSize from '@material-ui/icons/FormatSize'
//import IcFormatAlignCenter from '@material-ui/icons/FormatAlignCenter'
//import IcFormatAlignLeft from '@material-ui/icons/FormatAlignLeft'
//import IcFormatAlignRight from '@material-ui/icons/FormatAlignRight'
import IcFormatBold from '@material-ui/icons/FormatBold'
import IcLink from '@material-ui/icons/Link'
import IcLinkOff from '@material-ui/icons/LinkOff'
import IcArticle from '@material-ui/icons/Stop'
import IcLabel from '@material-ui/icons/Label'
import IcEmoticon from '@material-ui/icons/InsertEmoticon'
//import IcLabelImportant from '@material-ui/icons/LabelImportant'
//import IcMore from '@material-ui/icons/More'
import React, { memo } from 'react'
import { FlowElement, useStore, useStoreState } from 'react-flow-renderer'
import { useFlowActions, useFlowState } from '../../FlowState/FlowContext'
import { FlowStateDataScopes, FlowStateView, FlowStateViewInternalOnly } from '../../FlowState/FlowTypes'
import { FlowToolbarEditColor } from '../Edits/FlowToolbarEditColor'
import { FlowToolbarEditLink } from '../Edits/FlowToolbarEditLink'
import { FlowToolbarEditPointer } from '../Edits/FlowToolbarEditPointer'
import { FlowToolbarEditIcon } from '../Edits/FlowToolbarEditIcon'
import { useSimpleGestures } from 'react-simple-gestures'

export const FlowToolbarNode: React.ComponentType<{}> = () => {
    const flowState = useFlowState<FlowStateDataScopes>()
    const [selectedElement, setSelectedElement] = React.useState<undefined | FlowElement>(undefined)

    const store = useStore()
    const selectedElements = useStoreState(s => s.selectedElements)
    React.useEffect(() => {
        if(selectedElements?.length === 1) {
            // @ts-ignore
            const {id, type} = selectedElements[0]
            setSelectedElement(selectedElements[0])
            let lastType = type
            // todo: better identification of the "creation node", and also improve the type-change checking
            if(type === '_selector') {
                const unsub = store.subscribe(() => {
                    const node = store.getState().nodes.find(n => n.id === id)
                    if(node && node.type && node.type !== lastType) {
                        setSelectedElement(e => e ? {...e, type: node.type} : e)
                        unsub()
                    }
                })
                return () => unsub && unsub()
            }
        } else {
            setSelectedElement(undefined)
        }
    }, [store, selectedElements, setSelectedElement])

    const currentView = (selectedElement ? flowState.getIn(['view', selectedElement.type, selectedElement.id]) : undefined) as (FlowStateView & FlowStateViewInternalOnly) | undefined
    const {breakpoints} = useTheme()
    const isMd = useMediaQuery(breakpoints.up('md'))

    return <FlowToolbarNodeBaseMemo
        selectedElement={selectedElement}
        currentView={currentView}
        isMd={isMd}
    />
}

const FlowToolbarNodeBase: React.ComponentType<{
    // todo: type element with FSD
    selectedElement: undefined | FlowElement
    isMd: boolean,
    currentView: (FlowStateView & FlowStateViewInternalOnly) | undefined
}> = (
    {
        currentView,
        selectedElement,
        isMd,
    }
) => {
    const {handler, addListener} = useSimpleGestures({minMovementX: 3, minMovementY: 50})
    const [sideTagClicked, setSideTagClicked] = React.useState<boolean>(false)
    const [colorPickerId, setColorPickerId] = React.useState<undefined | Element>()
    const [showEditColor, setShowEditColor] = React.useState<undefined | Element>()
    const [showEditIcon, setShowEditIcon] = React.useState<undefined | Element>()
    const [showEditPointer, setShowEditPointer] = React.useState<undefined | Element>()
    const btnRef = React.useRef(null)
    const btnLinkRef = React.useRef(null)
    const btnIconRef = React.useRef(null)
    const btnPointerRef = React.useRef(null)
    const {palette} = useTheme()
    const [isOnNavBar, setIsOnNavBar] = React.useState(false)
    const {
        container: containerRef,
        updateView,
    } = useFlowActions<FlowStateDataScopes>()

    const onCloseColor = React.useCallback(() => setIsOnNavBar(false), [setIsOnNavBar])

    const color = currentView?.color
    const outline = currentView?.outline
    const fontSize = typeof currentView?.fontSize === 'number' ? currentView?.fontSize : 1
    const elevate = currentView?.elevate
    const hasSelected = Boolean(selectedElement)
    React.useEffect(() => {
        if(!hasSelected) {
            setSideTagClicked(false)
        }
    }, [hasSelected])

    React.useEffect(() => {
        const unsub = addListener('move', (evt) => {
            if(evt.dir === 'right' && evt.posMovedX > 50 && evt.mPxPerMsX > 200) {
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
                left: 0,
                width: isMd || (!isOnNavBar && !selectedElement) ? 0 : 15,
                top: 0,
                bottom: 0,
                //background: 'pink'
            }}
            {...handler}
        >
            {isMd || (!isOnNavBar && !selectedElement) ? null : <Button
                style={{
                    width: 7,
                    height: 80,
                    position: 'absolute',
                    left: sideTagClicked ? '-100%' : 0,
                    transition: '0.35s ease-in left',
                    top: 25,
                    zIndex: 3,
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
            onMouseEnter={() => setIsOnNavBar(true)}
            onMouseLeave={() => setIsOnNavBar(false)}
            elevation={isOnNavBar || !isMd ? 2 : 0}
            style={{
                display: 'flex',
                position: 'absolute',
                alignItems: 'flex-start',
                background: isOnNavBar || (!isMd && sideTagClicked) ? palette.background.paper : 'transparent',
                transition: '0.32s ease-out background, 0.32s ease-out opacity, 0.25s ease-out left',
                opacity: isOnNavBar || (!isMd && sideTagClicked) ? 0.9 : selectedElement ? 0.5 : 0,
                pointerEvents: isOnNavBar || selectedElement ? 'all' : 'none',
                zIndex: 2,
                top: '5%',
                scrollbarWidth: 'none',
                bottom: '15%',
                left: isMd ? 10 : sideTagClicked ? 5 : '-100%',
                overflowY: 'auto',
                overflowX: 'hidden',
            }}
        >
            <Box
                p={1}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {selectedElement?.type !== '_selector' &&
                selectedElement?.type !== 'entity_property_connection' &&
                selectedElement?.type !== 'default' ?
                    <Button
                        innerRef={btnRef}
                        style={{minWidth: 30, marginBottom: 4}}
                        onClick={(e) => setColorPickerId(e.currentTarget)}
                    ><IcColor/></Button> : null}

                {selectedElement?.type === 'entity' ||
                selectedElement?.type === 'card_label' ||
                selectedElement?.type === 'card_note' ? <>
                    <Button
                        style={{minWidth: 30, marginBottom: 4}}
                        onClick={() => {
                            updateView(
                                // @ts-ignore
                                selectedElement.type,
                                selectedElement.id,
                                (view) => ({
                                    ...view,
                                    fontWeight: view?.fontWeight === 'bold' ? 'normal' : 'bold'
                                })
                            )
                        }}
                    ><IcFormatBold/></Button>
                </> : null}

                {selectedElement?.type === 'card_label' || selectedElement?.type === 'card_note' ? <>
                    <Button
                        style={{minWidth: 30, marginBottom: 4}}
                        onClick={() => {
                            updateView(
                                // @ts-ignore
                                selectedElement.type,
                                selectedElement.id,
                                (view) => ({
                                    ...view,
                                    fontSize:
                                        view.fontSize === 0.85 ? 1 :
                                            !view.fontSize || view.fontSize === 1 ? 1.25 :
                                                view.fontSize === 1.25 ? 1.75 : 0.85,
                                })
                            )
                        }}
                    ><Badge badgeContent={String(fontSize)}><IcFormatSize/></Badge></Button>
                    {/*<Button
                    style={{minWidth: 30, marginBottom: 4}}
                ><IcFormatAlignCenter/></Button>
                <Button
                    style={{minWidth: 30, marginBottom: 4}}
                ><IcFormatAlignLeft/></Button>
                <Button
                    style={{minWidth: 30, marginBottom: 4}}
                ><IcFormatAlignRight/></Button>*/}

                    <Button
                        innerRef={btnIconRef}
                        style={{minWidth: 30, marginBottom: 4}}
                        onClick={(e) => setShowEditColor(e.currentTarget)}
                    >{currentView?.link?.target ? <IcLinkOff/> : <IcLink/>}</Button>

                    <Button
                        innerRef={btnLinkRef}
                        style={{minWidth: 30, marginBottom: 4}}
                        onClick={(e) => setShowEditIcon(e.currentTarget)}
                    ><IcEmoticon/></Button>

                    <Button
                        style={{
                            minWidth: 30,
                            marginBottom: 4,
                        }}
                        onClick={() => {
                            updateView(
                                // @ts-ignore
                                selectedElement.type,
                                selectedElement.id,
                                (view) => ({
                                    ...view,
                                    elevate: !view.elevate,
                                })
                            )
                        }}
                    >
                        <IcArticle
                            style={{
                                filter:
                                    elevate ? undefined :
                                        palette.type === 'dark' ?
                                            'drop-shadow( 3px 3px 2px rgba(160, 160, 160, .7))' :
                                            'drop-shadow( 2px 2px 2px rgba(0, 0, 0, .8))',
                                background: 'transparent',
                            }}
                        />
                    </Button>
                    {/*IcLabelOff*/}
                    <Button
                        innerRef={btnPointerRef}
                        style={{minWidth: 30, marginBottom: 4}}
                        onClick={(e) => setShowEditPointer(e.currentTarget)}
                    ><IcLabel/></Button>
                    {/*<Button
                    style={{minWidth: 30, marginBottom: 4}}
                ><IcLabelImportant/></Button>
                <Button
                    style={{minWidth: 30, marginBottom: 4}}
                ><IcMore/></Button>*/}


                </> : null}

                <FlowToolbarEditColor
                    color={color}
                    outline={outline}
                    showEdit={colorPickerId}
                    setShowEdit={setColorPickerId}
                    onClose={onCloseColor}
                    selectedElement={selectedElement}
                    updateView={updateView}
                    containerRef={containerRef}
                />
                <FlowToolbarEditLink
                    link={currentView?.link}
                    showEdit={showEditColor}
                    setShowEdit={setShowEditColor}
                    onClose={() => setIsOnNavBar(false)}
                    selectedElement={selectedElement}
                    updateView={updateView}
                    containerRef={containerRef}
                />
                <FlowToolbarEditPointer
                    pointer={currentView?.pointer}
                    showEdit={showEditPointer}
                    setShowEdit={setShowEditPointer}
                    onClose={() => setIsOnNavBar(false)}
                    selectedElement={selectedElement}
                    updateView={updateView}
                    containerRef={containerRef}
                />
                <FlowToolbarEditIcon
                    icon={currentView?.icon}
                    showEdit={showEditIcon}
                    setShowEdit={setShowEditIcon}
                    onClose={() => setIsOnNavBar(false)}
                    selectedElement={selectedElement}
                    updateView={updateView}
                    containerRef={containerRef}
                />
            </Box>
        </Paper>
    </>
}

const FlowToolbarNodeBaseMemo = memo(FlowToolbarNodeBase)
