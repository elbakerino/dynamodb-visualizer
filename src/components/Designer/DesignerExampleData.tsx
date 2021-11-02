import React, { memo } from 'react'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import IcCheck from '@material-ui/icons/Check'
import { InputTextJson } from '../InputTextJson'
import { Badge, Button, CircularProgress, FormHelperText, Grid, GridSize, IconButton, InputBase, Paper } from '@material-ui/core'
import { DynamoDbAttribute, DynamoDbItem, DynamoDbAttributeType, DynamoDbScanResult, DynamoDbSchemaTable, ExplorerTableSchemaType, useDynamoTables } from '../../feature/DynamoTables'
import { fromJS, Map } from 'immutable'
import IcInfo from '@material-ui/icons/Info'
import IcPagePrev from '@material-ui/icons/ChevronLeft'
import IcPageNext from '@material-ui/icons/ChevronRight'
import IcMovePrev from '@material-ui/icons/ArrowLeft'
import IcMoveNext from '@material-ui/icons/ArrowRight'
import { SelectAttributeType } from './DesignerSchema'
import IcDelete from '@material-ui/icons/Delete'
import IcViewColumn from '@material-ui/icons/ViewColumn'
import IcAdd from '@material-ui/icons/Add'

export type DesignerExampleState = Map<keyof DynamoDbScanResult, DynamoDbScanResult[keyof DynamoDbScanResult]>
export type setDesignerExampleState = React.Dispatch<React.SetStateAction<DesignerExampleState>>

const DesignerExampleDataRaw: React.ComponentType<{
    items: DesignerExampleState
    setDesignerExample: setDesignerExampleState
}> = ({items, setDesignerExample}) => {
    return <Box mt={2} style={{flexWrap: 'wrap', display: 'flex', overflow: 'auto', flexGrow: 1}}>
        <InputTextJson
            label={'Data as JSON'}
            value={items?.toJS() || {'Items': []}}
            onChange={(newValue) => {
                setDesignerExample(Map(newValue || {}) as DesignerExampleState)
            }}
        />
    </Box>
}

const DesignerExampleDataEditor: React.ComponentType<{
    items: DesignerExampleState
    tableSchema: ExplorerTableSchemaType['schema'] | undefined
    setDesignerExample: setDesignerExampleState
    page: number
    setPage: React.Dispatch<React.SetStateAction<number>>
    cols: number
}> = (
    {
        items, tableSchema, setDesignerExample,
        page, cols,
    }
) => {
    return <Box mt={2} style={{flexWrap: 'wrap', display: 'flex', flexGrow: 1, overflowY: 'auto', overflowX: 'hidden'}}>
        {(items?.get('Items')?.length) === 0 ? <Button
            style={{marginRight: 'auto', marginBottom: 'auto'}}
            onClick={() => {
                setDesignerExample((exampleState) =>
                    exampleState.update('Items', (items = []) => {
                        items = [...items]
                        items.push({})
                        return items
                    })
                )
            }}
            size={'medium'}
            variant={'contained'}
            color={'primary'}
        >
            <IcAdd/> Add Item
        </Button> : null}

        <Grid container spacing={2}>
            {[...(items?.get('Items') || [])].slice(page * 6, (page * 6) + 6).map((item, i) =>
                <DesignerExampleDataEditorItem
                    key={(page * 6) + i} ii={(page * 6) + i}
                    item={item}
                    keySchema={tableSchema?.Table?.KeySchema}
                    attributes={tableSchema?.Table?.AttributeDefinitions}
                    setDesignerExample={setDesignerExample}
                    cols={cols}
                    isFirst={(page * 6) + i === 0}
                    isLast={(page * 6) + i === (items?.get('Items') || []).length - 1}
                />)}
        </Grid>
    </Box>
}

