import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { updateDoc, doc, serverTimestamp } from '@firebase/firestore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, MenuItem, Button, Link as MaterialLink } from '@material-ui/core';

import { database } from '../../utils/settings/firebase';

function ProfileDialog({ dialogData, setDialogData, auth, profile, themes }) {
    const [profileData, setProfileData] = useState({ ...profile });

    useEffect(() => {
        setProfileData({ ...profile });
    }, [profile]);

    function closeDialog() {
        setProfileData({ ...profile });
        setDialogData({ ...dialogData, open: false });
    };

    function updateProfile() {
        updateDoc(doc(database, 'profiles', auth.currentUser.uid), {
            displayName: profileData.displayName,
            palette: profileData.palette,
            updateTimestamp: serverTimestamp()
        }).then(() => {
            closeDialog();
        });
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogData.open} onClose={() => closeDialog()}>
            <DialogTitle>
                Editar perfil
            </DialogTitle>
            <DialogContent>
                <Typography gutterBottom style={{ marginBottom: 16 }}>
                    Atualize seu perfil e preferências.
                    <br />
                    Visite a <MaterialLink to='/loja' component={Link}>loja de temas</MaterialLink> para visualizar mais temas.
                </Typography>
                <TextField
                    required
                    fullWidth
                    autoFocus
                    id='displayName'
                    label='Apelido'
                    variant='outlined'
                    value={profileData.displayName}
                    onChange={(event) => setProfileData({ ...profileData, displayName: event.target.value })}
                    style={{ marginBottom: 16 }}
                />
                <TextField
                    select
                    required
                    fullWidth
                    id='palettePrimaryMain'
                    label='Cor de destaque'
                    variant='outlined'
                    value={profileData.palette.primary.main}
                    onChange={(event) => setProfileData({ ...profileData, palette: { ...profileData.palette, primary: { ...profileData.palette.primary, main: event.target.value } } })}
                    style={{ marginBottom: 16 }}
                >
                    {themes.map(theme => {
                        return (
                            <MenuItem value={theme.code}>
                                {theme.name}
                            </MenuItem>
                        );
                    })}
                </TextField>
                <TextField
                    disabled
                    fullWidth
                    id='registerTimestamp'
                    label='Data de cadastro'
                    variant='outlined'
                    value={profileData.registerTimestamp.toDate().toLocaleDateString()}
                />
            </DialogContent>
            <DialogActions>
                <Button color='primary' onClick={() => closeDialog()}>
                    Cancelar
                </Button>
                <Button color='primary' onClick={() => updateProfile()}>
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProfileDialog;
