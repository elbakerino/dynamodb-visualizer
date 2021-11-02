import React, { memo } from 'react'
import InputBase from '@material-ui/core/InputBase'
import { useFlowActions } from '../FlowState/FlowContext'
import { FlowNodeType, FlowStateDataScopes, NodeData } from '../FlowState/FlowTypes'
import { useResponsiveInput } from '../FlowNodeHelper/useResponsiveInput'
import { NodeTagOuter } from '../FlowNodeHelper/NodeTagOuter'
import { NodeBox, NodeBoxContent } from '../FlowNodeBox'
import MuiLink from '@material-ui/core/Link'
import IcOpenInNew from '@material-ui/icons/OpenInNew'
import { Box, Divider } from '@material-ui/core'
import { IconEmbed } from '../IconEmbed'
import { IconImg } from '../IconImg'
import { useNamedColors } from '../../lib/NamedColors/NamedColorsProvider'
import { handlePreventPaneKeyboardEvent } from '../FlowNodeHelper/handlePreventPaneKeyboardEvent'

export interface NodeCardNoteData extends NodeData {
    label: string
    text: string
}

export interface NodeCardNoteFlowStateDataScopes extends FlowStateDataScopes {
    card_note: NodeCardNoteData
}

export const NodeCardNoteContentBase: React.ComponentType<Omit<FlowNodeType<NodeCardNoteFlowStateDataScopes, 'card_note'>, 'position'> & {
    colorMapId?: string
}> = (
    {
        data,
        selected,
        isDragging,
        type,
        id,
        colorMapId = 'flow_box',
    }
) => {
    const {getNamedColor} = useNamedColors(colorMapId)
    const label = data?._data.label
    const text = data?._data.text
    const view = data?._view
    const fontSize = view?.fontSize || 1
    const {width, getWidth} = useResponsiveInput(
        label || '',
        // todo: no hard coded base size
        ((view?.fontSize || 1) * 16 * 1.25) + 'px'
    )
    const inpWidth = getWidth(width) * (view?.fontWeight === 'bold' ? 1.12 : 1)

    const activeIconColor = view?.icon?.color && getNamedColor(view?.icon?.color) ? getNamedColor(view?.icon?.color)?.color || undefined : view?.icon?.color

    const [focus, setFocus] = React.useState(false)
    const {update} = useFlowActions<NodeCardNoteFlowStateDataScopes>()
    return <NodeBox
        isDragging={isDragging}
    >
        <NodeTagOuter
            label={'Note'}
            highlight={focus}
        />

        <NodeBoxContent
            type={type} id={id}
            selected={selected}
            onFocus={setFocus}
            px={
                (view?.fontSize || 1) > 1 ? 2.5 :
                    view?.fontWeight === 'bold' && (view?.fontSize || 1) === 1 ? 1.75 : 1.5
            }
            py={
                view?.fontSize === 0.85 ? 1 : 1.5
            }
            {...view}
            clickable={
                view?.link?.target ?
                    <MuiLink
                        href={view?.link?.target}
                        className={'nodrag'}
                        target={'_blank'} rel={'noopener noreferrer'}
                        style={{display: 'flex', padding: '0 4px'}}
                    >{
                        view?.link?.iconUrl ?
                            <img src={view?.link?.iconUrl} width={'auto'} height={32 * (fontSize || 1)} alt={'Link to ' + view?.link?.target}/> :
                            <IcOpenInNew/>
                    }</MuiLink> : null
            }
        >
            <Box style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex'}}>
                    {view?.icon?.url || view?.icon?.name ? <span
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            marginRight: (view?.fontSize || 1) > 1 ? 16 : 8,
                            fontSize: ((view?.fontSize || 1) * 2) + 'rem',
                            color: activeIconColor,
                        }}>
                            {view?.icon?.url ?
                                <IconImg
                                    src={view?.icon?.url}
                                    title={'Icon'}
                                    disableGutters
                                    fontSize={'inherit'}
                                /> :
                                view?.icon?.name && view?.icon?.provider ?
                                    <IconEmbed
                                        provider={view?.icon?.provider}
                                        id={view?.icon?.name}
                                        fontSize={'inherit'}
                                        color={'inherit'}
                                    /> : null}
                        </span> : null}
                    <div style={{display: 'flex', flexGrow: 1, minWidth: inpWidth, overflow: 'auto'}}>
                        <InputBase
                            value={label || ''}
                            onFocus={() => setFocus(true)}
                            onBlur={() => setFocus(false)}
                            autoFocus={!label}
                            className={'nodrag'}
                            style={{
                                color: 'inherit',
                                fontSize: (fontSize * 1.25) + 'rem',
                                fontWeight: view?.fontWeight,
                            }}
                            placeholder={selected ? 'Title' : undefined}
                            inputProps={{
                                style: {
                                    padding: 0,
                                }
                            }}
                            onChange={(e) =>
                                type && update(
                                    type,
                                    id,
                                    data => ({
                                        ...data,
                                        label: e.target.value,
                                    })
                                )
                            }
                            onKeyPress={handlePreventPaneKeyboardEvent}
                            fullWidth
                        />
                    </div>
                </div>
                {selected || text ? <Divider style={{
                    width: '100%',
                    margin: selected || text ?
                        (fontSize > 1 ? 8 : 2) + 'px 0 ' + (fontSize > 1 ? fontSize * 12 : fontSize * 8) + 'px 0' : 0,
                }}/> : null}
                {selected || text ? <div style={{display: 'flex', width: '100%', overflow: 'auto', minHeight: 30}}>
                    <InputBase
                        value={text || ''}
                        multiline
                        onFocus={() => setFocus(true)}
                        onBlur={() => setFocus(false)}
                        placeholder={'Text'}
                        className={'nodrag'}
                        //rowsMin={2}
                        style={{
                            color: 'inherit',
                            fontSize: (fontSize > 1 ? 1 : fontSize * 0.85) + 'rem',
                            padding: 0,
                            alignItems: 'flex-start',
                        }}
                        onChange={(e) =>
                            type && update(
                                type,
                                id,
                                data => ({
                                    ...data,
                                    text: e.target.value,
                                })
                            )
                        }
                        onKeyPress={handlePreventPaneKeyboardEvent}
                        fullWidth
                    />
                </div> : null}
            </Box>
        </NodeBoxContent>
    </NodeBox>
}
export const NodeCardNote = memo(NodeCardNoteContentBase)
