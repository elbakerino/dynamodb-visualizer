import React, { memo } from 'react'
import Box from '@material-ui/core/Box'
import { Button, FormControl, IconButton, InputLabel, MenuItem, Popover, Select, TextField, Typography } from '@material-ui/core'
import IcColorize from '@material-ui/icons/ColorLens'
import { ChromePicker } from 'react-color'
import IcClose from '@material-ui/icons/Close'
import IcSwap from '@material-ui/icons/SwapVerticalCircleOutlined'
import { useDynamoTables } from '../../feature/DynamoTables'
import { buildSearch } from '../../lib/SearchParams'
import IcClear from '@material-ui/icons/Clear'
import { useHistory } from 'react-router-dom'
import { useExplorerContext } from '../../feature/ExplorerContext'

export const ColorizeContext = React.createContext<ColorizeRulesetType>({pk: [], sk: []})
export const useColorize = () => React.useContext(ColorizeContext)


export type ColorPickerIdType = undefined | [string, number, Element]
export type setColorPickerIdType = React.Dispatch<React.SetStateAction<ColorPickerIdType>>

export interface ColorizeRulesetType {
    pk: ColorizeRule[]
    sk: ColorizeRule[]
}

export interface ColorizeRule {
    color: string | undefined
    comparison: string | undefined
    search: string | undefined
}

const ColorizeRulesetBase: React.ComponentType<{
    keyId: keyof ColorizeRulesetType
    setRuleset: React.Dispatch<React.SetStateAction<ColorizeRulesetType>>
    ruleSet: ColorizeRule[]
    colorPickerId: ColorPickerIdType
    setColorPickerId: setColorPickerIdType
}> = ({
          setRuleset, keyId, ruleSet,
          setColorPickerId, colorPickerId,
      }) => {
    return <Box style={{flexShrink: 0}} ml={2}>
        <Typography>Rules</Typography>
        {ruleSet.map((rs, i) => <ColorizeRuleEdit
            key={i}
            rule={ruleSet[i]}
            setRuleset={setRuleset}
            keyId={keyId}
            ruleIndex={i}
            setColorPickerId={setColorPickerId}
            colorPickerId={colorPickerId}
        />)}
        <Button onClick={() => setRuleset(rs => {
            const rsTmp = {...rs}
            const rules = [...(rsTmp[keyId] as ColorizeRule[] || [])]
            rules.push({color: undefined, comparison: undefined, search: undefined})
            rsTmp[keyId] = rules
            return rsTmp
        })}>add Rule</Button>
    </Box>
}
const ColorizeRuleset = memo(ColorizeRulesetBase)

