export const parseParams = (search: string | undefined): { [k: string]: string } =>
    search ?
        search
            .substr(1)
            .split('&')
            .reduce((a: { [k: string]: string }, b) => {
                const ks = b.split('=')
                a[ks[0] as string] = ks[1]
                return a
            }, {})
        : {}

export const buildSearch = (params: (string | undefined)[]): string => {
    params = params.filter(p => typeof p !== 'undefined' && p.trim() !== '')
    if(params.length === 0) return ''
    return '?' + params.join('&')
}

export const rebuildSearch = (newName: string, newValue: string | undefined, search: string): string => {
    const searchParsed = (search.indexOf('?') === 0 ? search.substr(1).split('&') : [])
        .reduce((parsed, next: string) => {
            const nextV = next.split('=')
            parsed[nextV[0]] = nextV[1]
            return parsed
        }, {} as { [k: string]: string | undefined })

    searchParsed[newName] = newValue
    if(typeof searchParsed[newName] === 'undefined') {
        delete searchParsed[newName]
    }

    const newSearch = Object.keys(searchParsed).reduce((newSearch, k) => {
        newSearch.push(k + '=' + searchParsed[k])
        return newSearch
    }, [] as string[]).join('&')
    return newSearch ? '?' + newSearch : ''
}
