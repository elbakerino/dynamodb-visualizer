import React, { memo } from 'react'
import Box from '@material-ui/core/Box'
import { Button, FormControl, IconButton, InputLabel, MenuItem, Popover, Select, TextField, Typography } from '@material-ui/core'
import IcColorize from '@material-ui/icons/ColorLens'
import { ChromePicker } from 'react-color'
import IcClose from '@material-ui/icons/Close'
import IcSwap from '@material-ui/icons/SwapVerticalCircleOutlined'

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
            <FormControl style={{width: 145, flexShrink: 0}}>
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
        </Box>
        <Button
            onClick={() => setRuleset(rs => {
                const rsTmp = {...rs}
                const rules = [...(rsTmp[keyId] as ColorizeRule[] || [])]
                rules.splice(ruleIndex, 1)
                rsTmp[keyId] = rules
                return rsTmp
            })}
            style={{alignSelf: 'flex-end'}}
            size={'small'}
        >delete Rule</Button>
    </Box>
}

const ColorizeRuleEdit = memo(ColorizeRuleEditBase)

export const SidebarColorize: React.ComponentType<{
    ruleSet: ColorizeRulesetType
    setRuleset: React.Dispatch<React.SetStateAction<ColorizeRulesetType>>
    setOpenSidebar: (key: string | undefined | ((key: string | undefined) => string | undefined)) => void
}> = ({ruleSet, setRuleset, setOpenSidebar}) => {
    const [colorPickerId, setColorPickerId] = React.useState<ColorPickerIdType>()

    return <>
        <Typography variant={'h4'} style={{display: 'flex', alignContent: 'center'}}>
            Colorize
            <IconButton
                onClick={() => setOpenSidebar(undefined)}
                style={{marginLeft: 'auto', padding: 6}}
            ><IcClose/></IconButton>
        </Typography>
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
