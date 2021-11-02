import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import IcCheck from '@material-ui/icons/Check'
import { InputTextJson } from '../InputTextJson'
import { Badge, Button, CircularProgress, FormControl, FormHelperText, IconButton, InputBase, InputLabel, MenuItem, Paper, Select, TextField } from '@material-ui/core'
import React, { memo } from 'react'
import { DynamoDbGlobalSecondaryIndex, DynamoDbInspectResult, DynamoDbSchemaTable, ExplorerTableHandlerSave, useDynamoTables } from '../../feature/DynamoTables'
import { useUID } from 'react-uid'
import { Autocomplete } from '@material-ui/lab'
import { fromJS, Map } from 'immutable'
import IcDelete from '@material-ui/icons/Delete'
import IcSort from '@material-ui/icons/Sort'
import IcAdd from '@material-ui/icons/Add'
import IcToggleOff from '@material-ui/icons/ToggleOff'
import IcToggleOn from '@material-ui/icons/ToggleOn'
import IcInfo from '@material-ui/icons/Info'

const DesignerSchemaRaw: React.ComponentType<{
    activeTable: string | undefined
    schema: DesignerSchemaState
    save: ExplorerTableHandlerSave
    setDesignerSchema: setDesignerSchemaState
}> = ({schema, activeTable, save, setDesignerSchema}) => {
    return <InputTextJson
        label={'Schema as JSON'}
        value={schema.toJS()}
        onChange={(newValue) => {
            if(!activeTable) return
            setDesignerSchema(Map(newValue || {}) as DesignerSchemaState)
        }}
    />
}

