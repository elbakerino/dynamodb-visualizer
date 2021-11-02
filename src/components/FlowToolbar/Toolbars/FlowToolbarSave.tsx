import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import { CircularProgress } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import IcCheck from '@material-ui/icons/Check'
import React from 'react'
import { DesignerFlowState } from '../../Designer/DesignerEntities'
import { ExplorerTableHandlerSave } from '../../../feature/DynamoTables'
import { useFlowState } from '../../FlowState/FlowContext'
import { FlowStateDataScopes } from '../../FlowState/FlowTypes'
import { buildLayerList } from '../../FlowState/buildLayerList'

export const FlowToolbarSave: React.ComponentType<{
    activeTable: string | undefined
    save: ExplorerTableHandlerSave
}> = (
    {activeTable, save}
) => {
    const flowState = useFlowState<FlowStateDataScopes>()
    const [saving, setSaving] = React.useState<number>(0)
    return <>
        <Box
            // this sizing enforces a safe zone around SAVE, so no chart interaction happens unseens just before saving
            mx={1} p={1}
            style={{
                display: 'flex',
                position: 'absolute',
                zIndex: 2,
                bottom: 0,
                left: 0,
            }}
        >
            <Button
                size={'medium'} style={{marginTop: 4}}
                disabled={saving === 1 || saving === 2}
                onClick={() => {
                    if(!activeTable) return
                    setSaving(1)
                    const {entity, ...data} = (flowState.get('data') as DesignerFlowState['data'])
                    save(activeTable, {
                        // @ts-ignore
                        entities: {
                            entity_definitions: (flowState.get('data') as DesignerFlowState['data']).entity,
                            // @ts-ignore
                            flow_cards: data,
                            flow_view: (flowState.get('view') as DesignerFlowState['view']),
                            // todo: add `buildLayerFromViewList` and respective support in `buildViewList` for reverting
                            //flow_layers: (flowState.get('view') as DesignerFlowState['viewList']),
                            flow_connections: (flowState.get('connections') as DesignerFlowState['connections']),
                            flow_layers: buildLayerList(flowState.get('viewList') as DesignerFlowState['viewList']),
                        }
                    }).then((res) => {
                        if(res) {
                            setSaving(2)
                            window.setTimeout(() => {
                                setSaving(0)
                            }, 1700)
                        } else {
                            setSaving(3)
                        }
                    })
                }}
            >save</Button>

            {saving === 1 ? <CircularProgress size={30}/> : null}

            {saving === 2 ? <Typography variant={'body2'} style={{marginLeft: 6}}><IcCheck fontSize={'inherit'}/> saved</Typography> : null}
        </Box>
    </>
}
