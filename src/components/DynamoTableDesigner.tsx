import React from 'react'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Alert from '@material-ui/lab/Alert'
import { Breadcrumbs, Link, MenuItem, MenuList } from '@material-ui/core'
import { useDynamoTables } from '../feature/DynamoTables'
import { Link as RouterLink, useHistory } from 'react-router-dom'
import { DesignerSchema } from './Designer/DesignerSchema'
import { DesignerExampleData } from './Designer/DesignerExampleData'
import { DesignerEntities } from './Designer/DesignerEntities'
import { useExplorerContext } from '../feature/ExplorerContext'
import { usePageTable } from './PageDynamoTable'

export const DynamoTableDesigner = (
    {
        match,
        loading,
    }: {
        match: { params: { [k: string]: string } }
        loading: number
    }
) => {
    const {activeTable} = usePageTable()
    const {id} = useExplorerContext()
    const {tableDetails} = useDynamoTables()
    const history = useHistory()
    const contentContainerRef = React.useRef<null | HTMLDivElement>(null)
    const configSection = match?.params?.configSection
    const table = activeTable ? tableDetails.get(activeTable) : undefined

    return <Box
        style={{
            flexGrow: 1, overflow: 'auto', display: 'flex',
            flexDirection: 'column', alignContent: 'flex-start',
        }}
    >
        <Box mt={2} mr={2} ml={2}>
            {configSection ? null : <Typography variant={'h1'} gutterBottom style={{marginTop: 12}}>
                Table{table?.meta?.name ? ': ' : null}
                {table?.meta?.name ? <code>{table?.meta?.name}</code> : null}
            </Typography>}
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    underline="hover"
                    color="inherit"
                    component={RouterLink}
                    to={'/table/' + activeTable + '/designer' + history.location.search}
                >
                    Designer
                </Link>
                {configSection ? <Typography color="textPrimary">{
                    configSection === 'schema' ? 'Table Schema' :
                        configSection === 'example-data' ? 'Example Data' :
                            configSection === 'entities' ? 'Entities' :
                                configSection
                }</Typography> : null}
            </Breadcrumbs>
        </Box>

        {configSection || !table ? null : <MenuList>
            <MenuItem onClick={() => history.push({
                pathname: '/table/' + activeTable + '/designer/schema',
                search: history.location.search,
            })}>1. Table Schema</MenuItem>
            <MenuItem onClick={() => history.push({
                pathname: '/table/' + activeTable + '/designer/example-data',
                search: history.location.search,
            })}>2. Example Data</MenuItem>
            <MenuItem
                disabled={!id}
                onClick={() => history.push({
                    pathname: '/table/' + activeTable + '/designer/entities',
                    search: history.location.search,
                })}
            >3. Entities {id ? '' : '(required explorer API)'}</MenuItem>
        </MenuList>}

        {table && configSection ?
            <Box
                mx={configSection === 'entities' ? 0 : 2}
                style={{
                    display: 'flex', flexDirection: 'column',
                    overflowY: 'auto',
                    // todo: check why this is needed for correct toolbar-side-flick,
                    //      without hidden the right side-tag adds scroll area
                    overflowX: 'hidden',
                    flexGrow: 1, position: 'relative'
                }}
                // @ts-ignore
                ref={contentContainerRef}
            >
                {configSection === 'schema' ? <DesignerSchema activeTable={activeTable}/> : null}
                {configSection === 'example-data' ? <DesignerExampleData activeTable={activeTable}/> : null}
                {configSection === 'entities' ? <DesignerEntities
                    activeTable={activeTable}
                    contentContainerRef={contentContainerRef}
                /> : null}
            </Box> : null}
        {loading === 2 && !table ? <Alert severity={'error'}>Table not found.</Alert> : null}
    </Box>
}