const DesignerExampleDataEditorItemBase: React.ComponentType<{
    item: DynamoDbItem
    keySchema: DynamoDbSchemaTable['KeySchema']
    setDesignerExample: setDesignerExampleState
    attributes: {
        AttributeName: string
        AttributeType: DynamoDbAttributeType
    }[] | undefined
    ii: number
    cols: number
    isFirst: boolean
    isLast: boolean
}> = ({
          item, keySchema,
          setDesignerExample, attributes,
          ii, cols,
          isFirst, isLast,
      }) => {
    const pk = keySchema && keySchema[0]
    const sk = keySchema && keySchema[1]
    const pkN = keySchema && keySchema[0]?.AttributeName
    const skN = keySchema && keySchema[1]?.AttributeName

    const keys = React.useMemo(() =>
            attributes?.filter(a =>
                !(!pkN || (pkN && pkN === a.AttributeName)) &&
                !(!skN || (skN && skN === a.AttributeName))
            )
        , [pkN, skN, attributes])

    const generics = Object.keys(item)
        .filter(ik =>
            (attributes?.findIndex(a => a.AttributeName === ik) || -1) === -1 &&
            (!pkN || (pkN && pkN !== ik)) &&
            (!skN || (skN && skN !== ik))
        )

    generics.push('')
    return <Grid item xs={12} sm={Number((12 / cols).toFixed(0)) as GridSize}>
        <Paper variant={'outlined'} style={{height: '100%'}}>
            <Box m={2} style={{flexWrap: 'wrap', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                <Box mt={-1.5} mx={'auto'} mb={1}>
                    <IconButton
                        size={'small'} style={{marginRight: '8px', opacity: 0.5}}
                        onClick={() =>
                            setDesignerExample(s =>
                                s.update('Items', (items) => {
                                    items = [...(items || [])]
                                    items.splice(ii, 1)
                                    return items
                                })
                            )
                        }
                    >
                        <IcDelete/>
                    </IconButton>
                    <IconButton
                        size={'small'}
                        disabled={isFirst}
                        onClick={() =>
                            setDesignerExample(s =>
                                s.update('Items', (items) => {
                                    items = [...(items || [])]
                                    const tmpItems = items.splice(ii, 1)
                                    if(tmpItems[0]) {
                                        items.splice(ii - 1, 0, tmpItems[0])
                                    }
                                    return items
                                })
                            )
                        }
                    >
                        <IcMovePrev/>
                    </IconButton>
                    <IconButton
                        size={'small'}
                        disabled={isLast}
                        onClick={() =>
                            setDesignerExample(s =>
                                s.update('Items', (items) => {
                                    items = [...(items || [])]
                                    const tmpItems = items.splice(ii, 1)
                                    if(tmpItems[0]) {
                                        items.splice(ii + 1, 0, tmpItems[0])
                                    }
                                    return items
                                })
                            )
                        }
                    >
                        <IcMoveNext/>
                    </IconButton>
                </Box>

                {pk?.AttributeName ? <DesignerExampleDataEditorItemInp
                    i={ii}
                    index={pk?.AttributeName} value={pk?.AttributeName ? item[pk?.AttributeName] : undefined}
                    setDesignerExample={setDesignerExample}
                /> : <Box mb={2}><FormHelperText error>Missing Primary Partition Key in Schema</FormHelperText></Box>}

                {sk ? <DesignerExampleDataEditorItemInp
                    i={ii}
                    index={sk?.AttributeName} value={sk?.AttributeName ? item[sk?.AttributeName] : undefined}
                    setDesignerExample={setDesignerExample}
                /> : null}

                <Typography style={{marginLeft: -8}} color={'textSecondary'} gutterBottom>Attribute Definitions: {(keys?.length || 0) === 0 ? '0' : ''}</Typography>
                {keys?.map((key, i) => <DesignerExampleDataEditorItemInp
                    key={i} i={ii}
                    index={key?.AttributeName} value={key.AttributeName ? item[key.AttributeName] : undefined}
                    setDesignerExample={setDesignerExample}
                />)}

                <Typography style={{marginLeft: -8}} color={'textSecondary'} gutterBottom>Generics:</Typography>
                {generics?.map((key, i) => <DesignerExampleDataEditorItemInp
                    key={i} i={ii}
                    index={key} value={key ? item[key] : undefined}
                    setDesignerExample={setDesignerExample}
                    hideEmpty
                />)}
            </Box>
        </Paper>
    </Grid>
}
const DesignerExampleDataEditorItem = memo(DesignerExampleDataEditorItemBase)


const DesignerExampleDataEditorItemInpBase: React.ComponentType<{
    i: number
    index: string | undefined
    value: DynamoDbAttribute | undefined
    setDesignerExample: setDesignerExampleState
    hideEmpty?: boolean
}> = (
    {
        i,
        index, value,
        setDesignerExample, hideEmpty,
    }
) => {
    const [existsError, setExistsError] = React.useState(false)
    const exists = Boolean(value)
    const v: DynamoDbAttribute[keyof DynamoDbAttribute] | undefined = value && Object.values(value)[0] ? Object.values(value)[0] : undefined
    const type: keyof DynamoDbAttribute | undefined = value && Object.keys(value)[0] ? Object.keys(value)[0] as keyof DynamoDbAttribute : undefined

    const val =
        typeof v === 'undefined' ?
            undefined :
            typeof v === 'string' ?
                v : JSON.stringify(v)

    React.useEffect(() => {
        if(!existsError) return

        const timer = window.setTimeout(() => {
            setExistsError(false)
        }, 1400)
        return () => window.clearTimeout(timer)
    }, [setExistsError, existsError])

    return <Box
        mb={1.5}
        style={{width: '100%', overflow: 'hidden'}}
    >
        <Typography variant={!exists && hideEmpty ? 'body1' : 'caption'} component={'div'}>
            <InputBase
                fullWidth
                value={index}
                placeholder={'enter attribute name'}
                style={{
                    fontSize: 'inherit',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'pre',
                    fontStyle: !exists && hideEmpty ? 'italic' : 'normal',
                }}
                inputProps={{style: {fontSize: 'inherit', padding: 0}}}
                error={existsError}
                onChange={e =>
                    setDesignerExample(s =>
                        s.update('Items',
                            // @ts-ignore
                            (items) => {
                                const item = items && items[i] ? items[i] : undefined
                                const nextIndex = e.target.value.trim()
                                if(
                                    !item || nextIndex === '' ||
                                    index === nextIndex
                                ) return items

                                if(item[nextIndex]) {
                                    setExistsError(true)
                                    return items
                                }
                                setExistsError(false)

                                // rebuilding next item, using keys of the current or the new one,
                                // thus keeping the same key order and enables the stateful remove/replace
                                // of property names in auto generated UI
                                const next: DynamoDbItem = {}
                                Object.keys(item).forEach(k => {
                                    next[k === index ? nextIndex : k] = item[k]
                                })
                                if(index === '') {
                                    // handling when creating new entry
                                    next[nextIndex] = {S: ''}
                                }
                                items = [...(items || [])]
                                items.splice(i, 1, next)
                                return items
                            }
                        )
                    )
                }
            />

            {existsError ? <FormHelperText error style={{marginTop: 0}}>already exists</FormHelperText> : null}
        </Typography>

        {!exists && hideEmpty ? null : <Box style={{display: 'flex'}}>
            <Box style={{flexGrow: 1}}>
                <InputBase
                    fullWidth
                    placeholder={'-'}
                    // @ts-ignore
                    value={value && Object.keys(value).indexOf('_text') !== -1 ? value?._text : val || ''}
                    error={value && Object.keys(value).indexOf('_invalid') !== -1}
                    onChange={e =>
                        setDesignerExample(s =>
                            // @ts-ignore
                            s.update('Items', (items) => {
                                    const item = items && items[i] ? items[i] : undefined
                                    const nextValue = e.target.value
                                    if(!item || !index) return items

                                    const next = {...item}
                                    // todo: support M, L, convert to native JS object again
                                    // todo: refine M (L) behaviour of wrong cursor position, unable to add blanks
                                    if(type === 'M') {
                                        try {
                                            next[index] = {'M': JSON.parse(nextValue)} as DynamoDbAttribute
                                        } catch(e) {
                                            next[index] = {
                                                ...next[index],
                                                // @ts-ignore
                                                _invalid: String(e),
                                                // @ts-ignore
                                                _text: nextValue,
                                            }
                                        }
                                    } else {
                                        next[index] = {[type || 'S']: nextValue} as DynamoDbAttribute
                                    }
                                    items = [...(items || [])]
                                    items.splice(i, 1, next)
                                    return items
                                }
                            )
                        )
                    }
                    inputProps={{
                        style: {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }
                    }}
                    style={{marginRight: 6}}
                />
                {
                    // @ts-ignore
                    value && Object.keys(value).indexOf('_invalid') !== -1 ? <FormHelperText error>{value._invalid}</FormHelperText> : null
                }
            </Box>

            {exists ? <>
                <SelectAttributeType
                    noLabel width={48}
                    // @ts-ignore
                    value={type || ''}
                    setType={(type) => setDesignerExample(s =>
                        s.updateIn(['Items', i, index], (itemAttr) => {
                            const val = Object.values(itemAttr as DynamoDbAttribute || {})[0]
                            return {[type]: val}
                        })
                    )}
                />

                <IconButton
                    size={'small'} style={{margin: 'auto 0 auto 8px', opacity: 0.5}}
                    onClick={() =>
                        setDesignerExample(s =>
                            s.updateIn(['Items', i], (item) => {
                                // @ts-ignore
                                item = {...(item || {})} as DynamoDbItem
                                // @ts-ignore
                                delete item[index]
                                return item
                            })
                        )
                    }
                >
                    <IcDelete/>
                </IconButton>
            </> : null}
        </Box>}
    </Box>
}
const DesignerExampleDataEditorItemInp = memo(DesignerExampleDataEditorItemInpBase)

export const DesignerExampleData: React.ComponentType<{ activeTable: string | undefined }> = ({activeTable}) => {
    const [designerExampleState, setDesignerExampleState] = React.useState<DesignerExampleState>(Map())
    const [isSame, setIsSame] = React.useState<boolean>(false)
    const [page, setPage] = React.useState<number>(0)
    const [cols, setCols] = React.useState<number>(2)
    const [saving, setSaving] = React.useState<number>(0)
    const [rawMode, setRawMode] = React.useState<boolean>(false)
    const {tableDetails, save} = useDynamoTables()
    const table = activeTable ? tableDetails.get(activeTable) : undefined
    const tableSchema = table?.schema?.schema
    const tableExampleData = table?.exampleData

    React.useEffect(() => {
        // @ts-ignore
        setDesignerExampleState(Map(tableExampleData?.example_items || {
            Items: [],
        }))
    }, [tableExampleData, setDesignerExampleState])

    const exampleItems = tableExampleData?.example_items
    React.useEffect(() => {
        const timer = window.setTimeout(() => {
            const same = Map(fromJS(exampleItems)).equals(Map(fromJS(designerExampleState.toJS())))
            setIsSame(same)
        }, 360)
        return () => window.clearTimeout(timer)
    }, [exampleItems, designerExampleState, setIsSame])

    return <Box style={{display: 'flex', flexDirection: 'column', overflowY: 'auto', flexGrow: 1}}>
        <Box mt={0.5} style={{flexShrink: 0}}>
            <Box style={{display: 'flex', alignItems: 'center'}}>
                <Typography variant={'body2'}>{
                    tableExampleData ?
                        !tableExampleData?.example_items?.Items ? rawMode ? 'invalid, Items not set' : '' :
                            Array.isArray(tableExampleData?.example_items?.Items) ? <>
                                {designerExampleState?.get('Items')?.length}{' entries'}
                            </> : 'invalid, Items must be array'
                        : rawMode ? 'missing' : ''
                }</Typography>

                <span style={{marginLeft: 'auto'}}/>

                {rawMode ? null : <>
                    <IconButton
                        size={'small'}
                        style={{marginRight: 8}}
                        onClick={() => {
                            setDesignerExampleState((exampleState) =>
                                exampleState.update('Items', (items = []) => {
                                    items = [...items]
                                    items.push({})
                                    setPage(Number(Math.floor(((items.length - 1) / 6)).toFixed(0)))
                                    return items
                                })
                            )
                        }}
                    >
                        <IcAdd/>
                    </IconButton>
                    <IconButton
                        size={'small'}
                        style={{marginRight: 8}}
                        onClick={() => setCols(c => c + 1 > 5 ? 1 : c + 1)}
                    >
                        <Badge
                            badgeContent={cols === 5 ? 6 : cols}
                        >
                            <IcViewColumn/>
                        </Badge>
                    </IconButton>
                </>}

                <Button
                    size={'small'} onClick={() => setRawMode(m => !m)}
                >{rawMode ? 'editor mode' : 'raw mode'}</Button>
            </Box>
        </Box>

        {rawMode ? <DesignerExampleDataRaw
            items={designerExampleState}
            setDesignerExample={setDesignerExampleState}
        /> : <DesignerExampleDataEditor
            items={designerExampleState}
            tableSchema={tableSchema}
            setDesignerExample={setDesignerExampleState}
            page={page} setPage={setPage}
            cols={cols}
        />}

        <Box style={{flexWrap: 'wrap', display: 'flex', flexShrink: 0, alignItems: 'center'}}>
            <Button
                size={'medium'} style={{marginTop: 4}}
                disabled={saving === 1 || saving === 2}
                variant={isSame ? 'text' : 'contained'}
                color={isSame ? 'default' : 'primary'}
                onClick={() => {
                    if(!activeTable) return
                    setSaving(1)
                    save(activeTable, {
                        // @ts-ignore
                        exampleData: designerExampleState.toJS()
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

            <span style={{marginRight: 'auto'}}/>

            {!rawMode && (designerExampleState?.get('Items')?.length || 0) > 6 ? <>
                <Typography style={{paddingLeft: 6, paddingRight: 6}}>
                    {page * 6 + 1}
                    {' to '}
                    {(page * 6) + 6 > (designerExampleState?.get('Items')?.length || 0) ? designerExampleState?.get('Items')?.length : (page * 6) + 6}
                    {' of '}
                    {designerExampleState?.get('Items')?.length}
                </Typography>

                <IconButton
                    size={'small'}
                    disabled={page - 1 < 0}
                    onClick={() => setPage(p => p - 1 >= 0 ? p - 1 : p)}
                ><IcPagePrev/></IconButton>
                <IconButton
                    size={'small'}
                    disabled={(page + 1) > Math.floor(((designerExampleState?.get('Items')?.length || 0) - 1) / 6)}
                    onClick={() => setPage(p => (p + 1) <= Math.floor(((designerExampleState?.get('Items')?.length || 0) - 1) / 6) ? p + 1 : p)}
                ><IcPageNext/></IconButton>
            </> : null}
        </Box>
    </Box>
}
