import Box from '@material-ui/core/Box'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import React, { memo } from 'react'
import { FlowNodeType } from '../../../FlowState/FlowTypes'
import { DesignerFlowStateDataScopes } from '../../DesignerEntities'
import { FlowContextActionsType } from '../../../FlowState/FlowContext'
import { EntityOptionsIdentification, EntityOptionsIdentificationRuleSet } from '../FlowNodeEntity'
import IconButton from '@material-ui/core/IconButton'
import { DynamoDbSchemaTable } from '../../../../feature/DynamoTables'
import IcDelete from '@material-ui/icons/Delete'
import { EntityIdentificationRuleSetKey } from './EntityIdentificationRuleSetKey'

const EntityIdentificationRuleSetBase: React.ComponentType<{
    ruleSet: EntityOptionsIdentificationRuleSet | undefined
    keySchema: DynamoDbSchemaTable['KeySchema'] | undefined
    update: FlowContextActionsType<DesignerFlowStateDataScopes>['update']
    indexName?: string
} & Pick<FlowNodeType<DesignerFlowStateDataScopes, 'entity'>, 'id' | 'type'>> = (
    {
        ruleSet,
        update,
        keySchema,
        id, type,
        indexName,
    }
) => {
    const {pk, sk} = ruleSet || {}
    return <Paper variant={'outlined'}>
        <Box m={2} mb={2}>
            <EntityIdentificationRuleSetDelete
                indexName={indexName}
                update={update}
                type={type} id={id}
            />

            <EntityIdentificationRuleSetKey
                indexName={indexName}
                attributeName={(keySchema && keySchema[0] ? keySchema[0]?.AttributeName : undefined)}
                update={update}
                type={type} id={id}
                dataset={pk}
                ruleIndexType={'pk'}
            />

            <EntityIdentificationRuleSetKey
                indexName={indexName}
                attributeName={(keySchema && keySchema[1] ? keySchema[1]?.AttributeName : undefined)}
                update={update}
                type={type} id={id}
                dataset={sk}
                ruleIndexType={'sk'}
            />
        </Box>
    </Paper>
}
export const EntityIdentificationRuleSet = memo(EntityIdentificationRuleSetBase)

const EntityIdentificationRuleSetDeleteBase = (
    {
        type, id,
        update,
        indexName,
    }: {
        indexName: string | undefined
        update: FlowContextActionsType<DesignerFlowStateDataScopes>['update']
    } & Pick<FlowNodeType<DesignerFlowStateDataScopes, 'entity'>, 'id' | 'type'>
): React.ReactElement | null => {
    return indexName ? <Box style={{display: 'flex'}}>
        <Typography
            gutterBottom
            variant={'body1'}
        >Index: <strong>{indexName}</strong></Typography>
        <IconButton
            size={'small'}
            style={{marginLeft: 'auto'}}
            onClick={() =>
                type && update(
                    type,
                    id,
                    (data) => {
                        return {
                            ...data,
                            options: {
                                ...(data.options || {}),
                                entityIdentification: {
                                    ...(data.options?.entityIdentification || {}) as EntityOptionsIdentification,
                                    ...(typeof indexName !== 'undefined' ? {
                                        gsi: (() => {
                                            const gsiNext = {...(data.options?.entityIdentification?.gsi || {})} as EntityOptionsIdentification['gsi']
                                            if(indexName in gsiNext) {
                                                delete gsiNext[indexName]
                                            }
                                            return gsiNext
                                        })()
                                    } : {}),
                                },
                            },
                        }
                    }
                )
            }
        ><IcDelete/></IconButton>
    </Box> : null
}

const EntityIdentificationRuleSetDelete = memo(EntityIdentificationRuleSetDeleteBase)
