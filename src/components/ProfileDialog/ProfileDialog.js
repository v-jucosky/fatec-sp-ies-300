import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { updateDoc, doc, serverTimestamp } from '@firebase/firestore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, MenuItem, Button, Link as MaterialLink } from '@material-ui/core';

import { database } from '../../utils/settings/firebase';

function ProfileDialog({ dialogState, setDialogState, auth, profile, purchases }) {
    const [dialogContent, setDialogContent] = useState({ ...profile });

    useEffect(() => {
        setDialogContent({ ...profile });
    }, [profile]);

    function closeDialog() {
        setDialogContent({ ...profile });
        setDialogState({ ...dialogState, open: false });
    };

    function updateProfile() {
        updateDoc(doc(database, 'profiles', auth.currentUser.uid), {
            displayName: dialogContent.displayName,
            accentColor: dialogContent.accentColor,
            updateTimestamp: serverTimestamp()
        }).then(() => {
            closeDialog();
        });
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogState.open} onClose={() => closeDialog()}>
            <DialogTitle>
                Editar perfil
            </DialogTitle>
            <DialogContent>
                <Typography gutterBottom style={{ marginBottom: 16 }}>
                    Atualize seu perfil e preferências. Mais temas estão disponíveis na <MaterialLink to='/loja' component={Link}>loja de temas</MaterialLink>.
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
                    id='accentColor'
                    label='Cor de destaque'
                    variant='outlined'
                    value={dialogContent.accentColor}
                    onChange={(event) => setDialogContent({ ...dialogContent, accentColor: event.target.value })}
                    style={{ marginBottom: 16 }}
                >
                    <MenuItem value={'#3f51b5'}>
                        Padrão
                    </MenuItem>
                    {purchases.map(purchase => {
                        if (purchase.type === 'theme') {
                            return (
                                <MenuItem value={purchase.item.code}>
                                    {purchase.item.name}
                                </MenuItem>
                            );
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
