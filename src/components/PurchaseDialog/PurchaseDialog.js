import React from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@material-ui/core';

import { database } from '../../utils/settings/firebase';

function PurchaseDialog({ dialogContent, setDialogContent, auth, profile }) {
    function closeDialog() {
        setDialogContent({ ...dialogContent, open: false });
    };

    function purchaseItem() {
        addDoc(collection(database, 'profiles', auth.currentUser.uid, 'purchases'), {
            type: dialogContent.type,
            item: { ...dialogContent.item },
            createTimestamp: serverTimestamp()
        }).then(document => {
            closeDialog();
        });
    };

    return (
        <Dialog maxWidth='sm' fullWidth={true} open={dialogContent.open} onClose={() => closeDialog()}>
            <DialogTitle>
                Adquirir
            </DialogTitle>
            <DialogContent>
                <Typography gutterBottom>
                    Seu saldo em conta é R$ {profile.balance.toFixed(2)}. Tem certeza que deseja adquirir “{dialogContent.item.name}” por R$ {dialogContent.item.price.toFixed(2)}?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button color='primary' onClick={() => closeDialog()}>
                    Cancelar
                </Button>
                <Button color='secondary' onClick={() => purchaseItem()}>
                    Adquirir
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PurchaseDialog;
