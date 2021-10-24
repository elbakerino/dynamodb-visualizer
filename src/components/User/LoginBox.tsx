import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core'
import React from 'react'
import { useExplorerContext } from '../../feature/ExplorerContext'

export const LoginBox: React.ComponentType<{
    open: boolean
    onClose: () => void
}> = ({open, onClose}) => {
    const {login, createUser, id} = useExplorerContext()
    const emailInp = React.useRef<null | HTMLInputElement>(null)
    const [email, setEmail] = React.useState<string>('')
    const [password, setPassword] = React.useState<string>('')

    // hack to have the correct ref after mount,
    // otherwise e.g. the validity lags behind "one browser change" before any user change
    const [, setMounted] = React.useState(false)
    React.useEffect(() => {
        const timer = window.setTimeout(() => setMounted(o => !o), 50)
        return () => window.clearTimeout(timer)
    }, [open, setMounted, emailInp])

    return <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth={'xs'}>
        <DialogTitle>
            Authentication
        </DialogTitle>
        <form>
            <DialogContent style={{paddingTop: 0}}>
                <small style={{display: 'block'}}>Login or register for explorer:</small>
                <small style={{display: 'block'}}>{id}</small>

                <Box my={2}>
                    <TextField
                        fullWidth type={'email'}
                        label={'E-Mail'}
                        inputRef={emailInp}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        error={email.length > 3 && !emailInp.current?.validity?.valid}
                        helperText={!emailInp.current?.validity?.valid ? 'Invalid email.' : ''}
                    />
                </Box>
                <Box mb={2}>
                    <TextField
                        fullWidth type={'password'}
                        label={'Password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        error={password.length > 1 && password.length < 8}
                        helperText={password.length > 1 && password.length < 8 ? 'Passwort needs min. 8 characters.' : ''}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={Boolean(!email || !password || !emailInp.current?.validity?.valid)}
                    onClick={() => {
                        createUser(email, password).then()
                    }}
                >Register</Button>

                <Button
                    disabled={Boolean(!email || !password || !emailInp.current?.validity?.valid)}
                    onClick={() => {
                        login(email, password).then(res => res ? onClose() : null)
                    }}
                >Login</Button>
            </DialogActions>
        </form>
    </Dialog>
}
