import React, { useState } from 'react';
import { updateDoc, doc, serverTimestamp } from '@firebase/firestore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, MenuItem, Button } from '@material-ui/core';

import { database } from '../../utils/settings/firebase';
import { themePalette as palettes } from '../../utils/shared/game';

function ProfileDialog({ dialogData, setDialogData, auth, profile }) {
    const [profileData, setProfileData] = useState({ ...profile });

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
        <Dialog open={dialogData.open} onClose={() => closeDialog()}>
            <DialogTitle>
                Perfil
            </DialogTitle>
            <DialogContent>
                <Typography gutterBottom style={{ marginBottom: 16 }}>
                    Atualize seu perfil e preferências.
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
                    {palettes.map(palette => {
                        return (
                            <MenuItem value={palette.code}>
                                {palette.name}
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
                    style={{ marginBottom: 16 }}
                />
                <TextField
                    disabled
                    fullWidth
                    id='updateTimestamp'
                    label='Data da última atualização'
                    variant='outlined'
                    value={profileData.updateTimestamp.toDate().toLocaleDateString()}
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
