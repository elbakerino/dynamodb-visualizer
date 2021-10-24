import { Box, Button, IconButton, Link, List, ListItem, ListItemSecondaryAction, ListItemText, TextField, Typography } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import IcDelete from '@material-ui/icons/Delete'
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { DynamoExplorers } from './DynamoDataTable'
import { ExplorerActions, useExplorerContext } from '../feature/ExplorerContext'
import { fetcher } from '../lib/ApiHelper'
import { parseParams } from '../lib/SearchParams'

export const ExplorerEndpoints = (
    {
        explorers,
        setExplorers,
        activeExplorer,
        setActiveExplorer,
    }: {
        explorers: DynamoExplorers
        setExplorers: React.Dispatch<React.SetStateAction<DynamoExplorers>>
        activeExplorer: string | undefined
        setActiveExplorer: ExplorerActions['setActive']
    }
) => {
    const {connection} = useExplorerContext()
    const location = useLocation()
    const searchParams = parseParams(location.search)
    const searchExplorer = searchParams.explorer ? decodeURIComponent(searchParams.explorer) : undefined
    const [newName, setNewName] = React.useState(() => searchExplorer && !Boolean(explorers.find(e => e.endpoint === searchExplorer)) ? searchExplorer : '')
    const [testResult, setTestResult] = React.useState<any>(undefined)

    const testApi = React.useCallback((endpoint: string) => {
        const startTime = Date.now()
        fetcher(endpoint + '/api-ping', 'GET')
            .then(json => {
                const endTime = Date.now()
                if(json.status === 200) {
                    if(json.data && json.data['dynamodb-explorer']) {
                        setTestResult({
                            response: json,
                            url: endpoint + '/api-ping',
                            valid: true,
                            ms: endTime - startTime
                        })
                        setExplorers(explorers => {
                            const exists = explorers.findIndex(e => e.endpoint === endpoint)
                            if(exists !== -1) {
                                explorers.splice(exists, 1)
                            }
                            const explor = {
                                endpoint: endpoint,
                                ...(json.data.explorer_name ? {name: json.data.explorer_name} : {}),
                            }
                            setActiveExplorer(explor.endpoint)
                            return [
                                ...explorers,
                                explor,
                            ].sort((a, b) => a.endpoint.localeCompare(b.endpoint))
                        })
                        setNewName('')
                        return
                    }
                }
                throw json
            })
            .catch(e => {
                console.log(e)
                setTestResult({
                    response: e,
                    valid: false,
                })
            })
    }, [setExplorers, setTestResult, setActiveExplorer])
    const endpointExists = Boolean(explorers.find(e => e.endpoint === newName))
    return <Box m={2} style={{flexGrow: 1, overflow: 'auto'}}>
        <Typography variant={'h1'} gutterBottom>
            Explorer Endpoints
        </Typography>

        <Box mt={1} mb={2}>
            <Typography variant={'h3'} component={'h2'} gutterBottom>
                New Explorer Endpoint
            </Typography>
            <TextField
                value={newName}
                placeholder={'https://'}
                onChange={(e) => setNewName(e.target.value)}
                error={endpointExists}
                onBlur={() => setNewName(name => {
                    name = name.trim()
                    if(name.substr(-1) === '/') {
                        name = name.substr(0, name.length - 1)
                    }
                    return name
                })}
                helperText={endpointExists ? 'Endpoint already exists.' : undefined}
            />
            <Button
                disabled={endpointExists || newName.trim() === ''}
                color={newName === searchExplorer ? 'primary' : 'default'}
                variant={newName === searchExplorer ? 'contained' : 'text'}
                onClick={() => {
                    testApi(newName)
                }}
            >test + add</Button>
        </Box>

        {testResult ? <Box mb={2}><Alert severity={testResult.valid ? 'success' : 'error'} onClose={() => setTestResult(undefined)}>
            <Typography>Status: {testResult.response?.status || '-'}</Typography>
            <Typography><small>Endpoint: {testResult.url || '-'}</small></Typography>
            {testResult.ms ? <Typography variant={'caption'}>Ping time: {testResult.ms}ms</Typography> : null}
            <pre><code>{JSON.stringify(testResult.response?.data || testResult.response, undefined, 4)}</code></pre>
        </Alert></Box> : null}

        <Box style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
            <Typography variant={'h3'} component={'h2'} gutterBottom>
                Endpoints
            </Typography>
            {explorers.length === 0 ? <Typography variant={'body1'} gutterBottom>
                Add a new endpoint or <Link component={NavLink} to={'/tables'} color={'textPrimary'} underline={'always'}>continue</Link>, <strong>using only your browsers storage</strong>.
            </Typography> : null}

            <List dense style={{width: '100%'}}>
                {explorers.map((explorer, i) => <ListItem
                    key={i} button
                    selected={activeExplorer === explorer.endpoint}
                    onClick={() => {
                        testApi(explorer.endpoint)
                    }}
                >
                    <ListItemText
                        primary={explorer.name || explorer.endpoint}
                        secondary={<>
                            {explorer.name ? <span>{explorer.endpoint} </span> : null}
                            {activeExplorer === explorer.endpoint ? <>
                                {connection?.auth?.user ? <span>Logged in as <i>{connection?.auth.user}</i></span> : 'Login required.'}
                            </> : null}
                        </>}
                    />

                    <ListItemSecondaryAction>
                        <IconButton
                            edge="end" aria-label="delete"
                            onClick={() => {
                                setActiveExplorer(undefined)
                                setTestResult(undefined)
                                setExplorers(explorers => {
                                    explorers.splice(i, 1)
                                    return [...explorers]
                                })
                            }}
                        >
                            <IcDelete/>
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>)}
            </List>
            {activeExplorer ? <Button onClick={() => setActiveExplorer(undefined)}>switch to browser storage</Button> : null}
        </Box>
    </Box>
}
