import React from 'react'
import { useExplorerContext } from '../../feature/ExplorerContext'
import { Box, Button, TextField, Typography } from '@material-ui/core'
import { fetcher } from '../../lib/ApiHelper'
import jwtDecode from 'jwt-decode'
import { useUserProfile } from '../../feature/useUserProfile'

export const UserProfile: React.ComponentType<{}> = () => {
    const {
        connection, id,
        logout, logoutFromAll,
    } = useExplorerContext()
    const {userDetails, loadDetails, save} = useUserProfile()
    const [newPassword, setNewPassword] = React.useState<string>('')
    const [newPasswordConfirm, setNewPasswordConfirm] = React.useState<string>('')
    const [tmpToken, setTmpToken] = React.useState<{ token: string, expire: number | undefined } | undefined>()
    const authUser = connection?.auth?.user
    const profile = authUser ? userDetails.get(authUser) : undefined

    React.useEffect(() => {
        if(authUser) {
            loadDetails(authUser).then()
        }
    }, [authUser, loadDetails])
    return <Box m={2} style={{flexGrow: 1}}>
        <Typography variant={'h4'}>User{connection?.auth?.user ? ': ' + connection?.auth?.user : ''}</Typography>
        {connection?.auth?.user ? null : <Typography>Login required</Typography>}
        <Button size={'small'} onClick={() => logoutFromAll()}>Logout from all</Button>

        {id && connection?.auth?.user ? <Box>
            <Button size={'small'} onClick={() => id && logout(id)}>Logout</Button>

            <Box my={2}>
                {profile?.meta?.created_at ? <Typography variant={'body2'}>Created: {new Date(profile.meta?.created_at).toLocaleString()}</Typography> : null}
                {profile?.meta?.updated_at ? <Typography variant={'body2'}>Updated: {new Date(profile.meta?.updated_at).toLocaleString()}</Typography> : null}
            </Box>
            <Box my={2}>
                <Typography variant={'h4'}>Password</Typography>
                <form>
                    <Box mb={1}>
                        <TextField
                            label={'Password'} type={'password'}
                            fullWidth
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                    </Box>
                    <Box mb={1}>
                        <TextField
                            label={'Confirm Password'} type={'password'}
                            fullWidth
                            value={newPasswordConfirm}
                            onChange={e => setNewPasswordConfirm(e.target.value)}
                            error={newPassword !== newPasswordConfirm}
                            helperText={newPassword !== newPasswordConfirm ? 'Passwords do not match.' : ''}
                        />
                    </Box>
                    <Button
                        disabled={!newPassword || !newPasswordConfirm || newPassword !== newPasswordConfirm}
                        onClick={() => authUser && save(authUser, {password: newPassword}).then((res) => {
                            if(res) {
                                setNewPassword('')
                                setNewPasswordConfirm('')
                            }
                        })}
                    >change password</Button>
                </form>
            </Box>

            <Box my={2}>
                <Button size={'small'} onClick={() => {
                    fetcher(id + '/token', 'GET', undefined, connection?.auth?.token)
                        .then(res => {
                            const t = res.data.token
                            const decoded = t ? jwtDecode(t) as { exp: number } : undefined
                            setTmpToken(res.data.token ? {
                                token: res.data.token,
                                expire: decoded?.exp || undefined,
                            } : undefined)
                        })
                }}>Get Token</Button>
                {tmpToken ? <Box my={1}>
                    <Typography variant={'subtitle1'} style={{marginBottom: 0}}>Token:</Typography>
                    <Typography variant={'body2'} component={'div'}>
                        <pre style={{
                            margin: 0, whiteSpace: 'break-spaces',
                            wordBreak: 'break-all',
                        }}><code>{tmpToken?.token}</code></pre>
                    </Typography>
                    {tmpToken?.expire ? <Typography variant={'caption'} style={{marginBottom: 0}}>Expires: {new Date(tmpToken.expire * 1000).toLocaleString()}</Typography> : null}
                </Box> : null}
            </Box>
        </Box> : null}
    </Box>
}
