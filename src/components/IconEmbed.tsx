import React, { memo } from 'react'
import { Icon1Icon, useIcon1, useIcon1Actions } from '../lib/Icon1Provider'
import { Skeleton } from '@material-ui/lab'

export interface IconEmbedBaseProps {
    icon: Icon1Icon | undefined
    title?: string
    color: string
    fontSize?: string
}

export const IconEmbedBase: React.ComponentType<IconEmbedBaseProps> = (
    {
        icon,
        title,
        fontSize = 'default',
        color,
    }
) => {
    const fontSizeCss =
        fontSize === 'inherit' ?
            'inherit' :
            fontSize === 'small' ?
                '1.25rem' :
                fontSize === 'medium' || fontSize === 'default' ?
                    '1.5rem' :
                    fontSize === 'large' ?
                        '2.1875rem' : fontSize
    return <span style={{
        display: 'inline-block',
    }}>
        {/* @ts-ignore */}
        {icon?.data ?
            <span
                /* @ts-ignore */
                dangerouslySetInnerHTML={{__html: icon.data}}
                title={title}
                style={{
                    width: '1em',
                    height: '1em',
                    display: 'flex',
                    color: color,
                    fill: 'currentColor',
                    // todo: check where mui saves this size and reuse it
                    fontSize: fontSizeCss,
                    padding: '0.125em',
                }}
            /> :
            // todo: make skeleton with fontSize `inherit` compatible
            fontSizeCss !== 'inherit' ?
                <Skeleton
                    variant="circle"
                    width={fontSizeCss}
                    height={fontSizeCss}
                    style={{transform: 'scale(0.9)'}}
                /> : null}
    </span>
}
export const IconEmbedBaseMemo = memo(IconEmbedBase)

export interface IconEmbedLoaderProps {
    provider: string
    id: string
    title?: string
    color: string
    fontSize?: string
    IconEmbed: React.ComponentType<IconEmbedBaseProps>
}

/**
 * Wrapper component that preloads the icon and injects it into `IconEmbed`
 */
export const IconEmbedLoader: React.ComponentType<IconEmbedLoaderProps> = (
    {
        provider, id,
        title,
        fontSize = 'default',
        color,
        IconEmbed,
    }
) => {
    const {iconDetails} = useIcon1()
    const {loadIcon} = useIcon1Actions()

    const idColor = 'default'

    React.useEffect(() => {
        loadIcon(provider, id, idColor)
    }, [loadIcon, provider, id, idColor])

    const icon = iconDetails[provider] && iconDetails[provider][id] && iconDetails[provider][id][idColor] ?
        iconDetails[provider][id][idColor] : undefined

    return <IconEmbed color={color} icon={icon} fontSize={fontSize} title={icon?.title || title}/>
}

export const IconEmbed: React.ComponentType<Omit<IconEmbedLoaderProps, 'IconEmbed'>> = (props) => {
    return <IconEmbedLoader {...props} IconEmbed={IconEmbedBaseMemo}/>
}
