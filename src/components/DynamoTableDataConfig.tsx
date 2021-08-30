import React from 'react'
import { Checkbox, Dialog, DialogContent, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import { ParsedDataResult } from './DynamoTableData'

export const DynamoTableDataConfig = (
    {
        arrayKeys, onClose, open,
        index, displayKeys, toggleDisplayKeys,
    }:
        {
            arrayKeys: string[] | undefined
            displayKeys: string[] | undefined
            open: boolean
            onClose: () => void
            index: any | undefined
            setParsedData: React.Dispatch<React.SetStateAction<ParsedDataResult | undefined>>
            toggleDisplayKeys: (key: string) => void
        }
) => {
    const primKey = index ? index[0] : undefined
    const sortKey = index ? index[1] : undefined

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
    </Dialog>
}
