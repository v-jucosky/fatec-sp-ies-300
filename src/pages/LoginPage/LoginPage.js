import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Container, Typography, Button, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

function LoginPage({ auth }) {
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
        validationErrors: {}
    });

    function login(event) {
        event.preventDefault();

        signInWithEmailAndPassword(auth, loginData.email, loginData.password)
            .catch(error => {
                setLoginData({ ...loginData, validationErrors: { ...loginData.validationErrors, [error.code]: error } });
            });
    };

    function closeAlert(errorCode) {
        let validationErrors = loginData.validationErrors;

        delete validationErrors[errorCode];

        setLoginData({ ...loginData, validationErrors: validationErrors });
    };

    return (
        <Container maxWidth='md' style={{ marginTop: 64, marginBottom: 64 }}>
            <Typography gutterBottom variant='h4'>
                Login
            </Typography>
            <Typography gutterBottom variant='subtitle1' style={{ marginBottom: 16 }}>
                Realize o login para poder jogar ou registre-se.
            </Typography>
            {Object.keys(loginData.validationErrors).map(errorCode => {
                return (
                    <Alert severity='error' onClose={() => closeAlert(errorCode)} style={{ marginBottom: 16 }}>
                        Ocorreu um erro ao processar sua solicitação ({errorCode}).
                    </Alert>
                );
            })}
            <TextField
                required
                fullWidth
                autoFocus
                id='email'
                label='E-mail'
                variant='outlined'
                value={loginData.email}
                onChange={(event) => setLoginData({ ...loginData, email: event.target.value })}
                style={{ marginBottom: 16 }}
            />
            <TextField
                required
                fullWidth
                id='password'
                label='Senha'
                variant='outlined'
                type='password'
                value={loginData.password}
                onChange={(event) => setLoginData({ ...loginData, password: event.target.value })}
                style={{ marginBottom: 16 }}
            />
            <Button variant='contained' color='primary' onClick={(event) => login(event)} style={{ marginRight: 16 }}>
                Login
            </Button>
            <Button variant='contained' color='primary' to='/registrar' component={Link} >
                Registrar
            </Button>
        </Container>
    );
};

export default LoginPage;
