import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { doc, addDoc, deleteDoc, serverTimestamp, collection } from 'firebase/firestore';
import { Container, Typography, IconButton, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper } from '@material-ui/core';
import { Delete, PlayArrow, Visibility } from '@material-ui/icons';

import JoinDialog from '../../components/JoinDialog';
import DeleteDialog from '../../components/DeleteDialog';
import { database } from '../../utils/settings/firebase';

function HomePage({ auth, profile, games }) {
    const pageHistory = useHistory();
    const [joinDialogContent, setJoinDialogContent] = useState({ id: '', open: false });
    const [deleteDialogContent, setDeleteDialogContent] = useState({ name: '', onDelete: undefined, open: false });

    function createGame() {
        addDoc(collection(database, 'games'), {
            owner: auth.currentUser.uid,
            currentPlayer: auth.currentUser.uid,
            players: [
                auth.currentUser.uid
            ],
            sleep: [],
            moves: 0,
            running: false,
            open: true,
            createTimestamp: serverTimestamp(),
            updateTimestamp: serverTimestamp()
        }).then(document => {
            pageHistory.push('/jogo/' + document.id);
        });
    };

    function deleteGame(id) {
        deleteDoc(doc(database, 'games', id));
    };

    return (
        <>
            <Container maxWidth='md' style={{ marginTop: 64, marginBottom: 64 }}>
                <Typography gutterBottom variant='h4'>
                    Bem vindo, {profile.displayName}
                </Typography>
                <TableContainer component={Paper} style={{ marginBottom: 16 }}>
                    <Typography gutterBottom variant='h6' style={{ margin: 16 }}>
                        Jogos
                    </Typography>
                    <Typography gutterBottom style={{ margin: 16 }}>
                        Continue seus jogos ou apage-os. Note que apagar um jogo tabém exclui o chat daquela partida.
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    ID
                                </TableCell>
                                <TableCell>
                                    Data de início
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
                                    <TableRow>
                                        <TableCell>
                                            {game.id}
                                        </TableCell>
                                        <TableCell>
                                            {game.createTimestamp?.toDate().toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {game.players.length}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size='small' variant='contained' color='primary' onClick={() => pageHistory.push('/jogo/' + game.id)} style={{ marginRight: 4 }}>
                                                {(game.running || game.open) ?
                                                    <PlayArrow />
                                                    :
                                                    <Visibility />
                                                }
                                            </IconButton>
                                            <IconButton size='small' variant='contained' color='secondary' disabled={game.owner !== auth.currentUser.uid} onClick={() => setDeleteDialogContent({ name: game.id, onDelete: () => deleteGame(game.id), open: true })}>
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button variant='contained' color='primary' onClick={() => createGame()} style={{ marginRight: 16 }}>
                    Novo jogo
                </Button>
                <Button variant='contained' color='primary' onClick={() => setJoinDialogContent({ id: '', open: true })}>
                    Entrar em um jogo
                </Button>
            </Container>
            <JoinDialog
                dialogContent={joinDialogContent}
                setDialogContent={setJoinDialogContent}
            />
            <DeleteDialog
                dialogContent={deleteDialogContent}
                setDialogContent={setDeleteDialogContent}
            />
        </>
    );
};

export default HomePage;
