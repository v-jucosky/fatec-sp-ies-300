import React from 'react';
import { updateDoc, doc, serverTimestamp, Timestamp } from '@firebase/firestore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, MenuItem, Button } from '@mui/material';

import { database } from '../../utils/settings/firebase';
import { DEFAULT_ACCENT_COLOR_CODE } from '../../utils/settings/app';
import { THEME } from '../../utils/utils/type';

const profileDialogDefaultContent = {
    displayName: '',
    accentColorCode: DEFAULT_ACCENT_COLOR_CODE,
    createTimestamp: new Timestamp(),
    isOpen: false
};

function ProfileDialog({ dialogContent, setDialogContent, auth, purchases }) {
    function closeDialog() {
        setDialogContent(profileDialogDefaultContent);
    };

    function updateProfile() {
        updateDoc(doc(database, 'profiles', auth.currentUser.uid), {
            displayName: dialogContent.displayName,
            accentColorCode: dialogContent.accentColorCode,
            updateTimestamp: serverTimestamp()
        }).then(() => {
            closeDialog();
        });
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogContent.isOpen} onClose={() => closeDialog()}>
            <DialogTitle>
                Editar perfil
            </DialogTitle>
            <DialogContent>
                <Typography style={{ marginBottom: 16 }}>
                    Atualize seu perfil e preferências. Mais temas estão disponíveis na loja.
                </Typography>
                <TextField
                    required
                    fullWidth
                    autoFocus
                    id='displayName'
                    label='Apelido'
                    variant='outlined'
                    value={dialogContent.displayName}
                    onChange={(event) => setDialogContent({ ...dialogContent, displayName: event.target.value })}
                    style={{ marginBottom: 16 }}
                />
                <TextField
                    select
                    required
                    fullWidth
                    id='accentColorCode'
                    label='Cor de destaque'
                    variant='outlined'
                    value={dialogContent.accentColorCode}
                    onChange={(event) => setDialogContent({ ...dialogContent, accentColorCode: event.target.value })}
                    style={{ marginBottom: 16 }}
                >
                    <MenuItem value={DEFAULT_ACCENT_COLOR_CODE} key={'defaultAccentColor'}>
                        Padrão
                    </MenuItem>
                    {purchases.map(purchase => {
                        if (purchase.type === THEME) {
                            return (
                                <MenuItem value={purchase.item.colorCode} key={purchase.item.id}>
                                    {purchase.item.name}
                                </MenuItem>
                            );
                        } else {
                            return null;
                        };
                    })}
                </TextField>
                <TextField
                    disabled
                    fullWidth
                    id='createTimestamp'
                    label='Data de cadastro'
                    variant='outlined'
                    value={dialogContent.createTimestamp.toDate().toLocaleDateString()}
                />
            </DialogContent>
            <DialogActions>
                <Button color='neutral' onClick={() => closeDialog()}>
                    Cancelar
                </Button>
                <Button color='primary' disabled={dialogContent.displayName.length === 0} onClick={() => updateProfile()}>
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProfileDialog;
export { profileDialogDefaultContent };
