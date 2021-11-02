import React, { memo } from 'react'
import { AppBar, Box, Dialog, DialogActions, DialogContent, FormControl, IconButton, InputLabel, MenuItem, Select, Toolbar, Typography, useMediaQuery, useTheme } from '@material-ui/core'
import IcClose from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'
import { FlowNodeType, FlowStateData } from '../../FlowState/FlowTypes'
import { DesignerFlowStateDataScopes } from '../DesignerEntities'
import { useUID } from 'react-uid'
import { FlowContextActionsType, useFlowActions } from '../../FlowState/FlowContext'
import { EntityIdentification } from './EntityOptions/EntityIdentification'
import { flowStateNodeSelector, selectFlowState } from '../../FlowState/FlowStateNode'
import { NodeEntityDataOptions } from './FlowNodeEntity'

export interface FlowNodeEntityOptionsProps extends Pick<FlowNodeType<DesignerFlowStateDataScopes, 'entity'>, 'id' | 'type'>, FlowNodeEntityOptionsSelectorProps {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    update: FlowContextActionsType<DesignerFlowStateDataScopes>['update']
}

const FlowNodeEntityOptionsBase: React.ComponentType<FlowNodeEntityOptionsProps> = (
    {
        type, id,
        open,
        setOpen,
        update,
        rowStrategy,
        collectionStrategy,
    }
) => {
    const uid = useUID()
    const {container: containerRef} = useFlowActions<DesignerFlowStateDataScopes>()
    const {breakpoints} = useTheme()
    const isSm = useMediaQuery(breakpoints.down('sm'))

    return <Dialog
        open={open}
        maxWidth={'lg'} fullWidth
        fullScreen={isSm}
        container={containerRef?.current}
        TransitionProps={{unmountOnExit: true}}
        onClose={() => setOpen(false)}
        PaperProps={{
            style: {height: '100%'},
        }}
        onMouseDown={(e) =>
            e.stopPropagation()
        }
    >
        <AppBar style={{position: 'relative'}}>
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={() => setOpen(false)}
                    aria-label="close"
                >
                    <IcClose/>
                </IconButton>
                <Typography variant="h6" component="div">
                    Entity Options
                    <small style={{display: 'flex'}}><strong>🚧 Work in progress</strong></small>
                </Typography>
            </Toolbar>
        </AppBar>
        <DialogContent>
            <Box mt={2} mb={2}>
                <FormControl style={{flexShrink: 0}} fullWidth>
                    <InputLabel id={'ddv-' + uid + '-row-strategy_label'}>Row Strategy</InputLabel>
                    <Select
                        labelId={'ddv-' + uid + '-row-strategy_label'}
                        id={'ddv-' + uid + '-row-strategy_select'}
                        value={rowStrategy || ''}
                        onChange={(e) =>
                            type && update(
                                type,
                                id,
                                (data) => ({
                                    ...data,
                                    options: {
                                        ...(data.options || {}),
                                        rowStrategy: e.target.value as string || undefined,
                                    },
                                })
                            )
                        }
                    >
                        <MenuItem value={''}>-</MenuItem>
                        <MenuItem value={'single'}>Single Entity</MenuItem>
                        <MenuItem value={'collection'}>Grouped Entity Collection</MenuItem>
                        <MenuItem value={'virtual'}>Virtual Entity Master</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            {rowStrategy === 'collection' ? <Box mb={2}>
                <FormControl style={{flexShrink: 0}} fullWidth>
                    <InputLabel id={'ddv-' + uid + '-collection-strategy_label'}>Collection Strategy</InputLabel>
                    <Select
                        labelId={'ddv-' + uid + '-collection-strategy_label'}
                        id={'ddv-' + uid + '-collection-strategy_select'}
                        value={collectionStrategy || ''}
                        onChange={(e) =>
                            type && update(
                                type,
                                id,
                                (data) => ({
                                    ...data,
                                    options: {
                                        ...(data.options || {}),
                                        collectionStrategy: e.target.value as string || undefined,
                                    },
                                })
                            )
                        }
                    >
                        <MenuItem value={''}>-</MenuItem>
                        <MenuItem value={'versions'}>Versions of one Entity</MenuItem>
                    </Select>
                </FormControl>
            </Box> : null}
            {rowStrategy === 'single' ? <Box mb={2}>
                <Box mb={2}>
                    <Typography variant={'h4'} component={'h2'}>Entity Identification</Typography>
                    <EntityIdentification
                        type={type}
                        id={id}
                        update={update}
                    />
                </Box>
                <Box>
                    <Typography variant={'h4'} component={'h2'}>Entity Import</Typography>
                    <Typography variant={'body2'}>Use identified example entries to auto-create the entity properties.</Typography>
                </Box>
            </Box> : null}
            {rowStrategy === 'virtual' ? <Box mb={2}>
                <Box style={{flexShrink: 0}}>
                    <Typography variant={'h4'} component={'h2'}>Virtual Collection</Typography>
                </Box>
            </Box> : null}
        </DialogContent>
        <DialogActions>
            <Button color="inherit" onClick={() => setOpen(false)}>
                Close
            </Button>
        </DialogActions>
    </Dialog>
}

export interface FlowNodeEntityOptionsSelectorProps {
    rowStrategy?: NodeEntityDataOptions['rowStrategy']
    collectionStrategy?: NodeEntityDataOptions['collectionStrategy']
}

const selector: flowStateNodeSelector<FlowStateData<DesignerFlowStateDataScopes, 'entity'>, FlowNodeEntityOptionsSelectorProps> = (
    data,
) => ({
    rowStrategy: data?.options?.rowStrategy,
    collectionStrategy: data?.options?.collectionStrategy,
})

export const FlowNodeEntityOptions = selectFlowState<FlowNodeEntityOptionsSelectorProps, FlowStateData<DesignerFlowStateDataScopes, 'entity'>, FlowNodeEntityOptionsProps>(selector, memo(FlowNodeEntityOptionsBase))