const DesignerSchemaNormal: React.ComponentType<{
    activeTable: string | undefined
    schema: DesignerSchemaState
    setDesignerSchema: setDesignerSchemaState
    save: ExplorerTableHandlerSave
}> = ({schema, activeTable, save, setDesignerSchema}) => {
    // todo: wrap needed for mobile, but for desktop this breaks the scrolling
    return <Box style={{flexGrow: 1, height: '100%', display: 'flex'/*, flexWrap: 'wrap'*/, minWidth: 750, maxWidth: 900, margin: '0 auto'}}>
        <Box ml={2} style={{flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', flexBasis: '50%'}}>
            <Box mr={2}>
                <Box mb={2}>
                    <TextField
                        value={schema.getIn(['Table', 'TableName']) || ''}
                        onChange={e => setDesignerSchema(s => s.setIn(['Table', 'TableName'], e.target.value))}
                        label={'TableName'}
                        fullWidth
                        helperText={'Used for e.g. scan requests'}
                    />
                </Box>
            </Box>

            <Box my={2} mr={2}>
                <Typography style={{display: 'flex', alignItems: 'center'}} gutterBottom>
                    <span>AttributeDefinitions</span>

                    <IconButton
                        size={'small'} style={{margin: 'auto 0 auto auto'}}
                        onClick={() =>
                            setDesignerSchema(s =>
                                s.updateIn(['Table', 'AttributeDefinitions'], (idx) => {
                                    const idx2: DynamoDbSchemaTable['AttributeDefinitions'] = [...(idx as DynamoDbSchemaTable['AttributeDefinitions'] || [])]
                                    return idx2.sort((a, b) => a.AttributeName.localeCompare(b.AttributeName))
                                })
                            )
                        }
                    >
                        <IcSort/>
                    </IconButton>
                    <IconButton
                        size={'small'} style={{margin: 'auto 0 auto 8px'}}
                        onClick={() =>
                            setDesignerSchema(s =>
                                s.updateIn(['Table', 'AttributeDefinitions'], (idx) => {
                                    idx = [...(idx as any[] || [])] as DynamoDbSchemaTable['AttributeDefinitions']
                                    // @ts-ignore
                                    idx.splice(0, 0, {AttributeName: ''})
                                    return idx
                                })
                            )
                        }
                    >
                        <IcAdd/>
                    </IconButton>
                </Typography>
                {(schema.getIn(['Table', 'AttributeDefinitions']) as DynamoDbSchemaTable['AttributeDefinitions'] || [])
                    .map((item, i) =>
                        <DesignerSchemaAttributeDefinition
                            key={i} item={item} index={i}
                            setDesignerSchema={setDesignerSchema}
                            // @ts-ignore
                            duplicate={
                                (schema.getIn(['Table', 'AttributeDefinitions']) as DynamoDbSchemaTable['AttributeDefinitions'] || []).reduce(
                                    (duplicate, attr, i2) =>
                                        // @ts-ignore
                                        duplicate || (attr.AttributeName === item.AttributeName && i !== i2)
                                    , false
                                )
                            }
                        />
                    )}
            </Box>
        </Box>
        <Box ml={2} style={{overflow: 'auto', flexGrow: 1, flexBasis: '50%'}}>
            <Box mb={2} mr={2}>
                <Typography gutterBottom>Primary Index</Typography>

                <Paper variant={'outlined'}>
                    <Box m={2}>
                        <Box mt={1} mb={2}>
                            <Typography gutterBottom variant={'body2'}>Partition Key</Typography>
                            <Box style={{display: 'flex'}}>
                                <GlobalSecondaryIndexAttributeName
                                    setDesignerSchema={setDesignerSchema}
                                    attributes={schema.getIn(['Table', 'AttributeDefinitions']) as DynamoDbSchemaTable['AttributeDefinitions']}
                                    keys={['Table', 'KeySchema', 0, 'AttributeName']}
                                    value={schema.getIn(['Table', 'KeySchema', 0, 'AttributeName']) as string || ''}
                                />
                                <SelectKeyType
                                    setDesignerSchema={setDesignerSchema}
                                    keys={['Table', 'KeySchema', 0, 'KeyType']}
                                    value={schema.getIn(['Table', 'KeySchema', 0, 'KeyType']) as string || ''}
                                />
                            </Box>
                        </Box>
                        <Box mt={1} mb={2}>
                            <Typography gutterBottom variant={'body2'} style={{display: 'flex'}}>
                                <span>Sort Key</span>
                                <IconButton
                                    size={'small'} style={{margin: 'auto 3px auto auto', padding: 0}}
                                    onClick={() =>
                                        setDesignerSchema(s =>
                                            s.updateIn(['Table', 'KeySchema'], (idx) => {
                                                idx = [...(idx as any[] || [])] as DynamoDbSchemaTable['KeySchema']
                                                // @ts-ignore
                                                if(idx[1]) {
                                                    // @ts-ignore
                                                    idx.splice(1, 1)
                                                } else {
                                                    // @ts-ignore
                                                    if(idx.length === 0) {
                                                        // @ts-ignore
                                                        idx.push({})
                                                    }
                                                    // @ts-ignore
                                                    idx.push({})
                                                }
                                                return idx
                                            })
                                        )
                                    }
                                >
                                    {schema.getIn(['Table', 'KeySchema', 1]) ? <IcToggleOn/> : <IcToggleOff/>}
                                </IconButton>
                            </Typography>
                            {schema.getIn(['Table', 'KeySchema', 1]) ?
                                <Box style={{display: 'flex'}}>
                                    <GlobalSecondaryIndexAttributeName
                                        setDesignerSchema={setDesignerSchema}
                                        attributes={schema.getIn(['Table', 'AttributeDefinitions']) as DynamoDbSchemaTable['AttributeDefinitions']}
                                        keys={['Table', 'KeySchema', 1, 'AttributeName']}
                                        value={schema.getIn(['Table', 'KeySchema', 1, 'AttributeName']) as string || ''}
                                    />
                                    <SelectKeyType
                                        setDesignerSchema={setDesignerSchema}
                                        keys={['Table', 'KeySchema', 1, 'KeyType']}
                                        value={schema.getIn(['Table', 'KeySchema', 1, 'KeyType']) as string || ''}
                                    />
                                </Box>
                                : null}
                        </Box>
                        {schema.getIn(['Table', 'KeySchema', 0, 'AttributeName']) &&
                        schema.getIn(['Table', 'KeySchema', 0, 'AttributeName']) === schema.getIn(['Table', 'KeySchema', 1, 'AttributeName']) ?
                            <FormHelperText error>
                                Partition and sort key can not be the same.
                            </FormHelperText> : null}
                    </Box>
                </Paper>
            </Box>
            <Box mb={2} mr={2}>
                <Typography style={{display: 'flex', alignItems: 'center'}} gutterBottom>
                    <span>GlobalSecondaryIndexes</span>
                    <IconButton
                        size={'small'} style={{margin: 'auto 0 auto auto'}}
                        onClick={() =>
                            setDesignerSchema(s =>
                                s.updateIn(['Table', 'GlobalSecondaryIndexes'], (idx) => {
                                    idx = [...(idx as any[] || [])] as DynamoDbSchemaTable['GlobalSecondaryIndexes']
                                    // @ts-ignore
                                    idx.splice(0, 0, {
                                        IndexName: '',
                                        KeySchema: [
                                            {}
                                        ]
                                    })
                                    return idx
                                })
                            )
                        }
                    >
                        <IcAdd/>
                    </IconButton>
                </Typography>

                {(schema.getIn(['Table', 'GlobalSecondaryIndexes']) as DynamoDbSchemaTable['GlobalSecondaryIndexes'] || [])
                    .map((index, i) =>
                        <GlobalSecondaryIndex
                            key={i} index={index} i={i}
                            setDesignerSchema={setDesignerSchema}
                            attributes={schema.getIn(['Table', 'AttributeDefinitions']) as DynamoDbSchemaTable['AttributeDefinitions']}
                        />)}
            </Box>
        </Box>
    </Box>
}

const DesignerSchemaAttributeDefinitionBase: React.ComponentType<{
    index: number
    item: any
    duplicate: boolean
    setDesignerSchema: setDesignerSchemaState
}> = (
    {
        duplicate,
        index, item,
        setDesignerSchema
    }
) => {
    return <Box>
        <Box mt={1} mb={3} style={{display: 'flex'}}>
            <TextField
                value={item.AttributeName || ''}
                onChange={e => setDesignerSchema(s => s.setIn(['Table', 'AttributeDefinitions', index, 'AttributeName'], e.target.value.trim()))}
                label={'Name'}
                fullWidth
                error={duplicate || !item.AttributeName}
                helperText={
                    duplicate ? 'Duplicate name' :
                        !item.AttributeName ? 'Required' : null
                }
            />
            <SelectAttributeType
                value={item.AttributeType || ''}
                setType={(type) => setDesignerSchema(s =>
                    s.setIn(['Table', 'AttributeDefinitions', index, 'AttributeType'], type)
                )}
            />
            <IconButton
                size={'small'} style={{margin: 'auto 0 auto auto'}}
                onClick={() =>
                    setDesignerSchema(s =>
                        s.updateIn(['Table', 'AttributeDefinitions'], (idx) => {
                            idx = [...(idx as any[] || [])] as DynamoDbSchemaTable['AttributeDefinitions']
                            // @ts-ignore
                            idx.splice(index, 1)
                            return idx
                        })
                    )
                }
            >
                <IcDelete/>
            </IconButton>
        </Box>
    </Box>
}
const DesignerSchemaAttributeDefinition = memo(DesignerSchemaAttributeDefinitionBase)

const GlobalSecondaryIndexBase: React.ComponentType<{
    index: DynamoDbGlobalSecondaryIndex
    setDesignerSchema: setDesignerSchemaState
    attributes: DynamoDbSchemaTable['AttributeDefinitions']
    i: number
}> = ({index, setDesignerSchema, attributes, i}) => {
    const sameKeysError = Boolean(index.KeySchema && index.KeySchema[0] && index.KeySchema[1] && index.KeySchema[0].AttributeName && index.KeySchema[0].AttributeName === index.KeySchema[1].AttributeName)
    return <Paper variant={'outlined'} style={{marginBottom: 9}}>
        <Box mt={1} mr={2} mb={2} ml={2}>
            <Box mb={2} ml={-1} style={{display: 'flex', alignContent: 'center'}}>
                <Badge
                    color={'error'} invisible={Boolean(index.IndexName)}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    variant={'dot'}
                >
                    <InputBase
                        //size={'small'}
                        type={'text'}
                        value={index.IndexName || ''}
                        error={!index.IndexName}
                        placeholder={'IndexName'}
                        onChange={e =>
                            setDesignerSchema(s =>
                                s.setIn(['Table', 'GlobalSecondaryIndexes', i, 'IndexName'], e.target.value)
                            )
                        }
                    />
                </Badge>

                <IconButton
                    size={'small'} style={{marginLeft: 'auto'}}
                    onClick={() =>
                        setDesignerSchema(s =>
                            s.updateIn(['Table', 'GlobalSecondaryIndexes'], (idx) => {
                                idx = [...(idx as any[] || [])] as DynamoDbSchemaTable['GlobalSecondaryIndexes']
                                // @ts-ignore
                                idx.splice(i, 1)
                                return idx
                            })
                        )
                    }
                >
                    <IcDelete/>
                </IconButton>
            </Box>
            <Box mt={1} mb={2}>
                <Typography gutterBottom variant={'body2'}>Partition Key</Typography>
                <Box style={{display: 'flex'}}>
                    <GlobalSecondaryIndexAttributeName
                        setDesignerSchema={setDesignerSchema}
                        attributes={attributes}
                        keys={['Table', 'GlobalSecondaryIndexes', i, 'KeySchema', 0, 'AttributeName']}
                        value={index.KeySchema && index.KeySchema[0]?.AttributeName ? index.KeySchema[0]?.AttributeName : ''}
                        error={sameKeysError}
                    />
                    <SelectKeyType
                        setDesignerSchema={setDesignerSchema}
                        keys={['Table', 'GlobalSecondaryIndexes', i, 'KeySchema', 0, 'KeyType']}
                        value={index.KeySchema && index.KeySchema[0]?.KeyType ? index.KeySchema[0]?.KeyType : ''}
                    />
                </Box>
            </Box>

            <Box mt={1} mb={2}>
                <Typography gutterBottom variant={'body2'} style={{display: 'flex'}}>
                    <span>Sort Key</span>
                    <IconButton
                        size={'small'} style={{margin: 'auto 3px auto auto', padding: 0}}
                        onClick={() =>
                            setDesignerSchema(s =>
                                s.updateIn(['Table', 'GlobalSecondaryIndexes', i, 'KeySchema'], (idx = []) => {
                                    idx = [...(idx as any[] || [])] as DynamoDbGlobalSecondaryIndex['KeySchema']
                                    // @ts-ignore
                                    if(idx[1]) {
                                        // @ts-ignore
                                        idx.splice(1, 1)
                                    } else {
                                        // @ts-ignore
                                        idx.push({})
                                    }
                                    return idx
                                })
                            )
                        }
                    >
                        {index.KeySchema && index.KeySchema[1] ? <IcToggleOn/> : <IcToggleOff/>}
                    </IconButton>
                </Typography>

                {index.KeySchema && index.KeySchema[1] ?
                    <Box style={{display: 'flex'}}>
                        <GlobalSecondaryIndexAttributeName
                            setDesignerSchema={setDesignerSchema}
                            attributes={attributes}
                            keys={['Table', 'GlobalSecondaryIndexes', i, 'KeySchema', 1, 'AttributeName']}
                            value={index.KeySchema && index.KeySchema[1]?.AttributeName ? index.KeySchema[1]?.AttributeName as string : ''}
                            error={sameKeysError}
                        />
                        <SelectKeyType
                            setDesignerSchema={setDesignerSchema}
                            keys={['Table', 'GlobalSecondaryIndexes', i, 'KeySchema', 1, 'KeyType']}
                            value={index.KeySchema && index.KeySchema[1]?.KeyType ? index.KeySchema[1]?.KeyType : ''}
                        />
                    </Box>
                    : null}

                {sameKeysError ?
                    <FormHelperText error>
                        Partition and sort key can not be the same.
                    </FormHelperText> : null}
            </Box>
        </Box>
    </Paper>
}

const GlobalSecondaryIndex = memo(GlobalSecondaryIndexBase)

const GlobalSecondaryIndexAttributeName: React.ComponentType<{
    error?: boolean
    value: string
    keys: (string | number)[]
    attributes: DynamoDbSchemaTable['AttributeDefinitions'] | undefined
    setDesignerSchema: setDesignerSchemaState
}> = ({
          value,
          attributes,
          setDesignerSchema,
          keys,
          error,
      }) => {
    const [internalVal, setInternalVal] = React.useState('')
    React.useEffect(() => {
        setInternalVal(value)
    }, [value, setInternalVal])
    const uid = useUID()
    const exists = attributes?.find(attr => attr.AttributeName?.trim() === value.trim())
    return <Autocomplete
        freeSolo
        id={'dyn-' + uid + '_attr'}
        disableClearable
        fullWidth
        options={(attributes?.filter(attr => attr.AttributeName?.trim()) as ({ AttributeName: string, AttributeType: string } | { inputValue: string })[]) || []}
        value={value}
        inputValue={internalVal}
        onInputChange={(e, val) => {
            if(e && e.type !== 'click') {
                setInternalVal(val)
            }
        }}
        onBlur={() => {
            setInternalVal(value.trim())
        }}
        onChange={(event, newValue) => {
            if(typeof newValue === 'string') {
                // noop
            } else if(newValue && 'AttributeName' in newValue && newValue.AttributeName) {
                setDesignerSchema(s => s.setIn(keys, newValue.AttributeName))
            } else if(newValue && 'inputValue' in newValue && newValue.inputValue) {
                setDesignerSchema(s => {
                    return s
                        .setIn(keys, newValue.inputValue)
                        .updateIn(['Table', 'AttributeDefinitions'], (attrDefs) => {
                            const newAttrDefs = [...(attrDefs as DynamoDbSchemaTable['AttributeDefinitions'] || [])]
                            newAttrDefs.push({
                                AttributeName: newValue.inputValue,
                                AttributeType: 'S',
                            })
                            return newAttrDefs
                        })
                })
            }
        }}
        filterOptions={(options: ({ AttributeName: string, AttributeType: string } | { inputValue: string })[], params) => {
            const {inputValue} = params
            // todo: check why `inputValue` is empty on first mount/without user change
            const currentValue = inputValue || value
            const filtered = options.filter(
                attr =>
                    !inputValue.trim() ||
                    ('AttributeName' in attr && attr.AttributeName ? attr.AttributeName : '').toLowerCase().indexOf(currentValue.toLowerCase().trim()) === 0
            ).sort(
                (a, b) =>
                    'AttributeName' in a && a.AttributeName && 'AttributeName' in b && b.AttributeName ?
                        a.AttributeName.localeCompare(b.AttributeName)
                        : 0
            )

            // Suggest the creation of a new value
            const exists = attributes?.find(attr => attr.AttributeName?.trim() === currentValue.trim())

            if(!exists && currentValue.trim()) {
                filtered.push({
                    inputValue: currentValue.trim(),
                })
            }

            return filtered
        }}
        getOptionLabel={(option) => {
            // Value selected with enter, right from the input
            if(typeof option === 'string') {
                return option
            }
            // Add "xxx" option created dynamically
            if('inputValue' in option && option.inputValue) {
                return 'Add attribute: `' + option.inputValue + '`'
            }

            if('AttributeName' in option && option.AttributeName) {
                return option.AttributeName + (option.AttributeType ? ' [' + option.AttributeType + ']' : '')
            }
            // Regular option
            return '?'
        }}
        //renderOption={(props, option) => <li {...props}>{option.title}</li>}
        renderInput={(params) => (
            <TextField
                {...params}
                label={'Name'}
                error={Boolean(!exists && (value || error))}
                helperText={
                    exists || !value ? undefined : 'No attribute found for name.'
                }
                InputProps={{
                    ...params.InputProps,
                    type: 'search',
                }}
            />
        )}
    />
}

const SelectKeyType: React.ComponentType<{
    value: string
    keys: (string | number)[]
    setDesignerSchema: setDesignerSchemaState
}> = ({value, setDesignerSchema, keys}) => {
    const uid = useUID()
    return <FormControl style={{width: 95, flexShrink: 0}} error={!value}>
        <InputLabel id={'dyn-' + uid + '_label'}>KeyType</InputLabel>
        <Select
            labelId={'dyn-' + uid + '_label'}
            id={'dyn-' + uid + '_select'}
            value={value}
            error={!value}
            onChange={(e) => {
                setDesignerSchema(s => {
                    return s
                        .setIn(keys, e.target.value as string)
                })
            }}
        >
            <MenuItem value={'HASH'}>HASH</MenuItem>
            <MenuItem value={'RANGE'}>RANGE</MenuItem>
        </Select>
        {!value ? <FormHelperText error>Required</FormHelperText> : null}
    </FormControl>
}

export const SelectAttributeType: React.ComponentType<{
    value: string
    setType: (type: string) => void
    noLabel?: boolean
    width?: number
}> = ({value, setType, noLabel, width = 95}) => {
    const uid = useUID()
    return <FormControl style={{width: width, flexShrink: 0}} error={!value}>
        {noLabel ? null : <InputLabel id={'dyn-' + uid + '_label'}>Type</InputLabel>}
        <Select
            labelId={'dyn-' + uid + '_label'}
            id={'dyn-' + uid + '_select'}
            value={value}
            onChange={(e) =>
                setType(e.target.value as string)
            }
        >
            <MenuItem value={'S'}>S</MenuItem>
            <MenuItem value={'SS'}>SS</MenuItem>
            <MenuItem value={'N'}>N</MenuItem>
            <MenuItem value={'M'}>M</MenuItem>
            <MenuItem value={'B'}>B</MenuItem>
            <MenuItem value={'BOOL'}>BOOL</MenuItem>
            <MenuItem value={'BN'}>BN</MenuItem>
            <MenuItem value={'L'}>L</MenuItem>
        </Select>
        {!value ? <FormHelperText error>Required</FormHelperText> : null}
    </FormControl>
}

export type DesignerSchemaState = Map<keyof DynamoDbInspectResult, DynamoDbInspectResult[keyof DynamoDbInspectResult]>
export type setDesignerSchemaState = React.Dispatch<React.SetStateAction<DesignerSchemaState>>

export const DesignerSchema: React.ComponentType<{ activeTable: string | undefined }> = ({activeTable}) => {
    const [isSame, setIsSame] = React.useState<boolean>(false)
    const [designerSchemaState, setDesignerSchemaState] = React.useState<DesignerSchemaState>(Map())
    const [saving, setSaving] = React.useState<number>(0)
    const [rawMode, setRawMode] = React.useState<boolean>(false)
    const {tableDetails, save} = useDynamoTables()
    const table = activeTable ? tableDetails.get(activeTable) : undefined
    const tableSchema = table?.schema
    const tableSchemaSchema = tableSchema?.schema

    React.useEffect(() => {
        // @ts-ignore
        setDesignerSchemaState(Map(tableSchemaSchema || {
            Table: {
                TableName: '',
                KeySchema: [],
            },
        }))
    }, [tableSchemaSchema, setDesignerSchemaState])

    React.useEffect(() => {
        const timer = window.setTimeout(() => {
            const same = Map(fromJS(tableSchemaSchema)).equals(Map(fromJS(designerSchemaState.toJS())))
            setIsSame(same)
        }, 360)
        return () => window.clearTimeout(timer)
    }, [tableSchemaSchema, designerSchemaState, setIsSame])

    return <Box
        style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            flexGrow: 1,
        }}
    >
        <Box mt={0.5} style={{flexShrink: 0}}>
            <Box style={{display: 'flex', alignItems: 'center'}}>
                <Typography variant={'body2'}>{
                    tableSchema && !tableSchema?.schema?.Table ? 'invalid, Table not set' : ''
                }</Typography>
                <Button
                    size={'small'} onClick={() => setRawMode(m => !m)}
                    style={{marginLeft: 'auto'}}
                >{rawMode ? 'editor mode' : 'raw mode'}</Button>
            </Box>
        </Box>

        <Box style={{flexWrap: 'wrap', display: 'flex', overflow: 'auto', flexGrow: 1}}>
            {rawMode ? <DesignerSchemaRaw
                activeTable={activeTable}
                schema={designerSchemaState}
                setDesignerSchema={setDesignerSchemaState}
                save={save}
            /> : <DesignerSchemaNormal
                activeTable={activeTable}
                schema={designerSchemaState}
                setDesignerSchema={setDesignerSchemaState}
                save={save}
            />}
        </Box>
        <Box style={{flexWrap: 'wrap', display: 'flex', flexShrink: 0, alignItems: 'center'}}>
            <Button
                size={'medium'} style={{marginTop: 4}}
                disabled={saving === 1 || saving === 2}
                variant={isSame ? 'text' : 'contained'}
                color={isSame ? 'default' : 'primary'}
                onClick={() => {
                    setSaving(1)
                    if(!activeTable) return
                    save(activeTable, {
                        schema: designerSchemaState.toJS()
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
            {isSame ? null : <Typography variant={'body2'} style={{marginLeft: 6}}><IcInfo fontSize={'inherit'}/> unsaved changes</Typography>}
        </Box>
    </Box>
}
