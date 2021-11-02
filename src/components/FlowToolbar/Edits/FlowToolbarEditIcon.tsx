import Popover from '@material-ui/core/Popover'
import React, { memo } from 'react'
import { Box, IconButton, Paper, TextField, Typography } from '@material-ui/core'
import IcDelete from '@material-ui/icons/Delete'
import { FlowStateDataScopes, FlowStateView } from '../../FlowState/FlowTypes'
import { FlowToolbarEditProps } from '../FlowToolbarEdit'
import MuiLink from '@material-ui/core/Link'
import IcSearch from '@material-ui/icons/Search'
import { IconPicker } from '../../IconPicker'
import IcColorize from '@material-ui/icons/ColorLens'
import Button from '@material-ui/core/Button'
import { BlockPicker } from 'react-color'
import { useNamedColors } from '../../../lib/NamedColors/NamedColorsProvider'
import useTheme from '@material-ui/core/styles/useTheme'

export const FlowToolbarEditIconBase = <FSD extends FlowStateDataScopes>(
    {
        icon,
        showEdit,
        setShowEdit,
        onClose,
        selectedElement,
        updateView,
        colorMapId = 'flow_box',
    }: {
        icon: FlowStateView['icon'] | undefined
        colorMapId?: string
    } & FlowToolbarEditProps<FSD>
): React.ReactElement => {
    const [showColor, setShowColor] = React.useState<undefined | Element>()
    const {palette, typography} = useTheme()
    const {getNamedColor, getColorsInHex} = useNamedColors(colorMapId)
    const [iconUrlInvalid, setIconUrlInvalid] = React.useState<boolean>(false)
    const [activeSearch, setActiveSearch] = React.useState('')
    const [iconSearch, setIconSearch] = React.useState<{
        provider: string
        search: string
    } | undefined>()

    const open = Boolean(showEdit)
    React.useEffect(() => {
        setIconSearch(undefined)
    }, [open, setIconSearch])

    const iconSearchSearch = iconSearch?.search
    React.useEffect(() => {
        const timer = window.setTimeout(() => {
            setActiveSearch(iconSearchSearch || '')
        }, 80)
        return () => window.clearTimeout(timer)
    }, [iconSearchSearch, setActiveSearch])

    // @ts-ignore
    const sType = selectedElement?.type
    const sId = selectedElement?.id
    const onSelectIcon = React.useCallback(({provider, id, colorDefault}) => {
        if(!sType || !sId) return
        updateView(
            // @ts-ignore
            sType,
            sId,
            (view) => ({
                ...view,
                icon: view.icon?.provider === provider && view.icon?.name === id ? undefined : {
                    name: id,
                    provider: provider,
                    color: colorDefault || view.icon?.color || undefined,
                },
            })
        )
    }, [updateView, sType, sId])

    return <Popover
        open={open}
        anchorEl={showEdit || undefined}
        keepMounted={false}
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
            <Box p={1} style={{minWidth: 220}}>
                {/*<Box mb={2} style={{display: 'flex', flexDirection: 'column'}}>
                    <Typography style={{width: '100%'}}>
                        Standard Icons
                    </Typography>
                    <TextField
                        size={'small'}
                        value={iconSearch?.provider === 'material-ui' ? iconSearch?.search || '' : ''}
                        onFocus={() => setIconSearch(is => ({
                            provider: 'material-ui',
                            search: is?.provider === 'material-ui' ? is.search : '',
                        }))}
                        onChange={e => setIconSearch({
                            provider: 'material-ui',
                            search: e.target.value,
                        })}
                    />
                    {iconSearch?.provider === 'material-ui' ? <IconPicker provider={'material-ui'}/> : null}
                </Box>*/}
                <Box mb={2} style={{display: 'flex', flexDirection: 'column'}}>
                    <Typography style={{width: '100%'}}>
                        Brand Icons
                    </Typography>
                    <Typography style={{width: '100%'}} variant={'caption'}>
                        {'powered by '}
                        <MuiLink
                            href={'https://simpleicons.org'}
                            color={'inherit'}
                            target={'_blank'} rel={'noopener noreferrer'}
                        >simpleicons.org</MuiLink>
                    </Typography>

                    <Box>
                        <TextField
                            size={'small'}
                            fullWidth
                            value={iconSearch?.provider === 'simple-icons' ? iconSearch?.search || '' : ''}
                            onFocus={() => setIconSearch(is => ({
                                provider: 'simple-icons',
                                search: is?.provider === 'simple-icons' ? is.search : '',
                            }))}
                            onChange={e => setIconSearch({
                                provider: 'simple-icons',
                                search: e.target.value,
                            })}
                            InputProps={{
                                endAdornment: <IcSearch/>
                            }}
                        />
                    </Box>

                    {iconSearch?.provider === 'simple-icons' ?
                        <Box mt={2}>
                            <IconPicker
                                provider={'simple-icons'}
                                selected={icon?.provider === 'simple-icons' ? icon?.name : undefined}
                                search={activeSearch}
                                onSelect={onSelectIcon}
                            />
                        </Box> : null}
                    {iconSearch?.provider === 'simple-icons' || (icon?.provider === 'simple-icons' && icon?.color) ?
                        <Box mt={iconSearch?.provider === 'simple-icons' ? 1 : 0}>
                            <Box style={{display: 'flex'}}>
                                <Button
                                    size={'small'} fullWidth
                                    onClick={(e) => setShowColor(e.currentTarget)}
                                    endIcon={<IcColorize style={{color: getNamedColor(icon?.color)?.color || icon?.color}}/>}
                                >
                                    Color
                                </Button>
                                <Button
                                    size={'small'} fullWidth
                                    onClick={(e) => {
                                        if(!selectedElement) return
                                        updateView(
                                            // @ts-ignore
                                            selectedElement.type,
                                            selectedElement.id,
                                            (view) => ({
                                                ...view,
                                                icon: {
                                                    ...(view.icon || {}),
                                                    color: undefined,
                                                },
                                            })
                                        )
                                    }}
                                >
                                    Clear Color
                                </Button>
                            </Box>
                        </Box> : null}
                </Box>

                <Popover
                    open={Boolean(showColor)}
                    anchorEl={showColor || undefined}
                    onClose={() => {
                        setShowColor(undefined)
                        //window.setTimeout(() => onClose && onClose(), 10)
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
                    <BlockPicker
                        color={getNamedColor(icon?.color, 'background__paper')?.color || ''}
                        styles={{
                            default: {
                                card: {
                                    background: 'transparent',
                                },
                                input: {
                                    background: palette.background.paper,
                                    color: palette.text.primary,
                                    padding: '8px 6px',
                                    fontSize: typography.body2.fontSize,
                                    height: 'auto',
                                    border: '1px solid ' + palette.divider,
                                }
                            }
                        }}
                        colors={getColorsInHex().slice(3)}
                        width={'106px'}
                        onChange={(color) => {
                            if(!selectedElement) return
                            updateView(
                                // @ts-ignore
                                selectedElement.type,
                                selectedElement.id,
                                (view) => ({
                                    ...view,
                                    icon: {
                                        ...(view.icon || {}),
                                        color: getNamedColor(color.hex)?.name || color.hex,
                                    },
                                })
                            )
                        }}
                    />
                </Popover>

                <Box mb={2} style={{display: 'flex'}}>
                    <TextField
                        label={'Icon URL'}
                        type={'url'}
                        error={Boolean(icon?.url && iconUrlInvalid)}
                        size={'small'} fullWidth
                        value={icon?.url || ''}
                        onChange={(e) => {
                            if(!selectedElement) return
                            setIconUrlInvalid(!e.currentTarget.reportValidity())
                            updateView(
                                // @ts-ignore
                                selectedElement.type,
                                selectedElement.id,
                                (view) => ({
                                    ...view,
                                    icon: {
                                        url: e.target.value as string
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
                                    icon: undefined,
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

export const FlowToolbarEditIcon = memo(FlowToolbarEditIconBase)
