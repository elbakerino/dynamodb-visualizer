import { BlockPicker } from 'react-color'
import useTheme from '@material-ui/core/styles/useTheme'
import Popover from '@material-ui/core/Popover'
import React, { memo } from 'react'
import FormLabel from '@material-ui/core/FormLabel'
import Switch from '@material-ui/core/Switch'
import Box from '@material-ui/core/Box'
import { FlowStateDataScopes } from '../../FlowState/FlowTypes'
import { useNamedColors } from '../../../lib/NamedColors/NamedColorsProvider'
import { FlowToolbarEditProps } from '../FlowToolbarEdit'

export const FlowToolbarEditColorBase = <FSD extends FlowStateDataScopes>(
    {
        color,
        outline,
        showEdit,
        setShowEdit,
        onClose,
        selectedElement,
        updateView,
        colorMapId = 'flow_box',
        containerRef,
    }: {
        color?: string
        outline?: boolean
        colorMapId?: string
        containerRef?: React.MutableRefObject<HTMLDivElement | null>
    } & FlowToolbarEditProps<FSD>
): React.ReactElement => {
    const {palette, typography} = useTheme()
    const {getNamedColor, getColorsInHex} = useNamedColors(colorMapId)

    return <Popover
        //id={id}
        open={Boolean(showEdit)}
        anchorEl={showEdit || undefined}
        onClose={() => {
            setShowEdit(undefined)
            window.setTimeout(() => onClose && onClose(), 10)
        }}
        container={containerRef?.current}
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
            color={getNamedColor(color, 'background__paper')?.color || ''}
            styles={{
                default: {
                    card: {
                        background: 'transparent',
                    },
                    //body: {},
                    // head: {
                    //     background: outline ? 'transparent' : palette.background.paper,
                    //     border: outline ? '1px solid ' + palette.background.paper : 0,
                    // },
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
            colors={getColorsInHex()}
            width={'106px'}
            onChange={(color) => {
                if(!selectedElement) return
                updateView(
                    // @ts-ignore
                    selectedElement.type,
                    selectedElement.id,
                    (view) => ({
                        ...view,
                        color: getNamedColor(color.hex)?.name || color.hex,
                    })
                )
            }}
        />

        <Box p={1}>
            <FormLabel style={{display: 'flex', alignItems: 'center'}}>
                <span style={{marginRight: 'auto'}}>Outline</span>
                <Switch
                    checked={outline}
                    size="small"
                    onChange={() => {
                        if(!selectedElement) return
                        updateView(
                            // @ts-ignore
                            selectedElement.type,
                            selectedElement.id,
                            (view) => ({
                                ...view,
                                outline: !view.outline,
                            })
                        )
                    }}
                />
            </FormLabel>
        </Box>
    </Popover>
}

export const FlowToolbarEditColor = memo(FlowToolbarEditColorBase)
