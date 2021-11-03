import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Container, Typography, Button, TextField } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import { database } from '../../utils/settings/firebase';

function RegisterPage({ auth, pageHistory }) {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        validationErrors: {}
    });

    function submitForm(event) {
        event.preventDefault();

        createUserWithEmailAndPassword(auth, formData.email, formData.password)
            .then(user => {
                setDoc(doc(database, 'profiles', user.user.uid), {
                    displayName: formData.displayName,
                    registerTimestamp: serverTimestamp(),
                    superUser: false
                }).then(document => {
                    pageHistory.push('/');
                });
            }).catch(error => {
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
                Registrar
            </Typography>
            <Typography gutterBottom variant='subtitle1' style={{ marginBottom: 16 }}>
                Preencha o formulário abaixo para se registrar
            </Typography>
            {Object.keys(formData.validationErrors).map(errorCode => {
                return (
                    <Alert severity='error' onClose={() => closeAlert(errorCode)} style={{ marginBottom: 16 }}>
                        Ocorreu um erro ao processar sua solicitação ({errorCode})
                    </Alert>
                );
            })}
            <form noValidate autoComplete='off' style={{ marginBottom: 16 }}>
                <TextField
                    required
                    fullWidth
                    id='displayName'
                    label='Apelido'
                    variant='outlined'
                    value={formData.displayName}
                    onChange={(event) => setFormData({ ...formData, displayName: event.target.value })}
                    style={{ marginBottom: 16 }}
                />
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
                <Button variant='contained' color='primary' onClick={(event) => submitForm(event)}>
                    Registrar
                </Button>
            </form>
        </Container>
    );
};

export default RegisterPage;
