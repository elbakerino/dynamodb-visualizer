import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import React, { memo } from 'react'
import { FlowNodeType } from '../../../FlowState/FlowTypes'
import { DesignerFlowStateDataScopes } from '../../DesignerEntities'
import { FlowContextActionsType } from '../../../FlowState/FlowContext'
import { EntityOptionsIdentification, EntityOptionsIdentificationRule, EntityOptionsIdentificationRuleSet } from '../FlowNodeEntity'
import IcAdd from '@material-ui/icons/Add'
import FormControl from '@material-ui/core/FormControl'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import TextField from '@material-ui/core/TextField'
import IcDelete from '@material-ui/icons/Delete'
import { useUID } from 'react-uid'

const EntityIdentificationRuleSetKeyBase = <I extends 'pk' | 'sk' = 'pk' | 'sk'>(
    {
        type, id,
        update,
        indexName,
        attributeName,
        ruleIndexType,
        dataset,
    }: {
        ruleIndexType: I
        dataset: EntityOptionsIdentificationRuleSet[I]
        indexName: string | undefined
        attributeName: string | undefined
        update: FlowContextActionsType<DesignerFlowStateDataScopes>['update']
    } & Pick<FlowNodeType<DesignerFlowStateDataScopes, 'entity'>, 'id' | 'type'>
): React.ReactElement => {
    return <Box mt={2} mb={2}>
        <Typography gutterBottom variant={'body1'} style={{fontWeight: 'bold', display: 'flex'}}>
            <IconButton
                size={'small'}
                style={{margin: 'auto 0'}}
                onClick={() =>
                    type && update(
                        type,
                        id,
                        (data) => {
                            const updaterRuleSet = ((ruleSet: EntityOptionsIdentificationRule[] = []) => {
                                const rs = [...ruleSet]
                                if(typeof indexName === 'undefined') {
                                    rs.push({})
                                } else {
                                    rs.push({
                                        indexName: indexName,
                                    })
                                }
                                return rs
                            })
                            return {
                                ...data,
                                options: {
                                    ...(data.options || {}),
                                    entityIdentification: {
                                        ...(data.options?.entityIdentification || {}) as EntityOptionsIdentification,
                                        ...(typeof indexName === 'undefined' ? {
                                            pi: {
                                                ...(data.options?.entityIdentification?.pi || {}) as EntityOptionsIdentification['pi'],
                                                [ruleIndexType]: updaterRuleSet(
                                                    data.options?.entityIdentification?.pi &&
                                                    data.options?.entityIdentification?.pi[ruleIndexType] ?
                                                        data.options?.entityIdentification?.pi[ruleIndexType] :
                                                        undefined
                                                ),
                                            }
                                        } : {}),
                                        ...(typeof indexName !== 'undefined' ? {
                                            gsi: {
                                                ...(data.options?.entityIdentification?.gsi || {}) as EntityOptionsIdentification['gsi'],
                                                [indexName]: {
                                                    ...(data.options?.entityIdentification?.gsi ?
                                                        data.options?.entityIdentification?.gsi[indexName] || {} : {}) as EntityOptionsIdentificationRuleSet,
                                                    [ruleIndexType]: updaterRuleSet(
                                                        data.options?.entityIdentification?.gsi[indexName] &&
                                                        data.options?.entityIdentification?.gsi[indexName][ruleIndexType] ?
                                                            data.options?.entityIdentification?.gsi[indexName][ruleIndexType] :
                                                            undefined
                                                    ),
                                                } as EntityOptionsIdentificationRuleSet
                                            } as EntityOptionsIdentification['gsi']
                                        } : {}),
                                    },
                                },
                            }
                        }
                    )
                }
            ><IcAdd/></IconButton>
            <Box ml={1} component={'span'}>
                {attributeName || <i>missing in schema</i>}
                <Typography variant={'overline'} style={{display: 'block', lineHeight: 1}}>
                    {ruleIndexType === 'pk' ? 'Partition Key' :
                        ruleIndexType === 'sk' ? 'Sort Key' : 'Unkown index: ' + ruleIndexType}
                </Typography>
            </Box>
        </Typography>
        <Box mt={2} mb={4}>
            <Grid container direction={'column'} spacing={2}>
                {dataset && dataset.map((r, i) => <EntityIdentificationRule
                    key={i}
                    rule={r}
                    ruleIndex={i}
                    isLast={i === (dataset.length - 1)}
                    type={type} id={id}
                    update={update}
                    ruleIndexType={ruleIndexType}
                />)}
            </Grid>
        </Box>
    </Box>
}
export const EntityIdentificationRuleSetKey = memo(EntityIdentificationRuleSetKeyBase)

