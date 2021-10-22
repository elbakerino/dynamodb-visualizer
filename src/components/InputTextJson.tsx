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
    const [textValue, setTextValue] = React.useState('')

    React.useEffect(() => {
        if(typeof value === 'undefined') return

        try {
            setTextValue(JSON.stringify(value, null, 4))
        } catch(e) {
            setTextValue('')
        }
    }, [value, setTextValue])

    return <>
        <TextField
            multiline
            fullWidth
            label={label}
            value={textValue}
            //maxRows={25}
            onChange={(e) => {
                setTextValue(e.target.value)
            }}
            onBlur={() => {
                try {
                    const val = JSON.parse(textValue)
                    onChange(val)
                } catch(err) {
                    // noop
                    console.log('WARN: invalid json in InputTextJson')
                }
            }}
        />
    </>
}
