import React, { useState } from 'react';
import { updateDoc, doc, getDoc } from '@firebase/firestore';
import { Container, Typography, Button, TextField } from '@material-ui/core';

import { database } from '../../utils/settings/firebase';

function ProfilePage({ auth, profile, setProfile, pageHistory }) {
    const [formData, setFormData] = useState({
        displayName: profile.data().displayName
    });

    function submitForm(event) {
        event.preventDefault();

        updateDoc(doc(database, 'profiles', auth.currentUser.uid), {
            displayName: formData.displayName
        }).then(() => {
            getDoc(doc(database, 'profiles', auth.currentUser.uid))
                .then(document => {
                    setProfile(document);
                    pageHistory.push('/');
                });
        });
    };

    return (
        <Container maxWidth='md' style={{ marginTop: 64 }}>
            <Typography gutterBottom variant='h4'>
                Perfil
            </Typography>
            <Typography gutterBottom variant='subtitle1' style={{ marginBottom: 16 }}>
                Atualize seu perfil.
            </Typography>
            <form noValidate autoComplete='off' style={{ marginBottom: 16 }}>
                <TextField
                    required
                    fullWidth
                    autoFocus
                    id='displayName'
                    label='Apelido'
                    variant='outlined'
                    value={formData.displayName}
                    onChange={(event) => setFormData({ ...formData, displayName: event.target.value })}
                    style={{ marginBottom: 16 }}
                />
                <Button variant='contained' color='primary' onClick={(event) => submitForm(event)}>
                    Salvar
                </Button>
            </form>
        </Container>
    );
};

export default ProfilePage;
