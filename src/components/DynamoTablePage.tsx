import React, { memo } from 'react'
import { DynamoTableMeta } from './DynamoTableMeta'
import { DynamoTableData } from './DynamoTableData'
import { Route, Switch } from 'react-router-dom'

const DynamoTablePageBase = (
    {
        tables,
        updateTables,
        match,
        activeTable, setActiveTable,
        setTableAction
    }: {
        tables: any[],
        updateTables: (table: (any | ((table?: any) => any)), id: (string | undefined)) => void
        activeTable: string | undefined
        setActiveTable: (table: string | undefined) => void
        tableAction: string | undefined
        setTableAction: (table: string | undefined) => void
        match: { params: { [k: string]: string } }
    }
) => {
    const matchTableId = match.params.tableId
    React.useEffect(() => {
        setActiveTable(matchTableId)
        return () => setActiveTable(undefined)
    }, [setActiveTable, matchTableId])
    const matchTableAction = match.params.tableAction
    React.useEffect(() => {
        setTableAction(matchTableAction)
        return () => setTableAction(undefined)
    }, [setTableAction, matchTableAction])

    return <>
        <Switch>
            <Route
                path={[
                    `/table/${matchTableId}`,
                    `/table/${matchTableId}/config`,
                ]}
                exact
            >
                <DynamoTableMeta
                    tables={tables}
                    updateTables={updateTables}
                    activeTable={activeTable}
                />
            </Route>

            <Route path={`/table/${matchTableId}/data`}>
                <DynamoTableData
                    tables={tables}
                    activeTable={activeTable}
                />
            </Route>
        </Switch>
    </>
}
export const DynamoTablePage = memo(DynamoTablePageBase)
