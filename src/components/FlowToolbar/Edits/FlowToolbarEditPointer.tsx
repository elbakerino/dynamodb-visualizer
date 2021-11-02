import Popover from '@material-ui/core/Popover'
import React from 'react'
import { Box, Paper, Slider, Typography } from '@material-ui/core'
import ToggleButton from '@material-ui/lab/ToggleButton'
import IcOff from '@material-ui/icons/HighlightOff'
import IcArrowRight from '@material-ui/icons/ArrowRight'
import IcArrowLeft from '@material-ui/icons/ArrowLeft'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import { FlowState, FlowStateDataScopes, FlowStateView } from '../../FlowState/FlowTypes'
import { FlowToolbarEditProps } from '../FlowToolbarEdit'
import { FlowContextActionsType } from '../../FlowState/FlowContext'

export const FlowToolbarEditPointer = <FSD extends FlowStateDataScopes>(
    {
        pointer,
        showEdit,
        setShowEdit,
        onClose,
        selectedElement,
        updateView,
        containerRef,
    }: {
        pointer: FlowStateView['pointer'] | undefined
        containerRef?: React.MutableRefObject<HTMLDivElement | null>
    } & FlowToolbarEditProps<FSD>
): React.ReactElement => {
    return <Popover
        open={Boolean(showEdit)}
        anchorEl={showEdit || undefined}
        container={containerRef?.current}
        onClose={() => {
            setShowEdit(undefined)
            window.setTimeout(() => onClose && onClose(), 10)
        }}
        anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
        }}
    >
        <Paper elevation={1}>
            <Box p={2} /*style={{minWidth: 275}}*/>
                <Typography
                    gutterBottom
                >Pointer</Typography>
                <Box mb={2} style={{display: 'flex'}}>
                    <ToggleButtonGroup
                        value={pointer?.direction || ''}
                        exclusive
                        onChange={(_e, v) => {
                            if(!selectedElement) return
                            updateView(
                                // @ts-ignore
                                selectedElement.type,
                                selectedElement.id,
                                (view) => ({
                                    ...view,
                                    pointer: v ? {
                                        ...view.pointer || {},
                                        direction: v,
                                    } : undefined,
                                })
                            )
                        }}
                    >
                        <ToggleButton value="left" style={{color: 'inherit'}}>
                            <IcArrowLeft/>
                        </ToggleButton>
                        <ToggleButton value="right" style={{color: 'inherit'}}>
                            <IcArrowRight/>
                        </ToggleButton>
                        <ToggleButton value="both" style={{color: 'inherit', position: 'relative'}}>
                            <IcArrowLeft style={{visibility: 'hidden'}}/>
                            <IcArrowLeft style={{position: 'absolute', left: 6}}/>
                            <IcArrowRight style={{position: 'absolute', right: 6}}/>
                        </ToggleButton>
                        <ToggleButton value="" style={{color: 'inherit'}}>
                            <IcOff/>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                <Box>
                    {pointer?.direction === 'both' ?
                        <WidthSlider
                            value={pointer?.width || 20}
                            type={selectedElement?.type}
                            id={selectedElement?.id}
                            label={'Width'}
                            updateView={updateView}
                            updater={(view, v) => ({
                                ...view,
                                pointer: {
                                    ...view.pointer || {},
                                    width: (v || 20) > 10 ? v : v,
                                    widthRight: undefined,
                                    widthLeft: undefined,
                                },
                            })}
                        /> : null}
                    {pointer?.direction === 'right' || pointer?.direction === 'both' ?
                        <WidthSlider
                            value={pointer?.widthRight || 20}
                            type={selectedElement?.type}
                            id={selectedElement?.id}
                            label={'Right Width'}
                            updateView={updateView}
                            updater={(view, v) => ({
                                ...view,
                                pointer: {
                                    ...view.pointer || {},
                                    //widthLeft: view.pointer?.width ? view.pointer.widthLeft : undefined,
                                    widthRight: (v || 20) > 10 ? v || 20 : v || 20,
                                },
                            })}
                        /> : null}
                    {pointer?.direction === 'left' || pointer?.direction === 'both' ?
                        <WidthSlider
                            value={pointer?.widthLeft || 20}
                            type={selectedElement?.type}
                            id={selectedElement?.id}
                            label={'Left Width'}
                            updateView={updateView}
                            updater={(view, v) => ({
                                ...view,
                                pointer: {
                                    ...view.pointer || {},
                                    //widthRight: view.pointer?.width ? view.pointer.widthRight : undefined,
                                    widthLeft: (v || 20) > 10 ? v || 20 : v || 20,
                                },
                            })}
                        /> : null}
                </Box>
            </Box>
        </Paper>
    </Popover>
}

export const WidthSlider = <FSD extends FlowStateDataScopes, FV extends FlowStateView = FlowStateView, FS extends FlowState<FSD, FV> = FlowState<FSD, FV>, K extends keyof FSD = keyof FSD, ID extends string = string, FVD extends FS['view'][K][ID] = FS['view'][K][ID]>(
    {
        label,
        value,
        type,
        id,
        updateView,
        updater,
    }: {
        label: string
        value: number
        type: K | undefined
        id: ID | undefined
        updater: (viewData: FVD, value: number) => FVD
        updateView: FlowContextActionsType<FSD, FV>['updateView']
    }
) => {
    return <Box mb={1}>
        <Typography variant={'body2'}>{label}</Typography>
        <Box style={{display: 'flex', alignItems: 'center'}}>
            <Slider
                //size="small"
                valueLabelDisplay="off"
                color={'secondary'}
                step={1}
                value={value}
                min={10}
                max={50}
                onChange={(_e, v) => {
                    if(!type || !id) return
                    updateView(
                        type,
                        id,
                        (vd) => updater(vd as FVD, v as number),
                    )
                }}
            />
            <Typography
                gutterBottom style={{marginLeft: 8, marginBottom: 0}}
            >{value || 20}</Typography>
        </Box>
    </Box>
}
