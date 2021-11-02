import Box from '@material-ui/core/Box'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import Typography from '@material-ui/core/Typography'
import React, { memo } from 'react'
import { FlowNodeType, FlowStateData } from '../../../FlowState/FlowTypes'
import { DesignerFlowStateDataScopes } from '../../DesignerEntities'
import { FlowContextActionsType } from '../../../FlowState/FlowContext'
import { EntityOptionsIdentification, EntityOptionsIdentificationRuleSet, NodeEntityDataOptions } from '../FlowNodeEntity'
import { useDynamoTables } from '../../../../feature/DynamoTables'
import IcAdd from '@material-ui/icons/Add'
import { usePageTable } from '../../../PageDynamoTable'
import { useUID } from 'react-uid'
import { EntityIdentificationRuleSet } from './EntityIdentificationRuleSet'
import { flowStateNodeSelector, selectFlowState } from '../../../FlowState/FlowStateNode'

export interface EntityIdentificationBaseProps extends Pick<FlowNodeType<DesignerFlowStateDataScopes, 'entity'>, 'id' | 'type'>, FlowNodeEntityOptionsIdentificationSelectorProps {
    update: FlowContextActionsType<DesignerFlowStateDataScopes>['update']
}

const EntityIdentificationBase: React.ComponentType<EntityIdentificationBaseProps> = (
    {
        type, id, update,
        entityIdentification,
    }
) => {
    const uid = useUID()
    const {activeTable} = usePageTable()
    const {tableDetails} = useDynamoTables()
    const table = activeTable ? tableDetails.get(activeTable) : undefined
    const tableSchema = table?.schema
    const tableSchemaSchema = tableSchema?.schema
    const tableSchemaPrimaryIndex = tableSchemaSchema?.Table?.KeySchema
    const tableSchemaSecIndex = tableSchemaSchema?.Table?.GlobalSecondaryIndexes
    const {pi, gsi} = entityIdentification || {}
    return <Box mt={2}>
        <Box mb={2}>
            <Typography gutterBottom>Primary Index</Typography>

            <EntityIdentificationRuleSet
                ruleSet={pi}
                keySchema={tableSchemaPrimaryIndex}
                update={update}
                type={type}
                id={id}
            />
        </Box>
        <Box mb={2}>
            <Typography style={{display: 'flex', alignItems: 'center'}}>
                <span>GlobalSecondaryIndexes</span>
            </Typography>
            <FormControl style={{flexShrink: 0}} fullWidth>
                <InputLabel id={'ddv-' + uid + '-gsi_label'}>Select Index</InputLabel>
                <Select
                    labelId={'ddv-' + uid + '-gsi_label'}
                    id={'ddv-' + uid + '-gsi_select'}
                    value={''}
                    onChange={(e) =>
                        type && update(
                            type,
                            id,
                            (data) => ({
                                ...data,
                                options: {
                                    ...(data.options || {}),
                                    entityIdentification: {
                                        ...(data.options?.entityIdentification || {}) as EntityOptionsIdentification,
                                        gsi: {
                                            ...(data.options?.entityIdentification?.gsi || {}),
                                            [e.target.value as string]: [] as EntityOptionsIdentificationRuleSet
                                        }
                                    },
                                },
                            })
                        )
                    }
                    endAdornment={<IcAdd/>}
                >
                    {tableSchemaSecIndex?.map(si =>
                        <MenuItem
                            key={si.IndexName}
                            value={si.IndexName}
                            disabled={Object.keys(gsi || {}).findIndex(i => i === si.IndexName) !== -1}
                        >{si.IndexName}</MenuItem>
                    )}
                </Select>
            </FormControl>

            {gsi && Object.keys(gsi).map(indexName =>
                <Box mt={2} key={indexName}>
                    <EntityIdentificationRuleSet
                        ruleSet={gsi[indexName]}
                        keySchema={tableSchemaSecIndex?.find(si => si.IndexName === indexName)?.KeySchema}
                        indexName={indexName}
                        update={update}
                        type={type}
                        id={id}
                    />
                </Box>
            )}
        </Box>
    </Box>
}

export interface FlowNodeEntityOptionsIdentificationSelectorProps {
    entityIdentification?: NodeEntityDataOptions['entityIdentification']
}

const selector: flowStateNodeSelector<FlowStateData<DesignerFlowStateDataScopes, 'entity'>, FlowNodeEntityOptionsIdentificationSelectorProps> = (
    data,
) => ({
    entityIdentification: data?.options?.entityIdentification,
})

export const EntityIdentification = selectFlowState<FlowNodeEntityOptionsIdentificationSelectorProps, FlowStateData<DesignerFlowStateDataScopes, 'entity'>, EntityIdentificationBaseProps>(selector, memo(EntityIdentificationBase))
