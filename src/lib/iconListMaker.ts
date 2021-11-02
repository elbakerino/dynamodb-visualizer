import siSimpleicons from 'simple-icons'
import * as Icons from '@material-ui/icons'

function splitCamelCase(word: string) {
    const capRe = /[A-Z]/
    const output = []
    let w = ''
    for(let i = 0, l = word.length; i < l; i += 1) {
        if(i === 0) {
            w += word[i].toUpperCase()
        } else {
            if(capRe.test(word[i])) {
                output.push(w)
                w = ''
            }
            w += word[i]
        }
    }
    output.push(w)
    return output
}

const iconListMaker = () => {

    // @ts-ignore
    console.log(JSON.stringify(Object.values(siSimpleicons).map(i => ({
        // @ts-ignore
        title: i.title,
        // @ts-ignore
        id: i.slug,
        // @ts-ignore
        source: i.source,
        // @ts-ignore
        colorDefault: i.hex ? '#' + i.hex : undefined,
        provider: 'simple-icons',
    }))))
    const muiIcons = Object.keys(Icons).map(i => ({
        title: i,
    }))

    const muiIconsParsed: any = {}
    const variantIds = ['Outlined', 'Rounded', 'Sharp', 'TwoTone']
    muiIcons.forEach(c => {
        const variantId = variantIds.reduce((isV, v) => {
            return isV || (c.title.endsWith(v) ? v : '')
        }, '')

        let id
        let title
        if(variantId) {
            id = c.title.substr(0, c.title.indexOf(variantId))
            const titleParts = splitCamelCase(id)
            title = titleParts.join(' ')
        } else {
            const titleParts = splitCamelCase(c.title)
            id = c.title
            title = titleParts.join(' ')
            //console.log(2, id, title, titleParts)
        }
        muiIconsParsed[id] = {
            id: id,
            title: title,
            variants: muiIconsParsed[id] && muiIconsParsed[id].variants ? muiIconsParsed[id].variants : [],
            provider: 'mui',
        }
        if(variantId) {
            muiIconsParsed[id].variants.push(splitCamelCase(variantId).join(' '))
        }
    })
    console.log(JSON.stringify(Object.values(muiIconsParsed)))
}

// @ts-ignore
window.iconListMaker = iconListMaker
