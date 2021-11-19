import React, { useState } from 'react';
import { Container, Typography, Card, CardContent, CardActions, Grid, Button, CardActionArea } from '@mui/material';

import PurchaseDialog, { purchaseDialogDefaultContent } from '../../components/PurchaseDialog';
import { FEATURE, THEME } from '../../utils/utils/type';

function StorePage({ auth, profile, themes, purchases }) {
    const [purchaseDialogContent, setPurchaseDialogContent] = useState(purchaseDialogDefaultContent);

    return (
        <>
            <Container maxWidth='md' style={{ marginTop: 64, marginBottom: 64 }}>
                <Typography gutterBottom variant='h4'>
                    Loja
                </Typography>
                <Typography gutterBottom variant='h6'>
                    Temas
                </Typography>
                <Typography gutterBottom style={{ marginBottom: 16 }}>
                    Adquira temas para mudar como seu perfil é visto por outros usuários e a aparência da interface.
                </Typography>
                <Grid container spacing={3} style={{ marginBottom: 16 }}>
                    {themes.map(theme => {
                        return (
                            <Grid item xs={6} md={3} style={{ display: 'flex' }}>
                                <Card style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', width: '100%' }}>
                                    <CardActionArea disabled={purchases.map(purchase => purchase.item.id).includes(theme.id)} onClick={() => setPurchaseDialogContent({ ...purchaseDialogContent, type: THEME, item: { ...theme }, isOpen: true })}>
                                        <CardContent>
                                            <Typography gutterBottom variant='h6'>
                                                {theme.name}
                                            </Typography>
                                            <Typography gutterBottom>
                                                {theme.description}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <Button color='primary' size='small' disabled={purchases.map(purchase => purchase.item.id).includes(theme.id)}>
                                                {theme.price > 0 ?
                                                    'R$' + theme.price.toFixed(2)
                                                    :
                                                    'Grátis'
                                                }
                                            </Button>
                                        </CardActions>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
                <Typography gutterBottom variant='h6'>
                    Recursos
                </Typography>
                <Typography gutterBottom style={{ marginBottom: 16 }}>
                    Adquira recursos e funcionalidades de jogo.
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6} style={{ display: 'flex' }}>
                        <Card style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', width: '100%' }}>
                            <CardContent>
                                <Typography gutterBottom variant='h6'>
                                    Destaque de jogadas possíveis
                                </Typography>
                                <Typography gutterBottom>
                                    As jogadas possíveis ficarão em destaque. Note que não há como desativar este recurso após adquiri-lo.
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button disabled color='primary' size='small' onClick={() => setPurchaseDialogContent({ ...purchaseDialogContent, type: FEATURE, item: { name: 'Destaque de jogadas possíveis', price: 29.99 }, isOpen: true })}>
                                    Em breve
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6} style={{ display: 'flex' }}>
                        <Card style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', width: '100%' }}>
                            <CardContent>
                                <Typography gutterBottom variant='h6'>
                                    Envio de mensagens nos jogos
                                </Typography>
                                <Typography gutterBottom>
                                    Você poderá enviar mensagens para todos os jogadores de um jogo. As mensagens aparecerão na cor do seu tema!
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button disabled color='primary' size='small' onClick={() => setPurchaseDialogContent({ ...purchaseDialogContent, type: FEATURE, item: { name: 'Envio de mensagens nos jogos', price: 29.99 }, isOpen: true })}>
                                    Em breve
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
            <PurchaseDialog
                dialogContent={purchaseDialogContent}
                setDialogContent={setPurchaseDialogContent}
                auth={auth}
                profile={profile}
            />
        </>
    );
};

export default StorePage;
