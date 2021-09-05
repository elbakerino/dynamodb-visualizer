import React from 'react'
import { Button, Checkbox, Dialog, DialogActions, DialogContent, List, ListItem, ListItemIcon, ListItemText, TextField } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import { DynamoPresets, ParsedDataResult } from './DynamoTableData'

export const DynamoTableDataConfig = (
    {
        arrayKeys, onClose, open,
        index, displayKeys, toggleDisplayKeys,
        savePreset,
        presets, activePreset,
        activeTable,
    }: {
        arrayKeys: string[] | undefined
        displayKeys: string[] | undefined
        activePreset: string | undefined
        activeTable: string | undefined
        open: boolean
        onClose: () => void
        index: any | undefined
        setParsedData: React.Dispatch<React.SetStateAction<ParsedDataResult | undefined>>
        toggleDisplayKeys: (key: string) => void
        presets: DynamoPresets
        savePreset: (table: string, name: string, displayKeys: string[]) => void
    }
) => {
    const [name, setName] = React.useState(activePreset || '')
    const primKey = index ? index[0] : undefined
    const sortKey = index ? index[1] : undefined
    React.useEffect(() => {
        setName(activePreset || '')
    }, [activePreset, setName])

    return <Dialog
        open={open} onClose={onClose}
        fullWidth maxWidth={'sm'}
    >
        <DialogContent>
            <Typography>Display Keys</Typography>

            <List dense>
                {primKey?.AttributeName ? <ListItem>
                    <ListItemIcon>
                        <Checkbox
                            edge="start" disableRipple tabIndex={-1}
                            checked disabled
                        />
                    </ListItemIcon>
                    <ListItemText
                        primary={primKey.AttributeName}
                        secondary={'primary key'}
                    />
                </ListItem> : null}
                {sortKey?.AttributeName ? <ListItem>
                    <ListItemIcon>
                        <Checkbox
                            edge="start" disableRipple tabIndex={-1}
                            checked disabled
                        />
                    </ListItemIcon>
                    <ListItemText
                        primary={sortKey.AttributeName}
                        secondary={'sort key'}
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
                            checked={k === primKey?.AttributeName || k === sortKey?.AttributeName || displayKeys?.includes(k)}
                            disabled={k === primKey?.AttributeName || k === sortKey?.AttributeName}
                            tabIndex={-1}
                            disableRipple
                        />
                    </ListItemIcon>
                    <ListItemText primary={k}/>
                </ListItem>)}
            </List>
        </DialogContent>
        <DialogActions>
            <label>
                <span style={{verticalAlign: 'middle'}}>Preset Name:</span>
                <TextField
                    style={{marginLeft: 4}}
                    size={'small'}
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </label>
            <Button
                disabled={!name.trim() || !displayKeys}
                onClick={() => {
                    if(displayKeys && activeTable) {
                        savePreset(activeTable, name, displayKeys)
                        onClose()
                    }
                }}
            >{presets.find(p => p.name === name) ? 'Update' : 'Save as'} preset</Button>
        </DialogActions>
    </Dialog>
}
