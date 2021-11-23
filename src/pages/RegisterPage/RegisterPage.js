import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Container, Typography, Button, TextField } from '@mui/material';
import { Alert } from '@mui/lab';

import { database } from '../../utils/settings/firebase';
import { DEFAULT_ACCENT_COLOR_CODE } from '../../utils/settings/app';

function RegisterPage({ auth }) {
    const pageHistory = useHistory();
    const [formContent, setFormContent] = useState({
        displayName: '',
        email: '',
        password: '',
        validationErrors: {}
    });

    function createUser() {
        createUserWithEmailAndPassword(auth, formContent.email, formContent.password)
            .then(user => {
                setDoc(doc(database, 'profiles', user.user.uid), {
                    userId: user.user.uid,
                    displayName: formContent.displayName,
                    accentColorCode: DEFAULT_ACCENT_COLOR_CODE,
                    isSuperUser: false,
                    createTimestamp: serverTimestamp(),
                    updateTimestamp: serverTimestamp()
                }).then(document => {
                    pageHistory.push('/');
                });
            }).catch(error => {
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
                Registrar
            </Typography>
            <Typography style={{ marginBottom: 16 }}>
                Preencha o formulário abaixo para se registrar.
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
                id='displayName'
                label='Apelido'
                variant='outlined'
                value={formContent.displayName}
                onChange={(event) => setFormContent({ ...formContent, displayName: event.target.value })}
                style={{ marginBottom: 16 }}
            />
            <TextField
                required
                fullWidth
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
            <Button variant='contained' color='primary' onClick={() => createUser()}>
                Registrar
            </Button>
        </Container>
    );
};

export default RegisterPage;
