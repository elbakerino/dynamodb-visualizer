import React, { memo } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { AppBar, Box, IconButton, Paper, Toolbar, Typography, useTheme } from '@material-ui/core'
import IcHome from '@material-ui/icons/Home'
import IcGitHub from '@material-ui/icons/GitHub'
import IcTheme from '@material-ui/icons/InvertColors'
import ToggleButton from '@material-ui/lab/ToggleButton'
import Button from '@material-ui/core/Button'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import IcTables from '@material-ui/icons/ViewList'
import IcArchitecture from '@material-ui/icons/Architecture'
import IcInfo from '@material-ui/icons/Description'
import IcLogin from '@material-ui/icons/Login'
import IcUser from '@material-ui/icons/AccountBox'
import IcLogout from '@material-ui/icons/Logout'
import IcViz from '@material-ui/icons/TableChart'
import { useExplorerContext } from '../feature/ExplorerContext'
import { useDynamoTables } from '../feature/DynamoTables'
import { DynamoExplorers } from './DynamoDataTable'
import IcStartApp from '@material-ui/icons/PlayForWork'
import { usePageTable } from './PageDynamoTable'

const LayoutBase: React.ComponentType<React.PropsWithChildren<{
    setThemeId: (updater: (themeId: 'dark' | 'light') => 'dark' | 'light') => void
    setOpenLogin: React.Dispatch<React.SetStateAction<boolean>>
    explorers: DynamoExplorers
    showOnboarding: number
    setShowOnboarding: React.Dispatch<React.SetStateAction<number>>
}>> = (
    {
        children,
        setThemeId,
        setOpenLogin, explorers,
        showOnboarding, setShowOnboarding,
    }
) => {
    const {activeTable, tableAction} = usePageTable()
    const {palette} = useTheme()
    const history = useHistory()
    const {tableDetails} = useDynamoTables()
    const {id, connection, logout} = useExplorerContext()
    const explorer = explorers.find(e => e.endpoint === id)
    const tableMeta = activeTable ? tableDetails?.get(activeTable)?.meta : undefined

    return <>
        <AppBar position="static" elevation={1}>
            <Toolbar variant="dense">
                <IconButton
                    edge="start" color="inherit" aria-label="menu"
                    onClick={() => history.push({
                        pathname: '/',
                        search: id ? '?explorer=' + encodeURIComponent(id) : '',
                    })}
                >
                    <IcHome/>
                </IconButton>

                <Typography
                    variant="caption" color="inherit"
                    component={Link} to={'/' + (id ? '?explorer=' + encodeURIComponent(id) : '')}
                    style={{textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1.125}}
                >
                    <span>DynamoDB Visualizer</span>
                </Typography>

                {id ? <Box ml={2}>
                    <Typography
                        variant="caption" color="inherit"
                        component={'a'} href={id} target={'_blank'} rel={'noopener noreferrer'}
                        style={{textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1.125}}
                    >Explorer:</Typography>
                    <Typography
                        variant="caption" color="inherit"
                        component={'a'} href={id} target={'_blank'} rel={'noopener noreferrer'}
                        style={{textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1.125}}
                    >{explorer?.name || id}</Typography>
                </Box> : null}

                {id && connection?.auth ? <IconButton
                    color="inherit" aria-label="menu"
                    onClick={() => logout(id)}
                >
                    <IcLogout/>
                </IconButton> : null}

                <IconButton
                    edge="start" color="inherit" aria-label="menu"
                    href={'https://github.com/elbakerino/dynamodb-visualizer'}
                    //onClick={() => history.push('https://github.com/elbakerino/dynamodb-visualizer')}
                    style={{marginLeft: 'auto'}}
                >
                    <IcGitHub/>
                </IconButton>
                <IconButton
                    edge="start" color="inherit" aria-label="menu"
                    onClick={() => setThemeId((id: 'dark' | 'light') => id === 'dark' ? 'light' : 'dark')}
                    style={{marginLeft: 3}}
                >
                    <IcTheme/>
                </IconButton>
            </Toolbar>
        </AppBar>

        {children}

        <Box style={{flexShrink: 0}} p={1}>
            <Paper elevation={2} style={{position: 'relative'}}>
                <Box p={1} style={{display: 'flex', alignItems: 'center', overflow: 'auto', flexShrink: 0}}>
                    {showOnboarding === 1 ? <Paper
                        elevation={2}
                        style={{
                            borderRadius: 5,
                            position: 'absolute',
                            top: 0,
                            transform: 'translateY(-100%)',
                        }}
                        onClick={() => setShowOnboarding(2)}
                    ><Box
                        p={2}
                        style={{
                            borderRadius: 5,
                            border: '1px solid ' + palette.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <IcStartApp fontSize={'large'}/>
                        <Typography
                            style={{marginLeft: 6}}
                            variant={'body2'}
                        >
                            Welcome! 🎉<br/>
                            Start with a table here
                        </Typography>
                    </Box></Paper> : null}

                    {id && !connection.auth ? <Button
                        startIcon={<IcLogin/>}
                        onClick={() => setOpenLogin(true)}
                        variant={'contained'} color={'primary'}
                    >Authentication required</Button> : null}

                    {id && !connection.auth ? null : <ToggleButtonGroup
                        value={tableAction ? tableAction : 'config'}
                        exclusive
                        onChange={() => {
                            history.push({
                                pathname: '/tables',
                                search: id ? '?explorer=' + encodeURIComponent(id) : '',
                            })
                            setShowOnboarding(so => so === 1 ? 2 : so)
                        }}
                    >
                        <ToggleButton value="tables" style={{color: 'inherit'}}>
                            <IcTables color={'secondary'}/>
                            <span style={{paddingLeft: 8}}>Tables</span>
                        </ToggleButton>
                    </ToggleButtonGroup>}

                    {(id && !connection.auth) || !activeTable ? null : <ToggleButtonGroup
                        value={tableAction ? tableAction : 'config'}
                        exclusive
                        style={{color: 'inherit', marginLeft: 12}}
                        onChange={(e, val) =>
                            val ?
                                history.push({
                                    pathname: '/table/' + activeTable + '/' + val,
                                    search: id ? '?explorer=' + encodeURIComponent(id) : '',
                                }) :
                                history.push({
                                    pathname: '/table/' + activeTable + '/' + (tableAction || 'config'),
                                    search: id ? '?explorer=' + encodeURIComponent(id) : '',
                                })
                        }
                    >
                        <ToggleButton value="designer" style={{color: 'inherit'}}>
                            <IcArchitecture/>
                            <span style={{paddingLeft: 8}}>Design</span>
                        </ToggleButton>
                        <ToggleButton value="info" style={{color: 'inherit'}}>
                            <IcInfo/>
                            <span style={{paddingLeft: 8}}>Info</span>
                        </ToggleButton>
                        <ToggleButton value="viz" style={{color: 'inherit'}}>
                            <IcViz/>
                            <span style={{paddingLeft: 8}}>Viz</span>
                        </ToggleButton>
                    </ToggleButtonGroup>}

                    {activeTable ? <Box ml={2}><Typography variant={'body2'} style={{marginLeft: 'auto', fontWeight: 'bold', letterSpacing: 0.56}}>
                        Table: <code>{tableMeta?.name || activeTable}</code>
                    </Typography></Box> : null}

                    {!id ? <Box ml={2}><Typography variant={'body2'} style={{marginLeft: 'auto', fontWeight: 'bold', letterSpacing: 0.56}}>
                        Mode: Browser Storage
                    </Typography></Box> : null}
                    {id && connection.auth ? <IconButton
                        color="inherit" aria-label="user"
                        onClick={() =>
                            history.push({
                                pathname: '/user',
                                search: id ? '?explorer=' + encodeURIComponent(id) : '',
                            })
                        }
                        style={{marginLeft: 'auto'}}
                    >
                        <IcUser/>
                    </IconButton> : null}
                </Box>
            </Paper>
        </Box>
    </>
}

export const Layout = memo(LayoutBase)
