import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { doc, addDoc, deleteDoc, serverTimestamp, collection } from 'firebase/firestore';
import { Container, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper } from '@material-ui/core';
import { Delete, PlayArrow } from '@material-ui/icons';

import JoinDialog from '../../components/JoinDialog';
import { database } from '../../utils/settings/firebase';

function HomePage({ auth, profile, games }) {
    const pageHistory = useHistory();
    const [dialogData, setDialogData] = useState({ open: false });

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
            pageHistory.push('/jogo/' + document.id);
        });
    };

    function deleteGame(gameId) {
        deleteDoc(doc(database, 'games', gameId));
    };

    return (
        <>
            <Container maxWidth='md' style={{ marginTop: 64 }}>
                <Typography gutterBottom variant='h4'>
                    Bem vindo, {profile.displayName}
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
                                            <Button size='small' variant='contained' color='primary' disabled={!(game.open || game.running)} onClick={() => pageHistory.push('/jogo/' + game.id)} style={{ marginRight: 16 }}>
                                                <PlayArrow />
                                            </Button>
                                            <Button size='small' variant='contained' color='secondary' disabled={game.owner !== auth.currentUser.uid} onClick={() => deleteGame(game.id)}>
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
            <JoinDialog dialogData={dialogData} setDialogData={setDialogData} />
        </>
    );
};

export default HomePage;
