import React, { memo } from 'react'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import InputBase from '@material-ui/core/InputBase'
import IcAdd from '@material-ui/icons/Add'
import { DesignerFlowStateDataScopes } from '../DesignerEntities'
import { FlowNodeType, FlowStateData, NodeData } from '../../FlowState/FlowTypes'
import { useFlowActions } from '../../FlowState/FlowContext'
import { useResponsiveInput } from '../../FlowNodeHelper/useResponsiveInput'
import { genId } from '../../../lib/genId'
import { NodeEntityProperty } from './FlowNodeEntityProperty'
import { NodeBox, NodeBoxContent } from '../../FlowNodeBox'
import { NodeTagOuter } from '../../FlowNodeHelper/NodeTagOuter'
import IcGear from '@material-ui/icons/Settings'
import { FlowNodeEntityOptions } from './FlowNodeEntityOptions'
import { FlowStateNodeProvider, flowStateNodeSelector, selectFlowState } from '../../FlowState/FlowStateNode'

export interface NodeEntityPropertyType {
    name: string
    id: string
}

export interface NodeEntityDataOptions {
    rowStrategy?: string
    collectionStrategy?: string
    entityIdentification?: EntityOptionsIdentification
}

export interface NodeEntityData extends NodeData {
    label?: string
    properties?: NodeEntityPropertyType[]
    options?: NodeEntityDataOptions
}

export interface EntityOptionsIdentification {
    pi: EntityOptionsIdentificationRuleSet
    gsi: {
        [indexName: string]: EntityOptionsIdentificationRuleSet
    }
}

export interface EntityOptionsIdentificationRuleSet {
    // partition key
    pk?: EntityOptionsIdentificationRule[]
    // sort key
    sk?: EntityOptionsIdentificationRule[]
}

export interface EntityOptionsIdentificationRule {
    match?: string
    value?: string
    indexName?: string
}

export type FlowNodeEntityBaseProps = Omit<FlowNodeType<DesignerFlowStateDataScopes, 'entity'>, 'position' | 'data'> & EntityDataSelectorProps
const FlowNodeEntityBase: React.ComponentType<FlowNodeEntityBaseProps> = (
    {
        connectable, isDragging,
        id, type, draggable, isHidden, selectable,
        selected,
        label, properties, _view,
    }
) => {
    const [focus, setFocus] = React.useState(false)
    const [openOptions, setOpenOptions] = React.useState(false)
    const {width, getWidth} = useResponsiveInput(label || '')
    const {update, deleteById} = useFlowActions<DesignerFlowStateDataScopes>()
    React.useEffect(() => {
        if(!selected) {
            setFocus(false)
        }
    }, [selected, setFocus])
    const inpWidth = getWidth(width)
    const props: (NodeEntityPropertyType | undefined)[] = [...properties || []]
    if(selected) {
        props.push(undefined)
    }

    return <NodeBox
        isDragging={isDragging}
    >
        <NodeTagOuter
            label={'Entity'}
            highlight={focus}
        />

        <NodeTagOuter
            label={<IcGear/>}
            onClick={() => setOpenOptions(o => !o)}
            position={'left'}
            highlight={focus}
            style={{
                cursor: 'pointer',
                pointerEvents: focus ? undefined : 'none',
            }}
        />

        <FlowNodeEntityOptions
            open={openOptions}
            setOpen={setOpenOptions}
            update={update}
            type={type}
            id={id}
        />

        <NodeBoxContent
            type={type} id={id}
            selected={selected}
            onFocus={setFocus}
            py={1}
            {..._view || {}}
        >
            {/*<Handle
                type="target"
                // @ts-ignore
                position="top"
                id={'_entity-' + id + '__in'}
                style={{
                    background: '#555555',
                    padding: 3,
                }}
                onConnect={(connection) => console.log('handle onConnect', connection)}
                isConnectable={connectable}
            />*/}

            <Box px={1} style={{display: 'flex', minWidth: 50}}>
                <InputBase
                    value={label || ''}
                    autoFocus={!label}
                    className={'nodrag'}
                    onChange={(e) =>
                        type && update(
                            type,
                            id,
                            (data) => ({
                                ...data,
                                label: e.target.value,
                            })
                        )
                    }
                    style={{
                        color: 'inherit',
                        display: 'flex',
                        flexShrink: 1,
                        flexGrow: 1,
                        //fontWeight: data?._view?.fontWeight,
                    }}
                    inputProps={{
                        size: 20,
                        width: 20,
                        style: {
                            width: inpWidth,
                            minWidth: 75,
                            flex: 1,
                        },
                    }}
                />
                {focus && false ? <Button
                    style={{
                        minWidth: 30,
                        marginLeft: 'auto',
                    }}
                    onClick={() =>
                        type && update(
                            type,
                            id,
                            data => ({
                                ...data,
                                properties: [
                                    ...(data.properties || []),
                                    {
                                        name: '',
                                        id: genId(8),
                                    }
                                ],
                            })
                        )
                    }
                >
                    <IcAdd/>
                </Button> : null}
            </Box>

            <Box pt={(props?.length || 0) > 0 ? 1 : 0}>
                {props?.map((property, i) =>
                    <NodeEntityProperty
                        key={property?.id || i} index={i}
                        property={property}
                        parentId={id}
                        type={type}
                        connectable={connectable}
                        update={update}
                        deleteById={deleteById}
                    />
                )}
            </Box>

            {/*<Handle
                type="source"
                // @ts-ignore
                position="bottom"
                id={'_entity-' + id + '__out'}
                style={{
                    background: '#555555',
                    padding: 3,
                }}
                onConnect={(params) => console.log('handle onConnect', params)}
                isConnectable={connectable}
            />*/}
        </NodeBoxContent>
    </NodeBox>
}

// @ts-ignore
export const NodeEntity: React.ComponentType<Omit<FlowNodeType<DesignerFlowStateDataScopes, 'entity'>>> = ({xPos, yPos, data, ...props}) => {
    return <FlowStateNodeProvider data={data}>
        <NodeEntityBaseMemo {...props}/>
    </FlowStateNodeProvider>
}

export interface EntityDataSelectorProps<SD extends FlowStateData<DesignerFlowStateDataScopes, 'entity'> = FlowStateData<DesignerFlowStateDataScopes, 'entity'>> {
    _view: SD['_view']
    label: SD['_data']['label']
    properties: SD['_data']['properties']
}

const selector: flowStateNodeSelector<FlowStateData<DesignerFlowStateDataScopes, 'entity'>, EntityDataSelectorProps> = (
    data,
    view,
) => ({
    _view: view,
    label: data?.label,
    properties: data?.properties ? [...data.properties] : []
})

export const NodeEntityBaseMemo = selectFlowState<EntityDataSelectorProps, FlowStateData<DesignerFlowStateDataScopes, 'entity'>, FlowNodeEntityBaseProps>(selector, memo(FlowNodeEntityBase))
