import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { DynamoTables } from './DynamoTables'
import { DynamoTablePage } from './DynamoTablePage'
import { DynamoPresets } from './DynamoTableData'

const getLocal = () => {
    const entryIndex = window.localStorage.getItem('dyndb-preview--tables-index')
    let parsedEntry: {
        data: any[] | undefined
        index: string[] | undefined
    } = {
        data: undefined,
        index: undefined,
    }
    if(entryIndex) {
        try {
            parsedEntry.index = JSON.parse(entryIndex)
        } catch(e) {
            console.log('error json data for tables-index', e)
        }
    }
    if(parsedEntry.index) {
        [...parsedEntry.index].forEach((tableId, i) => {
            try {
                const entryData = window.localStorage.getItem('dyndb-preview--table__' + tableId)
                if(entryData) {
                    if(!parsedEntry.data) parsedEntry.data = []

                    parsedEntry.data.push(JSON.parse(entryData))
                } else {
                    parsedEntry.index?.splice(i, 1)
                }
            } catch(e) {
                console.log('error json data for table__' + tableId, e)
            }
        })
    }
    return parsedEntry
}

const setLocalTable = (table: any) => {
    window.localStorage.setItem('dyndb-preview--table__' + table.id, JSON.stringify(table))
}

const setLocalIndex = (updater: (tables: string[] | undefined) => string[]) => {
    const prev = window.localStorage.getItem('dyndb-preview--tables-index')
    let next
    try {
        next = updater(prev ? JSON.parse(prev) : [])
    } catch(e) {
        next = updater([])
    }
    window.localStorage.setItem('dyndb-preview--tables-index', JSON.stringify(next))
}

export const setLocalPreset = (table: string, presets: DynamoPresets) => {
    window.localStorage.setItem('dyndb-preview--table_presets__' + table, JSON.stringify(presets))
}

export const getLocalPresets = (tableId: string): DynamoPresets => {
    const entry = window.localStorage.getItem('dyndb-preview--table_presets__' + tableId)
    let parsed: DynamoPresets = []
    if(entry) {
        try {
            parsed = JSON.parse(entry)
        } catch(e) {
            console.log('error json data for table_presets__' + tableId, e)
        }
    }
    return parsed
}

export const Visualizer = (
    {
        activeTable, setActiveTable,
        tableAction, setTableAction,
    }:
        {
            activeTable: string | undefined
            setActiveTable: (table: string | undefined) => void
            tableAction: string | undefined
            setTableAction: (table: string | undefined) => void
        }
) => {
    const [tables, setTables] = React.useState<any>(() => getLocal())

    const updateTables = React.useCallback((table: any | ((table?: any) => any), id: string | undefined) => {
        setTables((tables: any) => {
            let tablesData = [...(tables.data || [])]
            const index = tablesData.findIndex(t => t.id === id)
            if(index !== -1) {
                table = typeof table === 'function' ? table(tablesData[index]) : table
                tablesData.splice(index, 1, table)
            } else {
                table = typeof table === 'function' ? table() : table
                tablesData.push(table)
            }

            if(table.id) {
                setLocalTable(table)
            }

            setLocalIndex((current = []) => tablesData.reduce((a, b) => {
                if(a.includes(b.id)) return a
                a.push(b.id)
                return a
            }, current))
            tables.data = tablesData
            return {...tables}
        })
    }, [setTables])

    const tablesData = tables?.data || []

    return <Switch>
        <Route path="/" exact>
            <DynamoTables
                tables={tablesData}
                updateTables={updateTables}
                activeTable={activeTable}
            />
        </Route>
        <Route path="/table/:tableId/:tableAction?"
               render={({match}) =>
                   <DynamoTablePage
                       tables={tablesData}
                       updateTables={updateTables}
                       activeTable={activeTable}
                       setActiveTable={setActiveTable}
                       tableAction={tableAction}
                       setTableAction={setTableAction}
                       match={match}
                   />
               }
        />
    </Switch>
}
