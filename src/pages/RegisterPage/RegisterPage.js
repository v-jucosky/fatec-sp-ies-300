import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, serverTimestamp, collection } from 'firebase/firestore';
import { Container, Typography, Button, TextField } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';

import { database } from '../../utils/settings/firebase';

function RegisterPage({ auth, pageHistory }) {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        username: '',
        password: '',
        validationErrors: {}
    });

    function submitForm(event) {
        event.preventDefault();

        createUserWithEmailAndPassword(auth, formData.email, formData.password)
            .then(async user => {
                await addDoc(collection(database, 'profiles'), {
                    user: user.user.uid,
                    displayName: formData.displayName,
                    registerTimestamp: serverTimestamp(),
                    superUser: false
                });

                pageHistory.push('/');
            })
            .catch(error => {
                setFormData({ ...formData, validationErrors: { ...formData.validationErrors, [error.code]: error } });
            });
    };

    function closeAlert(code) {
        let validationErrors = formData.validationErrors;

        delete validationErrors[code];

        setFormData({ ...formData, validationErrors: validationErrors });
    };

    return (
        <>
            <Container maxWidth='md'>
                <div style={{ marginTop: 64 }}>
                    <Typography gutterBottom variant='h4'>
                        Registrar
                    </Typography>
                    <Typography gutterBottom variant='subtitle1'>
                        Preencha o formulário abaixo para se registrar
                    </Typography>
                    {Object.keys(formData.validationErrors).map(code => {
                        return (
                            <Alert severity='error' onClose={() => closeAlert(code)} style={{ marginBottom: 16 }}>
                                <AlertTitle>Ooops!</AlertTitle>
                                Ocorreu um erro ao processar sua solicitação ({code})
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
                            onChange={(event) => setFormData({ ...formData, password_1: event.target.value })}
                            style={{ marginBottom: 16 }}
                        />
                        <Button variant='contained' color='primary' onClick={(event) => submitForm(event)}>
                            Registrar
                        </Button>
                    </form>
                </div>
            </Container>
        </>
    );
};

export default RegisterPage;