const ColorizeRuleEditBase: React.ComponentType<{
    keyId: keyof ColorizeRulesetType
    ruleIndex: number
    setRuleset: React.Dispatch<React.SetStateAction<ColorizeRulesetType>>
    rule: ColorizeRule
    colorPickerId: ColorPickerIdType
    setColorPickerId: setColorPickerIdType
}> = ({
          setRuleset, ruleIndex, keyId, rule,
          setColorPickerId, colorPickerId,
      }) => {
    const btnRef = React.useRef(null)
    return <Box
        style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
        }}
        ml={2}
    >
        <Typography style={{width: '100%'}}>{ruleIndex + 1}. Rule</Typography>
        <Box style={{display: 'flex'}}>
            <Box>
                <Button
                    innerRef={btnRef}
                    onClick={(e) => {
                        setColorPickerId(pid => {
                            if(pid && pid[0] === keyId && pid[1] === ruleIndex) {
                                return undefined
                            }
                            return [keyId, ruleIndex, e.currentTarget]
                        })
                    }}
                    style={{padding: 8, minWidth: 0}}
                >
                    <IcColorize
                        color={'inherit'}
                        htmlColor={rule.color}
                        fontSize={'large'}
                    />
                </Button>

                <Popover
                    //id={id}
                    open={Boolean(colorPickerId && colorPickerId[0] === keyId && colorPickerId[1] === ruleIndex)}
                    anchorEl={colorPickerId ? colorPickerId[2] : undefined}
                    onClose={() => setColorPickerId(undefined)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <ChromePicker
                        color={rule.color || ''}
                        onChange={(color) => {
                            setRuleset(rs => {
                                const rsN = {...rs}
                                rsN[keyId] = [...rsN[keyId]]
                                rsN[keyId][ruleIndex] = {
                                    ...rsN[keyId][ruleIndex] || {},
                                    color: color.hex,
                                }
                                return rsN
                            })
                        }}
                    />
                </Popover>
            </Box>

            <FormControl style={{width: 95, flexShrink: 0}}>
                <InputLabel id={'colorize--' + keyId + '--' + ruleIndex + '_label'}>Comparison</InputLabel>
                <Select
                    labelId={'colorize--' + keyId + '--' + ruleIndex + '_label'}
                    id={'colorize--' + keyId + '--' + ruleIndex + '_select'}
                    value={rule.comparison || ''}
                    onChange={(e) =>
                        setRuleset(rs => {
                            const rsN = {...rs}
                            rsN[keyId] = [...rsN[keyId]]
                            rsN[keyId][ruleIndex] = {
                                ...rsN[keyId][ruleIndex] || {},
                                comparison: e.target.value as string,
                            }
                            return rsN
                        })
                    }
                >
                    <MenuItem value={'='}>=</MenuItem>
                    <MenuItem value={'≠'}>≠</MenuItem>
                    <MenuItem value={'<'}>&lt;</MenuItem>
                    <MenuItem value={'>'}>&gt;</MenuItem>
                    <MenuItem value={'<='}>&lt;=</MenuItem>
                    <MenuItem value={'>='}>&gt;=</MenuItem>
                    <MenuItem value={'begins_with'}>BEGINS_WITH</MenuItem>
                    <MenuItem value={'contains'}>CONTAINS</MenuItem>
                    {/*<MenuItem value={'regex'}>regex</MenuItem>*/}
                </Select>
            </FormControl>

            <TextField
                label={'Value'}
                value={rule.search}
                onChange={e =>
                    setRuleset(rs => {
                        const rsN = {...rs}
                        rsN[keyId] = [...rsN[keyId]]
                        rsN[keyId][ruleIndex] = {
                            ...rsN[keyId][ruleIndex] || {},
                            search: e.target.value as string,
                        }
                        return rsN
                    })
                }
                style={{flexShrink: 0, flexGrow: 1, marginLeft: 4}}
            />
        </Box>
        <Button
            onClick={() => setRuleset(rs => {
                const rsTmp = {...rs}
                const rules = [...(rsTmp[keyId] as ColorizeRule[] || [])]
                rules.splice(ruleIndex, 1)
                rsTmp[keyId] = rules
                return rsTmp
            })}
            style={{alignSelf: 'flex-end', marginLeft: 'auto'}}
            size={'small'}
        >delete Rule</Button>
    </Box>
}

const ColorizeRuleEdit = memo(ColorizeRuleEditBase)

