import React, { useState, useEffect } from 'react';
import { doc, addDoc, deleteDoc, onSnapshot, serverTimestamp, collection, query, where } from 'firebase/firestore';
import { Container, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@material-ui/core';
import { Delete, PlayArrow } from '@material-ui/icons';

import { database } from '../../utils/settings/firebase';

function HomePage({ auth, profile, pageHistory }) {
    const [games, setGames] = useState([]);
    const [dialogData, setDialogData] = useState({
        open: false,
        gameId: ''
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(database, 'games'), where('owner', '==', auth.currentUser.uid)), snapshot => {
            snapshot.docChanges()
                .forEach(change => {
                    if (change.type === 'added') {
                        setGames(content => [...content, { id: change.doc.id, ...change.doc.data() }]);
                    } else if (change.type === 'removed') {
                        setGames(content => content.filter(game => game.id !== change.doc.id));
                    };
                });
        });

        return unsubscribe;
    }, []);

    function createGame() {
        addDoc(collection(database, 'games'), {
            owner: auth.currentUser.uid,
            currentPlayer: auth.currentUser.uid,
            players: [
                auth.currentUser.uid
            ],
            sleep: [],
            moveCount: 0,
            createTimestamp: serverTimestamp(),
            running: false,
            open: true
        }).then(document => {
            enterGame(document.id);
        });
    };

    function deleteGame(gameId) {
        deleteDoc(doc(database, 'games', gameId));
    };

    function enterGame(gameId) {
        pageHistory.push('/jogo/' + gameId);
    };

    return (
        <>
            <Container maxWidth='md' style={{ marginTop: 64 }}>
                <Typography gutterBottom variant='h4'>
                    Bem vindo, {profile.data().displayName}
                </Typography>
                <TableContainer component={Paper}>
                    <Typography gutterBottom variant='h6' style={{ margin: 16 }}>
                        Meus jogos
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    ID do jogo
                                </TableCell>
                                <TableCell>
                                    Jogadores
                                </TableCell>
                                <TableCell>
                                    Ações
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {games.map(game => {
                                return (
                                    <TableRow key={game.id}>
                                        <TableCell>
                                            {game.id}
                                        </TableCell>
                                        <TableCell>
                                            {game.players.length}
                                        </TableCell>
                                        <TableCell>
                                            <Button size='small' variant='contained' color='primary' disabled={!(game.open || game.running)} onClick={() => enterGame(game.id)} style={{ marginRight: 16 }}>
                                                <PlayArrow />
                                            </Button>
                                            <Button size='small' variant='contained' color='secondary' onClick={() => deleteGame(game.id)}>
                                                <Delete />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button variant='contained' color='primary' onClick={() => createGame()} style={{ marginTop: 16, marginRight: 16 }}>
                    Criar jogo
                </Button>
                <Button variant='contained' color='primary' onClick={() => setDialogData({ ...dialogData, open: true })} style={{ marginTop: 16 }}>
                    Entrar em um jogo
                </Button>
            </Container>
            <Dialog open={dialogData.open} onClose={() => setDialogData({ open: false, gameId: '' })}>
                <DialogTitle>
                    Entrar em um jogo
                </DialogTitle>
                <DialogContent>
                    <Typography gutterBottom style={{ marginBottom: 16 }}>
                        Para entrar em uma partida, coloque o ID do jogo abaixo.
                    </Typography>
                    <TextField
                        required
                        fullWidth
                        autoFocus
                        id='gameId'
                        label='ID do jogo'
                        variant='outlined'
                        value={dialogData.gameId}
                        onChange={(event) => setDialogData({ ...dialogData, gameId: event.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color='primary' onClick={() => setDialogData({ open: false, gameId: '' })}>
                        Cancelar
                    </Button>
                    <Button color='primary' disabled={dialogData.gameId.length !== 20} onClick={() => enterGame(dialogData.gameId)}>
                        Entrar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default HomePage;
