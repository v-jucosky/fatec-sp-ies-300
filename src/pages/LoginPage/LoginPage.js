import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Container, Typography, Button, TextField } from '@mui/material';
import { Alert } from '@mui/lab';

function LoginPage({ auth }) {
    const [formContent, setFormContent] = useState({
        email: '',
        password: '',
        validationErrors: {}
    });

    function authenticateUser() {
        signInWithEmailAndPassword(auth, formContent.email, formContent.password)
            .catch(error => {
                setFormContent({ ...formContent, validationErrors: { ...formContent.validationErrors, [error.code]: error } });
            });
    };

    function closeAlert(errorCode) {
        let validationErrors = formContent.validationErrors;

        delete validationErrors[errorCode];

        setFormContent({ ...formContent, validationErrors: validationErrors });
    };

    return (
        <Container maxWidth='md' style={{ marginTop: 64, marginBottom: 64 }}>
            <Typography gutterBottom variant='h4'>
                Login
            </Typography>
            <Typography style={{ marginBottom: 16 }}>
                Realize o login para poder jogar ou registre-se.
            </Typography>
            {Object.keys(formContent.validationErrors).map(errorCode => {
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
                value={formContent.email}
                onChange={(event) => setFormContent({ ...formContent, email: event.target.value })}
                style={{ marginBottom: 16 }}
            />
            <TextField
                required
                fullWidth
                id='password'
                label='Senha'
                variant='outlined'
                type='password'
                value={formContent.password}
                onChange={(event) => setFormContent({ ...formContent, password: event.target.value })}
                style={{ marginBottom: 16 }}
            />
            <Button variant='contained' color='primary' onClick={() => authenticateUser()} style={{ marginRight: 16 }}>
                Login
            </Button>
            <Button variant='contained' color='primary' to='/registrar' component={Link} >
                Registrar
            </Button>
        </Container>
    );
};

export default LoginPage;