const SidebarColorizeBase: React.ComponentType<{
    activeTable: string | undefined
    activeIndex: string | undefined
    activePreset: string | undefined
    activeColor: string | undefined
    setRuleset: React.Dispatch<React.SetStateAction<ColorizeRulesetType>>
    setOpenSidebar: (key: string | undefined | ((key: string | undefined) => string | undefined)) => void
}> = ({
          activePreset, activeIndex, activeTable, setRuleset, setOpenSidebar,
          activeColor,
      }) => {
    const history = useHistory()
    const [colorPickerId, setColorPickerId] = React.useState<ColorPickerIdType>()
    const {tableDetails, saveColor} = useDynamoTables()
    const {id} = useExplorerContext()
    const ruleSet = useColorize()
    const [name, setName] = React.useState(activePreset || '')
    const colors = activeTable ? tableDetails?.get(activeTable)?.colors : undefined

    React.useEffect(() => {
        setName(activeColor || '')
    }, [activeColor, setName])

    return <>
        <Typography variant={'h4'} style={{display: 'flex', alignContent: 'center'}}>
            Colorize
            <IconButton
                onClick={() => setOpenSidebar(undefined)}
                style={{marginLeft: 'auto', padding: 6}}
            ><IcClose/></IconButton>
        </Typography>

        {colors && colors?.length > 0 ? <Box
            mt={1} mb={2}
            style={{display: 'flex', position: 'relative'}}
        >
            <FormControl fullWidth size={'small'} style={{minWidth: 120, marginRight: 1}}>
                <InputLabel id={'bsv--preset'}>{activeColor ? 'Color' : 'Select Color'}</InputLabel>
                <Select
                    labelId={'bsv--preset'}
                    id={'bsv--preset-val'}
                    value={activeColor || ''}
                    onChange={(event: React.ChangeEvent<{ value: unknown }>) =>
                        history.push({
                            search: buildSearch([
                                'color=' + encodeURIComponent(event.target.value as string),
                                activePreset ? 'preset=' + encodeURIComponent(activePreset) : '',
                                activeIndex ? 'key_index=' + activeIndex : '',
                                id ? 'explorer=' + encodeURIComponent(id) : undefined,
                            ]),
                        })
                    }
                >
                    {colors.map(p => <MenuItem key={p.data_key} value={decodeURIComponent(p.data_key.substr('v0#color#'.length))}>{decodeURIComponent(p.data_key.substr('v0#color#'.length))}</MenuItem>)}
                </Select>
            </FormControl>

            {activeColor ? <IconButton
                edge="start" color={'inherit'} aria-label="clear preset"
                onClick={() => history.push({
                    search: buildSearch([
                        activePreset ? 'preset=' + encodeURIComponent(activePreset) : '',
                        activeIndex ? 'key_index=' + activeIndex : '',
                        id ? 'explorer=' + encodeURIComponent(id) : undefined,
                    ])
                })}
                style={{
                    margin: 'auto 0',
                    padding: 6,
                }}
            >
                <IcClear/>
            </IconButton> : null}
        </Box> : null}

        <Box mb={2} style={{display: 'flex'}}>
            <label>
                {(colors?.length || 0) === 0 ? <span style={{verticalAlign: 'middle'}}>Color Name:</span> : null}
                <TextField
                    size={'small'} fullWidth
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </label>
            <Button
                disabled={!name.trim()}
                onClick={() => {
                    if(activeTable) {
                        saveColor(activeTable, name, {
                            color_pk: ruleSet.pk,
                            color_sk: ruleSet.sk,
                        }).then((res) => {
                            if(res) {
                                history.push({
                                    search: buildSearch([
                                        'color=' + encodeURIComponent(name),
                                        activePreset ? 'preset=' + encodeURIComponent(activePreset) : '',
                                        activeIndex ? 'key_index=' + activeIndex : '',
                                        id ? 'explorer=' + encodeURIComponent(id) : undefined,
                                    ]),
                                })
                            }
                        })
                    }
                }}
            >{colors && colors.find(p => p.data_key === 'v0#color#' + encodeURIComponent(name)) ? 'Update' : (colors?.length || 0) === 0 ? 'Create color' : 'Create'}</Button>
        </Box>

        <Typography>Partition Key</Typography>
        <Box style={{width: '100%', overflow: 'auto'}}>
            <ColorizeRuleset
                keyId={'pk'} setRuleset={setRuleset} ruleSet={ruleSet.pk}
                colorPickerId={colorPickerId} setColorPickerId={setColorPickerId}
            />
        </Box>

        <Box m={2} style={{display: 'flex', justifyContent: 'center'}}>
            <IconButton
                size={'medium'} style={{padding: 6}}
                onClick={() =>
                    setRuleset(rs => ({
                        sk: rs.pk,
                        pk: rs.sk,
                    }))
                }
            >
                <IcSwap fontSize={'large'}/>
            </IconButton>
        </Box>

        <Typography>Sort Key</Typography>
        <Box style={{width: '100%', overflow: 'auto'}}>
            <ColorizeRuleset
                keyId={'sk'} setRuleset={setRuleset} ruleSet={ruleSet.sk}
                colorPickerId={colorPickerId} setColorPickerId={setColorPickerId}
            />
        </Box>
    </>
}
export const SidebarColorize = memo(SidebarColorizeBase)
