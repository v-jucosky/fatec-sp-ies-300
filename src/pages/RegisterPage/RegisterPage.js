import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Container, Typography, Button, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import { database } from '../../utils/settings/firebase';

function RegisterPage({ auth, pageHistory }) {
    const [registerData, setRegisterData] = useState({
        displayName: '',
        email: '',
        password: '',
        validationErrors: {}
    });

    function createUser(event) {
        event.preventDefault();

        createUserWithEmailAndPassword(auth, registerData.email, registerData.password)
            .then(user => {
                setDoc(doc(database, 'profiles', user.user.uid), {
                    userId: user.user.uid,
                    displayName: registerData.displayName,
                    palette: {
                        primary: {
                            main: '#3f51b5'
                        }
                    },
                    superUser: false,
                    registerTimestamp: serverTimestamp(),
                    updateTimestamp: serverTimestamp()
                }).then(document => {
                    pageHistory.push('/');
                });
            }).catch(error => {
                setRegisterData({ ...registerData, validationErrors: { ...registerData.validationErrors, [error.code]: error } });
            });
    };

    function closeAlert(errorCode) {
        let validationErrors = registerData.validationErrors;

        delete validationErrors[errorCode];

        setRegisterData({ ...registerData, validationErrors: validationErrors });
    };

    return (
        <Container maxWidth='md' style={{ marginTop: 64 }}>
            <Typography gutterBottom variant='h4'>
                Registrar
            </Typography>
            <Typography gutterBottom variant='subtitle1' style={{ marginBottom: 16 }}>
                Preencha o formulário abaixo para se registrar.
            </Typography>
            {Object.keys(registerData.validationErrors).map(errorCode => {
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
                    autoFocus
                    id='displayName'
                    label='Apelido'
                    variant='outlined'
                    value={registerData.displayName}
                    onChange={(event) => setRegisterData({ ...registerData, displayName: event.target.value })}
                    style={{ marginBottom: 16 }}
                />
                <TextField
                    required
                    fullWidth
                    id='email'
                    label='E-mail'
                    variant='outlined'
                    value={registerData.email}
                    onChange={(event) => setRegisterData({ ...registerData, email: event.target.value })}
                    style={{ marginBottom: 16 }}
                />
                <TextField
                    required
                    fullWidth
                    id='password'
                    label='Senha'
                    variant='outlined'
                    type='password'
                    value={registerData.password}
                    onChange={(event) => setRegisterData({ ...registerData, password: event.target.value })}
                    style={{ marginBottom: 16 }}
                />
                <Button variant='contained' color='primary' onClick={(event) => createUser(event)}>
                    Registrar
                </Button>
            </form>
        </Container>
    );
};

export default RegisterPage;
