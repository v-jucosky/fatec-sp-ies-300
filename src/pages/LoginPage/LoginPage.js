import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Container, Typography, Button, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

function LoginPage({ auth, pageHistory }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        validationErrors: {}
    });

    function submitForm(event) {
        event.preventDefault();

        signInWithEmailAndPassword(auth, formData.email, formData.password)
            .catch(error => {
                setFormData({ ...formData, validationErrors: { ...formData.validationErrors, [error.code]: error } });
            });
    };

    function closeAlert(errorCode) {
        let validationErrors = formData.validationErrors;

        delete validationErrors[errorCode];

        setFormData({ ...formData, validationErrors: validationErrors });
    };

    return (
        <Container maxWidth='md' style={{ marginTop: 64 }}>
            <Typography gutterBottom variant='h4'>
                Login
            </Typography>
            <Typography gutterBottom variant='subtitle1' style={{ marginBottom: 16 }}>
                Realize o login para poder jogar ou registre-se.
            </Typography>
            {Object.keys(formData.validationErrors).map(errorCode => {
                return (
                    <Alert severity='error' onClose={() => closeAlert(errorCode)} style={{ marginBottom: 16 }}>
                        Ocorreu um erro ao processar sua solicitação ({errorCode}).
                    </Alert>
                );
            })}
            <form noValidate autoComplete='off' style={{ marginBottom: 16 }}>
                <TextField
                    required
                    fullWidth
                    id='email'
                    label='E-mail'
                    variant='outlined'
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    style={{ marginBottom: 16 }}
                />
                <TextField
                    required
                    fullWidth
                    id='password'
                    label='Senha'
                    variant='outlined'
                    type='password'
                    value={formData.password}
                    onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                    style={{ marginBottom: 16 }}
                />
                <Button variant='contained' color='primary' onClick={(event) => submitForm(event)} style={{ marginRight: 16 }}>
                    Login
                </Button>
                <Button variant='contained' color='primary' to='/registrar' component={Link} >
                    Registrar
                </Button>
            </form>
        </Container>
    );
};

export default LoginPage;
