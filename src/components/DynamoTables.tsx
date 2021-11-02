import { Box, Button, List, ListItem, ListItemText, TextField, Typography } from '@material-ui/core'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { useDynamoTables } from '../feature/DynamoTables'
import { useExplorerContext } from '../feature/ExplorerContext'

export const DynamoTables = () => {
    const {id} = useExplorerContext()
    const history = useHistory()
    const {list, create, tables} = useDynamoTables()
    const [newName, setNewName] = React.useState('')

    React.useEffect(() => {
        list().then(() => {

        }).catch(() => {

        })
    }, [list])

    return <Box m={2} style={{flexGrow: 1, overflow: 'auto'}}>
        <Typography variant={'h1'} gutterBottom style={{marginTop: 12}}>
            Tables
        </Typography>

        <Box mt={1} mb={2}>
            <TextField
                placeholder={'Table Name'}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
            />
            <Button
                disabled={Boolean(tables.find(t => t.name === newName)) || newName.trim() === ''}
                onClick={() => {
                    //updateTables({id: newName}, newName)
                    create(newName).then(res => {
                        if(res) {
                            setNewName('')
                        }
                    })
                }}
            >create</Button>
        </Box>

        <Box style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
            <List dense style={{width: '100%'}}>
                {tables.map(table => <ListItem
                    key={table.uuid} button
                    onClick={() => {
                        history.push({
                            pathname: '/table/' + table.uuid,
                            search: id ? '?explorer=' + encodeURIComponent(id) : '',
                        })
                    }}
                >
                    <ListItemText
                        primary={table.name}
                        secondary={<>
                            <small>{table.uuid}</small>
                        </>}
                    />
                </ListItem>)}
            </List>
        </Box>
    </Box>
}
