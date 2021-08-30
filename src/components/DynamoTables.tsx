import { Box, Button, List, ListItem, ListItemText, TextField, Typography } from '@material-ui/core'
import React from 'react'
import { useHistory } from 'react-router-dom'

export const DynamoTables = (
    {
        tables,
        updateTables,
        activeTable,
    }: {
        tables: any[],
        updateTables: (table: (any | ((table?: any) => any)), id: (string | undefined)) => void
        activeTable: string | undefined
    }
) => {
    const history = useHistory()
    const [newName, setNewName] = React.useState('')

    return <Box m={2}>
        <Typography variant={'h1'} gutterBottom>
            Tables Overview
        </Typography>

        <Box mt={1} mb={2}>
            <Typography variant={'h3'} component={'h2'} gutterBottom>
                New Table
            </Typography>
            <TextField
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
            />
            <Button
                disabled={Boolean(tables.find(t => t.id === newName)) || newName.trim() === ''}
                onClick={() => {
                    updateTables({id: newName}, newName)
                    setNewName('')
                }}
            >add</Button>
        </Box>

        <Box style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
            <Typography variant={'h3'} component={'h2'} gutterBottom>
                Tables
            </Typography>

            <List dense style={{width: '100%'}}>
                {tables.map(table => <ListItem
                    key={table.id} button
                    selected={activeTable === table.id}
                    onClick={() => {
                        history.push('/table/' + table.id)
                    }}
                >
                    <ListItemText
                        primary={table.id}
                        secondary={<>
                            {tables.find(t => t.id === table.id)?.schema ? 'has schema' : 'missing schema'}
                            {', '}
                            {tables.find(t => t.id === table.id)?.exampleData ? 'has data' : 'missing data'}
                        </>}
                    />
                </ListItem>)}
            </List>
        </Box>
    </Box>
}