const EntityIdentificationRuleBase = <I extends 'pk' | 'sk' = 'pk' | 'sk'>(
    {
        type, id,
        update,
        ruleIndex,
        rule,
        isLast,
        ruleIndexType,
    }: {
        rule: EntityOptionsIdentificationRule
        ruleIndex: number
        isLast: boolean
        update: FlowContextActionsType<DesignerFlowStateDataScopes>['update']
        ruleIndexType: I
    } & Pick<FlowNodeType<DesignerFlowStateDataScopes, 'entity'>, 'id' | 'type'>
) => {
    const uid = useUID()

    const onChange = (updateRule: (r: EntityOptionsIdentificationRule) => EntityOptionsIdentificationRule | undefined) =>
        type && update(
            type,
            id,
            (data) => {
                const updateOrDeleteRuleSet = ((ruleSet: EntityOptionsIdentificationRule[] = []) => {
                    const rs = [...ruleSet]
                    const nextValue = updateRule(rs[ruleIndex])
                    if(typeof nextValue === 'undefined') {
                        rs.splice(ruleIndex, 1)
                    } else {
                        rs.splice(ruleIndex, 1, nextValue)
                    }
                    return rs
                })
                return {
                    ...data,
                    options: {
                        ...(data.options || {}),
                        entityIdentification: {
                            ...(data.options?.entityIdentification || {}) as EntityOptionsIdentification,
                            ...(typeof rule.indexName === 'undefined' ? {
                                pi: {
                                    ...(data.options?.entityIdentification?.pi || {}) as EntityOptionsIdentification['pi'],
                                    [ruleIndexType]: updateOrDeleteRuleSet(
                                        data.options?.entityIdentification?.pi &&
                                        data.options?.entityIdentification?.pi[ruleIndexType] ?
                                            data.options?.entityIdentification?.pi[ruleIndexType] :
                                            undefined
                                    ),
                                }
                            } : {}),
                            ...(typeof rule.indexName !== 'undefined' ? {
                                gsi: {
                                    ...(data.options?.entityIdentification?.gsi || {}) as EntityOptionsIdentification['gsi'],
                                    [rule.indexName]: {
                                        ...(data.options?.entityIdentification?.gsi ?
                                            data.options?.entityIdentification?.gsi[rule.indexName] || {} : {}) as EntityOptionsIdentificationRuleSet,
                                        [ruleIndexType]: updateOrDeleteRuleSet(
                                            data.options?.entityIdentification?.gsi[rule.indexName] &&
                                            data.options?.entityIdentification?.gsi[rule.indexName][ruleIndexType] ?
                                                data.options?.entityIdentification?.gsi[rule.indexName][ruleIndexType] :
                                                undefined
                                        ),
                                    } as EntityOptionsIdentificationRuleSet
                                } as EntityOptionsIdentification['gsi']
                            } : {}),
                        },
                    },
                }
            }
        )
    return <>
        <Grid item>
            <Grid container spacing={2} direction={'row'} style={{display: 'flex', flexWrap: 'wrap'}}>
                <Grid item xs={12} sm={4} md={2}>
                    <FormControl style={{flexShrink: 0}} fullWidth>
                        <InputLabel id={'ddv--' + uid + '_label'}>Match Type</InputLabel>
                        <Select
                            labelId={'ddv--' + uid + '_label'}
                            id={'ddv--' + uid + '_select'}
                            value={rule.match || ''}
                            onChange={(e) =>
                                onChange((rs) => ({
                                    ...rs,
                                    match: e.target.value as string,
                                }))
                            }
                        >
                            <MenuItem value={'='}>=</MenuItem>
                            <MenuItem value={'≠'}>≠</MenuItem>
                            <MenuItem value={'<'}>&lt;</MenuItem>
                            <MenuItem value={'>'}>&gt;</MenuItem>
                            <MenuItem value={'<='}>&lt;=</MenuItem>
                            <MenuItem value={'>='}>&gt;=</MenuItem>
                            <MenuItem value={'begins_with'}>BEGINS WITH</MenuItem>
                            <MenuItem value={'ends_with'}>ENDS WITH</MenuItem>
                            <MenuItem value={'contains'}>CONTAINS</MenuItem>
                            <MenuItem value={'exists'}>EXISTS</MenuItem>
                            <MenuItem value={'not_exists'}>NOT EXISTS</MenuItem>
                            <MenuItem value={'empty'}>EMPTY</MenuItem>
                            <MenuItem value={'not_empty'}>NOT EMPTY</MenuItem>
                            {/*<MenuItem value={'regex'}>regex</MenuItem>*/}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item style={{flexGrow: 1}}>
                    <TextField
                        label={'Value'}
                        fullWidth
                        value={rule.value || ''}
                        onChange={(e) =>
                            onChange((rs) => ({
                                ...rs,
                                value: e.target.value as string,
                            }))
                        }
                    />
                </Grid>
                <Grid item style={{marginLeft: 'auto', marginTop: 'auto'}}>
                    <IconButton
                        size={'small'}
                        onClick={() =>
                            onChange(() => undefined)
                        }
                    ><IcDelete/></IconButton>
                </Grid>
            </Grid>
        </Grid>
        {isLast ? null : <Grid item style={{paddingTop: 0, paddingBottom: 0, marginLeft: -8, opacity: 0.6}}>
            <Typography variant={'overline'}>and</Typography>
        </Grid>}
    </>
}

const EntityIdentificationRule = memo(EntityIdentificationRuleBase)
