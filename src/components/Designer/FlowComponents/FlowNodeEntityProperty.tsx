import React, { memo } from 'react'
import { FlowContextActionsType } from '../../FlowState/FlowContext'
import { DesignerFlowStateDataScopes } from '../DesignerEntities'
import { useTheme } from '@material-ui/core'
import Box from '@material-ui/core/Box'
import { Handle } from 'react-flow-renderer'
import IcTarget from '@material-ui/icons/Adjust'
import Typography from '@material-ui/core/Typography'
import InputBase from '@material-ui/core/InputBase'
import IcSource from '@material-ui/icons/FiberManualRecord'
import { NodeEntityData, NodeEntityPropertyType } from './FlowNodeEntity'
import { genId } from '../../../lib/genId'
import { parseHandleId } from '../../FlowNodeHelper/parseHandleId'

const handleIds = {
    in: (index: number) => '_prop-' + index + '__in',
    out: (index: number) => '_prop-' + index + '__out',
}

const NodeEntityPropertyBase: React.ComponentType<{
    property: NodeEntityPropertyType | undefined
    index: number
    connectable: boolean | undefined
    type: 'entity'
    parentId: string
    update: FlowContextActionsType<DesignerFlowStateDataScopes>['update']
    deleteById: FlowContextActionsType<DesignerFlowStateDataScopes>['deleteById']
}> = (
    {
        property, index,
        connectable,
        type, update, parentId, deleteById,
    }
) => {
    const {palette} = useTheme()
    const [markedDeletable, setMarkedDeletable] = React.useState(false)
    const ownHandleIds = {
        in: handleIds.in(index),
        out: handleIds.out(index),
    }
    const l = property?.name
    const exists = Boolean(property)
    React.useEffect(() => {
        if(l || !exists) {
            setMarkedDeletable(false)
        }
    }, [setMarkedDeletable, l, exists])

    return <Box style={{
        position: 'relative',
        background: markedDeletable ? palette.error.dark : undefined,
    }}>
        <Handle
            type="target"
            // @ts-ignore
            position={'left'}
            id={ownHandleIds.in}
            isValidConnection={(connection) => {
                //console.log('isValidConnection', connection)
                //setConnecting(connection)
                return true
            }}
            //onConnect={e => setConnecting(e)}
            isConnectable={connectable}
            style={{
                //background: '#555555',
                pointerEvents: exists ? undefined : 'none',
                visibility: exists ? undefined : 'hidden',
                display: 'flex',
                border: 0,
                background: 'transparent',
                height: 10,
                width: 10,
            }}
        >
            <IcTarget
                fontSize={'inherit'}
                color={'inherit'}
                style={{
                    opacity: 0.5,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    pointerEvents: 'none',
                    transform: 'translate(-50%,-50%)',
                }}
            />
        </Handle>
        <Box px={2} py={1}>
            <Typography variant={'body2'} component={'div'}>
                <InputBase
                    value={property?.name || ''}
                    className={'nodrag'}
                    placeholder={(!exists ? 'New ' : '') + 'Property'}
                    onKeyDown={e => {
                        if(!property) return
                        if(e.key === 'Backspace' || e.key === 'Delete') {
                            if(!markedDeletable && (property.name || '') === '') {
                                setMarkedDeletable(true)
                                window.setTimeout(() => {
                                    setMarkedDeletable(false)
                                }, 1400)
                            } else if(markedDeletable && property.name === '') {
                                deleteById(
                                    type, parentId,
                                    undefined,
                                    (data) => ({
                                        ...data,
                                        properties: (() => {
                                            let props = [...data.properties || []]
                                            props.splice(index, 1)
                                            return props
                                        })(),
                                    }),
                                    (con) =>
                                        (
                                            con.source === parentId &&
                                            ownHandleIds.out === con.sourceHandle
                                        ) || (
                                            con.target === parentId &&
                                            ownHandleIds.in === con.targetHandle
                                        ),
                                    (con) => {
                                        if(
                                            con.source === parentId &&
                                            ownHandleIds.out !== con.sourceHandle
                                        ) {
                                            const {action: handleAction, type: handleType, index: handleIndex} = parseHandleId(con.sourceHandle) || {}
                                            if(
                                                typeof handleIndex === 'undefined' ||
                                                handleType !== '_prop' ||
                                                handleAction !== 'out' ||
                                                handleIndex <= index
                                            ) {
                                                return undefined
                                            }
                                            return {
                                                ...con,
                                                source: con.source,
                                                sourceHandle: handleIds.out(handleIndex - 1),
                                                target: con.target,
                                                targetHandle: con.targetHandle,
                                            }
                                        }
                                        if(
                                            con.target === parentId &&
                                            ownHandleIds.in !== con.targetHandle
                                        ) {
                                            const {action: handleAction, type: handleType, index: handleIndex} = parseHandleId(con.targetHandle) || {}
                                            if(
                                                typeof handleIndex === 'undefined' ||
                                                handleType !== '_prop' ||
                                                handleAction !== 'in' ||
                                                handleIndex <= index
                                            ) {
                                                return undefined
                                            }
                                            return {
                                                ...con,
                                                source: con.source,
                                                sourceHandle: con.sourceHandle,
                                                target: con.target,
                                                targetHandle: handleIds.in(handleIndex - 1),
                                            }
                                        }

                                        return undefined
                                    }
                                )
                            }
                        }
                    }}
                    onChange={(e) =>
                        type && update(
                            type,
                            parentId,
                            (data: NodeEntityData) => ({
                                ...data,
                                properties: (() => {
                                    const p = [...data.properties || []]
                                    if(index === -1) {
                                        p.splice(index, 0, {
                                            name: e.target.value,
                                            id: genId(8),
                                        })
                                    } else {
                                        p.splice(index, 1, {
                                            ...p[index],
                                            name: e.target.value,
                                        })
                                    }
                                    return p
                                })()
                            })
                        )
                    }
                    style={{
                        display: 'flex',
                        flexShrink: 1,
                        fontSize: 'inherit',
                        color: 'inherit',
                    }}
                    inputProps={{
                        size: 20,
                        width: 20,
                        style: {
                            minWidth: 75,
                            flex: 1,
                            padding: 0,
                        },
                    }}
                />
            </Typography>
        </Box>
        <Handle
            type="source"
            // @ts-ignore
            position={'right'}
            id={ownHandleIds.out}
            isValidConnection={(connection) => {
                //console.log('isValidConnection', connection)
                //setConnecting(connection)
                return true
            }}
            isConnectable={connectable}
            //onConnect={e => setConnecting(e)}
            style={{
                //background: '#555555',
                pointerEvents: exists ? undefined : 'none',
                visibility: exists ? undefined : 'hidden',
                display: 'flex',
                border: 0,
                background: 'transparent',
                height: 10,
                width: 10,
            }}
        >
            <IcSource
                fontSize={'inherit'}
                color={'inherit'}
                style={{
                    opacity: 0.5,
                    position: 'absolute',
                    top: '50%',
                    right: '50%',
                    pointerEvents: 'none',
                    transform: 'translate(50%,-50%)',
                }}
            />
        </Handle>
    </Box>
}
export const NodeEntityProperty = memo(NodeEntityPropertyBase)
