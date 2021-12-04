import React from 'react';
import { addDoc, updateDoc, collection, serverTimestamp, doc } from '@firebase/firestore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, InputAdornment, Button } from '@mui/material';

import { database } from '../../utils/settings/firebase';

const themeDialogDefaultContent = {
    name: '',
    description: '',
    price: '0',
    colorCode: '',
    themeId: undefined,
    isOpen: false
};

function ThemeDialog({ dialogContent, setDialogContent }) {
    function closeDialog() {
        setDialogContent(themeDialogDefaultContent);
    };

    function createTheme() {
        addDoc(collection(database, 'themes'), {
            name: dialogContent.name,
            colorCode: '#' + dialogContent.colorCode,
            description: dialogContent.description,
            price: parseFloat(parseFloat(dialogContent.price).toFixed(2)),
            createTimestamp: serverTimestamp(),
            updateTimestamp: serverTimestamp()
        }).then(document => {
            closeDialog();
        });
    };

    function updateTheme() {
        updateDoc(doc(database, 'themes', dialogContent.themeId), {
            description: dialogContent.description,
            price: parseFloat(parseFloat(dialogContent.price).toFixed(2)),
            updateTimestamp: serverTimestamp()
        }).then(() => {
            closeDialog();
        });
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogContent.isOpen} onClose={() => closeDialog()}>
            <DialogTitle>
                {dialogContent.themeId ?
                    'Editar tema'
                    :
                    'Novo tema'
                }
            </DialogTitle>
            <DialogContent>
                <Typography style={{ marginBottom: 16 }}>
                    {dialogContent.themeId ?
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
                    disabled={dialogContent.themeId ? true : false}
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
                    disabled={dialogContent.themeId ? true : false}
                    value={dialogContent.colorCode}
                    onChange={(event) => setDialogContent({ ...dialogContent, colorCode: event.target.value })}
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
                <Button color='neutral' onClick={() => closeDialog()}>
                    Cancelar
                </Button>
                <Button color='primary' disabled={dialogContent.colorCode.length !== 6 || dialogContent.name.length === 0 || dialogContent.price.length === 0} onClick={() => dialogContent.themeId ? updateTheme() : createTheme()}>
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ThemeDialog;
export { themeDialogDefaultContent };
