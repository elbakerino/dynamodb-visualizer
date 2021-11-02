import React from 'react'
import TextField from '@material-ui/core/TextField'

export const InputTextJson = <K extends {}>(
    {label, value, onChange}:
        {
            label: React.ReactNode
            value: K
            onChange: (newValue: K) => void
        }
) => {
    const [invalid, setInvalid] = React.useState<string | undefined>(undefined)
    const [textValue, setTextValue] = React.useState('')

    React.useEffect(() => {
        if(typeof value === 'undefined') return

        try {
            setTextValue(tv => {
                const tv2 = JSON.stringify(value, null, 4)
                try {
                    const parsed = JSON.parse(tv)
                    if(JSON.stringify(parsed, null, 4) !== tv2) {
                        return tv2
                    }
                } catch(e) {
                    return tv2
                }
                return tv
            })
        } catch(e) {
            setTextValue('')
        }
    }, [value, setTextValue, setInvalid])

    return <>
        <TextField
            multiline
            fullWidth
            label={label}
            value={textValue}
            error={Boolean(invalid)}
            helperText={invalid}
            style={{
                flexDirection: 'column',
                height: '100%',
            }}
            inputProps={{style: {overflow: 'auto'}}}
            InputProps={{style: {overflow: 'auto', flexDirection: 'column'}}}
            onChange={(e) => {
                try {
                    const tv = e.target.value
                    setTextValue(tv)
                    const parsed = JSON.parse(tv)
                    setInvalid(undefined)
                    if(JSON.stringify(parsed, null, 4) !== JSON.stringify(value, null, 4)) {
                        onChange(parsed)
                    }
                } catch(err) {
                    setInvalid(String(err))
                }
            }}
            onBlur={() => {
                try {
                    const parsed = JSON.parse(textValue)
                    setInvalid(undefined)
                    if(JSON.stringify(parsed, null, 4) !== JSON.stringify(value, null, 4)) {
                        onChange(parsed)
                    }
                } catch(err) {
                    setInvalid(String(err))
                }
            }}
        />
    </>
}
