import { ParsedDataResult } from './DynamoTableData'

export const parseExampleData = (
    index: any[],
    tableItems: any[]
) => {
    const sorted: ParsedDataResult['sorted'] = {}
    const allKeys: string[] = []

    const primary = index[0]
    const sort = index[1]
    tableItems.forEach((item: any) => {
        if(!primary) return
        const primaryValObj = item[primary.AttributeName]
        if(!primaryValObj) return
        let sortValObj
        if(sort) {
            sortValObj = item[sort.AttributeName]
            if(!sortValObj) return
        }

        const primaryVal = Object.values(primaryValObj)[0] as string

        if(!sorted[primaryVal]) {
            sorted[primaryVal] = []
        }
        sorted[primaryVal].push(item)

        Object.keys(item)
            .filter(k => k !== primary.AttributeName && k !== sort.AttributeName)
            .forEach((ik) => allKeys.includes(ik) ? null : allKeys.push(ik))
    })

    Object.keys(sorted).forEach(k => {
        sorted[k] = sorted[k].sort((a, b) => {
            const sortValA = Object.values(a[sort.AttributeName])[0] as string
            const sortValB = Object.values(b[sort.AttributeName])[0] as string

            return sortValA.localeCompare(sortValB)
        })
    })

    return {sorted, allKeys}
}
