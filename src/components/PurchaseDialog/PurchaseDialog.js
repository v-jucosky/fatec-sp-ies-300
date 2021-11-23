import React from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';

import { database } from '../../utils/settings/firebase';

const purchaseDialogDefaultContent = {
    type: undefined,
    item: {
        name: '',
        price: 0
    },
    isOpen: false
};

function PurchaseDialog({ dialogContent, setDialogContent, auth }) {
    function closeDialog() {
        setDialogContent(purchaseDialogDefaultContent);
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
        <Dialog maxWidth='sm' fullWidth={true} open={dialogContent.isOpen} onClose={() => closeDialog()}>
            <DialogTitle>
                Adquirir
            </DialogTitle>
            <DialogContent>
                <Typography>
                    Tem certeza que deseja adquirir “{dialogContent.item.name}” por R${dialogContent.item.price.toFixed(2)}?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button color='neutral' onClick={() => closeDialog()}>
                    Cancelar
                </Button>
                <Button color='primary' onClick={() => purchaseItem()}>
                    Adquirir
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PurchaseDialog;
export { purchaseDialogDefaultContent };
