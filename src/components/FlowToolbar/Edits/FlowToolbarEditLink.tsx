import Popover from '@material-ui/core/Popover'
import React from 'react'
import { Box, IconButton, Paper, TextField, Typography } from '@material-ui/core'
import IcDelete from '@material-ui/icons/Delete'
import { FlowStateDataScopes, FlowStateView } from '../../FlowState/FlowTypes'
import { FlowToolbarEditProps } from '../FlowToolbarEdit'

export const FlowToolbarEditLink = <FSD extends FlowStateDataScopes>(
    {
        link,
        showEdit,
        setShowEdit,
        onClose,
        selectedElement,
        updateView,
        containerRef,
    }: {
        link: FlowStateView['link'] | undefined
        containerRef?: React.MutableRefObject<HTMLDivElement | null>
    } & FlowToolbarEditProps<FSD>
): React.ReactElement => {
    const [iconUrlInvalid, setIconUrlInvalid] = React.useState<boolean>(false)
    const [targetUrlInvalid, setTargetUrlInvalid] = React.useState<boolean>(false)
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
            <Box p={1} style={{minWidth: 275}}>
                <Typography
                    gutterBottom
                >Link</Typography>
                <Box mb={2} style={{display: 'flex'}}>
                    <TextField
                        label={'Target URL'}
                        type={'url'}
                        error={Boolean(link?.target && targetUrlInvalid)}
                        value={link?.target || ''}
                        size={'small'} fullWidth
                        onChange={(e) => {
                            if(!selectedElement) return
                            setTargetUrlInvalid(!e.currentTarget.reportValidity())
                            updateView(
                                // @ts-ignore
                                selectedElement.type,
                                selectedElement.id,
                                (view) => ({
                                    ...view,
                                    link: {
                                        ...view.link || {},
                                        target: e.target.value as string
                                    },
                                })
                            )
                        }}
                    />
                    <IconButton
                        size={'small'} style={{margin: 'auto 0 auto 8px'}}
                        onClick={(e) => {
                            if(!selectedElement) return
                            updateView(
                                // @ts-ignore
                                selectedElement.type,
                                selectedElement.id,
                                (view) => ({
                                    ...view,
                                    link: {
                                        ...view.link || {},
                                        target: undefined,
                                    },
                                })
                            )
                        }}
                    >
                        <IcDelete/>
                    </IconButton>
                </Box>
                <Box mb={2} style={{display: 'flex'}}>
                    <TextField
                        label={'Icon URL'}
                        type={'url'}
                        error={Boolean(link?.target && iconUrlInvalid)}
                        size={'small'} fullWidth
                        value={link?.iconUrl || ''}
                        onChange={(e) => {
                            if(!selectedElement) return
                            setIconUrlInvalid(!e.currentTarget.reportValidity())
                            updateView(
                                // @ts-ignore
                                selectedElement.type,
                                selectedElement.id,
                                (view) => ({
                                    ...view,
                                    link: {
                                        ...view.link || {},
                                        iconUrl: e.target.value as string
                                    },
                                })
                            )
                        }}
                    />

                    <IconButton
                        size={'small'} style={{margin: 'auto 0 auto 8px'}}
                        onClick={(e) => {
                            if(!selectedElement) return
                            updateView(
                                // @ts-ignore
                                selectedElement.type,
                                selectedElement.id,
                                (view) => ({
                                    ...view,
                                    link: {
                                        ...view.link || {},
                                        target: undefined,
                                    },
                                })
                            )
                        }}
                    >
                        <IcDelete/>
                    </IconButton>
                </Box>
            </Box>
        </Paper>
    </Popover>
}
