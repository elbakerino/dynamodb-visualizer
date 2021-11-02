import React from 'react'
import { useExplorerContext } from '../feature/ExplorerContext'

export const IconImg: React.ComponentType<{
    src: string
    title: string
    fontSize?: string
    disableGutters?: boolean
}> = (
    {
        src,
        title,
        fontSize = 'default',
        disableGutters,
    }
) => {
    return <>
        <span style={{
            display: 'inline-block',
        }}><img
            src={src}
            alt={title}
            style={{
                width: '1em',
                height: '1em',
                display: 'block',
                // todo: check where mui saves this size and reuse it
                fontSize:
                    fontSize === 'inherit' ?
                        'inherit' :
                        fontSize === 'small' ?
                            '1.25rem' :
                            fontSize === 'medium' || fontSize === 'default' ?
                                '1.5rem' :
                                fontSize === 'large' ?
                                    '2.1875rem' : fontSize,
                padding: disableGutters ? undefined : '0.125em',
            }}
        /></span>
    </>
}

export const Icon1Img: React.ComponentType<{
    provider: string
    id: string
    title: string
    color: string
    fontSize?: string
    disableGutters?: boolean
}> = (
    {
        provider, id,
        title,
        fontSize = 'default',
        color, disableGutters,
    }
) => {
    const {id: endpoint} = useExplorerContext()
    return <IconImg
        src={endpoint + '/icon/' + provider + '/' + id + (color ? '?color=' + encodeURIComponent(color) : '')}
        title={title}
        fontSize={fontSize}
        disableGutters={disableGutters}
    />
}
