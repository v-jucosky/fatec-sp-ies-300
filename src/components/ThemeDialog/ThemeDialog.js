import React from 'react';
import { addDoc, updateDoc, collection, serverTimestamp, doc } from '@firebase/firestore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, InputAdornment, Button } from '@material-ui/core';

import { database } from '../../utils/settings/firebase';

function ThemeDialog({ dialogContent, setDialogContent }) {
    function closeDialog() {
        setDialogContent({ ...dialogContent, open: false });
    };

    function createTheme() {
        addDoc(collection(database, 'themes'), {
            name: dialogContent.name,
            code: '#' + dialogContent.code,
            description: dialogContent.description,
            price: parseFloat(parseFloat(dialogContent.price).toFixed(2)),
            createTimestamp: serverTimestamp(),
            updateTimestamp: serverTimestamp()
        }).then(document => {
            closeDialog();
        });
    };

    function updateTheme() {
        updateDoc(doc(database, 'themes', dialogContent.id), {
            description: dialogContent.description,
            price: parseFloat(parseFloat(dialogContent.price).toFixed(2)),
            updateTimestamp: serverTimestamp()
        }).then(() => {
            closeDialog();
        });
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogContent.open} onClose={() => closeDialog()}>
            <DialogTitle>
                {'id' in dialogContent ?
                    'Editar tema'
                    :
                    'Novo tema'
                }
            </DialogTitle>
            <DialogContent>
                <Typography gutterBottom style={{ marginBottom: 16 }}>
                    {'id' in dialogContent ?
                        'Edite a descrição e valor do tema.'
                        :
                        'Crie um novo tema, que ficará disponível aos jogadores através da loja.'
                    }
                </Typography>
                <TextField
                    required
                    fullWidth
                    autoFocus
                    id='name'
                    label='Nome'
                    variant='outlined'
                    disabled={'id' in dialogContent}
                    value={dialogContent.name}
                    onChange={(event) => setDialogContent({ ...dialogContent, name: event.target.value })}
                    style={{ marginBottom: 16 }}
                />
                <TextField
                    required
                    fullWidth
                    id='code'
                    label='Código'
                    variant='outlined'
                    disabled={'id' in dialogContent}
                    value={dialogContent.code}
                    onChange={(event) => setDialogContent({ ...dialogContent, code: event.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position='start'>#</InputAdornment> }}
                    style={{ marginBottom: 16 }}
                />
                <TextField
                    required
                    fullWidth
                    id='price'
                    label='Preço'
                    variant='outlined'
                    type='number'
                    value={dialogContent.price}
                    onChange={(event) => setDialogContent({ ...dialogContent, price: event.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position='start'>R$</InputAdornment> }}
                    style={{ marginBottom: 16 }}
                />
                <TextField
                    fullWidth
                    multiline
                    id='description'
                    label='Descrição'
                    variant='outlined'
                    rows={5}
                    value={dialogContent.description}
                    onChange={(event) => setDialogContent({ ...dialogContent, description: event.target.value })}
                />
            </DialogContent>
            <DialogActions>
                <Button color='primary' onClick={() => closeDialog()}>
                    Cancelar
                </Button>
                <Button color='primary' disabled={!(dialogContent.code.length === 6 && dialogContent.name.length > 0 && dialogContent.price)} onClick={() => 'id' in dialogContent ? updateTheme() : createTheme()}>
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ThemeDialog;
