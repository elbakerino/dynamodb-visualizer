import React, { memo } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CssBaseline, MuiThemeProvider } from '@material-ui/core'
import { Visualizer } from './components/Visualizer'
import { customTheme } from './theme'

const theme = customTheme('#451bba')

const ThemedAppBase = (
    {setThemeId}:
        { setThemeId: (updater: (themeId: 'dark' | 'light') => 'dark' | 'light') => void }
) => {
    const [activeTable, setActiveTable] = React.useState<string | undefined>(undefined)
    const [tableAction, setTableAction] = React.useState<string | undefined>(undefined)
    return <Router>
        <CssBaseline/>
        <Layout
            activeTable={activeTable}
            tableAction={tableAction}
            setThemeId={setThemeId}
        >
            <Visualizer
                activeTable={activeTable}
                setActiveTable={setActiveTable}
                tableAction={tableAction}
                setTableAction={setTableAction}
            />
        </Layout>
    </Router>
}

const ThemedApp = memo(ThemedAppBase)

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
