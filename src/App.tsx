import React, { memo } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CssBaseline, MuiThemeProvider } from '@material-ui/core'
import { getLocalExplorers, setLocalExplorers, Visualizer } from './components/Visualizer'
import { customTheme } from './theme'
import { ExplorerContextProvider } from './feature/ExplorerContext'
import { createStore } from 'redux'
import { Map } from 'immutable'
import { Provider as ReduxProvider } from 'react-redux'
import { reducers } from './feature/reducers'
import { LoginBox } from './components/User/LoginBox'
import { DynamoExplorers } from './components/DynamoDataTable'

const theme = customTheme('#451bba')

const ThemedAppBase = (
    {setThemeId}:
        { setThemeId: (updater: (themeId: 'dark' | 'light') => 'dark' | 'light') => void }
) => {
    const [openLogin, setOpenLogin] = React.useState<boolean>(false)
    const [activeTable, setActiveTable] = React.useState<string | undefined>(undefined)
    const [tableAction, setTableAction] = React.useState<string | undefined>(undefined)

    const [explorers, setExplorers] = React.useState<DynamoExplorers>(() => getLocalExplorers())

    const updateExplorers: React.Dispatch<React.SetStateAction<DynamoExplorers>> = React.useCallback((explorers) => {
        setExplorers((explorersCurrent: DynamoExplorers) => {
            let newExplorers: DynamoExplorers | undefined
            if(typeof explorers === 'function') {
                newExplorers = explorers([...explorersCurrent])
            } else {
                newExplorers = explorers
            }
            setLocalExplorers(newExplorers)
            return newExplorers
        })
    }, [setExplorers])

    return <Router>
        <ExplorerContextProvider setOpenLogin={setOpenLogin}>
            <ReduxProvider store={store}>
                <CssBaseline/>
                <Layout
                    activeTable={activeTable}
                    tableAction={tableAction}
                    setThemeId={setThemeId}
                    setOpenLogin={setOpenLogin}
                    explorers={explorers}
                >
                    <Visualizer
                        setActiveTable={setActiveTable}
                        setTableAction={setTableAction}
                        explorers={explorers}
                        setExplorers={updateExplorers}
                    />
                </Layout>
                <LoginBox
                    onClose={() => setOpenLogin(false)}
                    open={openLogin}
                />
            </ReduxProvider>
        </ExplorerContextProvider>
    </Router>
}

const ThemedApp = memo(ThemedAppBase)

const store = createStore(reducers, Map())


function App() {
    const [themeId, setThemeId] = React.useState<'dark' | 'light'>('dark')

    const [t, sT] = React.useState(theme[themeId])
    React.useEffect(() => {
        sT({...theme[themeId]})
    }, [sT, themeId])

    return (
        <MuiThemeProvider theme={t}>
            <ThemedApp setThemeId={setThemeId}/>
        </MuiThemeProvider>
    )
}

export default App
