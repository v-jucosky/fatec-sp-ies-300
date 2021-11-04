import React, { useState } from 'react';
import { updateDoc, doc, serverTimestamp } from '@firebase/firestore';
import { Container, Typography, Button, TextField, Select, MenuItem } from '@material-ui/core';

import { database } from '../../utils/settings/firebase';
import { themePalette } from '../../utils/shared/game';

function ProfilePage({ auth, profile, pageHistory }) {
    const [formData, setFormData] = useState({
        displayName: profile.displayName,
        registerTimestamp: profile.registerTimestamp,
        palette: profile.palette,
        validationErrors: {}
    });

    function submitForm(event) {
        event.preventDefault();

        updateDoc(doc(database, 'profiles', auth.currentUser.uid), {
            displayName: formData.displayName,
            palette: formData.palette,
            updateTimestamp: serverTimestamp()
        }).then(() => {
            pageHistory.push('/');
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
                <Select required fullWidth id='palettePrimaryMain' variant='outlined' value={formData.palette.primary.main} onChange={(event) => setFormData({ ...formData, palette: { ...formData.palette, primary: { main: event.target.value } } })} style={{ marginBottom: 16 }}>
                    {themePalette.map(palette => {
                        return (
                            <MenuItem value={palette.code}>
                                {palette.name}
                            </MenuItem>
                        );
                    })}
                </Select>
                <TextField
                    disabled
                    fullWidth
                    id='registerTimestamp'
                    label='Registrado desde'
                    variant='outlined'
                    value={formData.registerTimestamp.toDate().toLocaleDateString()}
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
