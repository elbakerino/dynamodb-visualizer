import React, { memo } from 'react'
import { buildSearch } from '../../lib/SearchParams'
import { useDynamoTables } from '../../feature/DynamoTables'
import { useHistory } from 'react-router-dom'
import { ParsedDataResult } from '../DynamoDataTable'
import { useExplorerContext } from '../../feature/ExplorerContext'
import { Box, Button, Checkbox, FormControl, IconButton, InputLabel, List, ListItem, ListItemIcon, ListItemText, MenuItem, Select, TextField } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import IcClose from '@material-ui/icons/Close'
import IcClear from '@material-ui/icons/Clear'

const SidebarFilterPresetsBase: React.ComponentType<{
    setOpenSidebar: (key: string | undefined | ((key: string | undefined) => string | undefined)) => void
    activeTable: string | undefined
    parsedData: ParsedDataResult | undefined
    toggleDisplayKeys: (key: string) => void
    activePreset: string | undefined
    activeColor: string | undefined
}> = ({
          parsedData,
          toggleDisplayKeys, setOpenSidebar,
          activeTable, activePreset, activeColor,
      }) => {
    const {id} = useExplorerContext()
    const history = useHistory()
    const {tableDetails, savePreset: savePresetApi} = useDynamoTables()
    const savePreset: (table: string, name: string, displayKeys: string[]) => void = React.useCallback((table, name, displayKeys) => {
        savePresetApi(table, name, {display_keys: displayKeys})
            .then(res => {
                if(res) {
                    history.push({
                        search: buildSearch([
                            'preset=' + encodeURIComponent(name),
                            activeColor ? 'color=' + encodeURIComponent(activeColor) : '',
                            id ? 'explorer=' + encodeURIComponent(id) : undefined,
                        ])
                    })
                }
            })
    }, [savePresetApi, history, id, activeColor])
    const arrayKeys = parsedData?.allKeys
    const displayKeys = parsedData?.displayKeys
    const index = parsedData?.index
    const presets = activeTable ? tableDetails?.get(activeTable)?.presets : undefined

    const [name, setName] = React.useState(activePreset || '')
    const partitionKey = index ? index[0] : undefined
    const sortKey = index ? index[1] : undefined
    React.useEffect(() => {
        setName(activePreset || '')
    }, [activePreset, setName])

    return <Box>
        <Typography variant={'h4'} style={{display: 'flex', alignContent: 'center'}} gutterBottom>
            Filter
            <IconButton
                onClick={() => setOpenSidebar(undefined)}
                style={{marginLeft: 'auto', padding: 6}}
            ><IcClose/></IconButton>
        </Typography>


        {presets && presets?.length > 0 ? <Box
            mt={1} mb={2}
            style={{display: 'flex', position: 'relative'}}
        >
            <FormControl fullWidth size={'small'} style={{minWidth: 120, marginRight: 1}}>
                <InputLabel id={'bsv--preset'}>{activePreset ? 'Preset' : 'Select Preset'}</InputLabel>
                <Select
                    labelId={'bsv--preset'}
                    id={'bsv--preset-val'}
                    value={activePreset || ''}
                    onChange={(event: React.ChangeEvent<{ value: unknown }>) =>
                        history.push({
                            search: buildSearch([
                                'preset=' + encodeURIComponent(event.target.value as string),
                                activeColor ? 'color=' + encodeURIComponent(activeColor) : '',
                                parsedData?.indexName ? 'key_index=' + parsedData.indexName : '',
                                id ? 'explorer=' + encodeURIComponent(id) : undefined,
                            ])
                            ,
                        })
                    }
                >
                    {presets.map(p => <MenuItem key={p.data_key} value={decodeURIComponent(p.data_key.substr('v0#preset#'.length))}>{decodeURIComponent(p.data_key.substr('v0#preset#'.length))}</MenuItem>)}
                </Select>
            </FormControl>

            {activePreset ? <IconButton
                edge="start" color={'inherit'} aria-label="clear preset"
                onClick={() => history.push({
                    search: buildSearch([
                        parsedData?.indexName ? 'key_index=' + parsedData.indexName : '',
                        activeColor ? 'color=' + encodeURIComponent(activeColor) : '',
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
                {(presets?.length || 0) === 0 ? <span style={{verticalAlign: 'middle'}}>Preset Name:</span> : null}
                <TextField
                    size={'small'} fullWidth
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </label>
            <Button
                disabled={!name.trim() || !displayKeys}
                onClick={() => {
                    if(displayKeys && activeTable) {
                        savePreset(activeTable, name, displayKeys)
                    }
                }}
            >{presets && presets.find(p => p.data_key === 'v0#preset#' + encodeURIComponent(name)) ? 'Update' : (presets?.length || 0) === 0 ? 'Create preset' : 'Create'}</Button>
        </Box>

        <Box style={{width: '100%', overflow: 'auto'}}>
            <Typography>Display Keys</Typography>

            <List dense>
                {partitionKey?.AttributeName ? <ListItem>
                    <ListItemText
                        primary={partitionKey.AttributeName}
                        secondary={<>
                            <span>partition key, </span>
                            <small>always visible</small>
                        </>}
                    />
                </ListItem> : null}
                {sortKey?.AttributeName ? <ListItem>
                    <ListItemText
                        primary={sortKey.AttributeName}
                        secondary={<>
                            <span>sort key, </span>
                            <small>always visible</small>
                        </>}
                    />
                </ListItem> : null}
                {arrayKeys?.map(k => <ListItem
                    key={k}
                    button
                    onClick={() => toggleDisplayKeys(k)}
                >
                    <ListItemIcon>
                        <Checkbox
                            edge="start"
                            checked={k === partitionKey?.AttributeName || k === sortKey?.AttributeName || displayKeys?.includes(k)}
                            disabled={k === partitionKey?.AttributeName || k === sortKey?.AttributeName}
                            tabIndex={-1}
                            disableRipple
                        />
                    </ListItemIcon>
                    <ListItemText primary={k}/>
                </ListItem>)}
            </List>
        </Box>
    </Box>
}

export const SidebarFilterPresets = memo(SidebarFilterPresetsBase)
