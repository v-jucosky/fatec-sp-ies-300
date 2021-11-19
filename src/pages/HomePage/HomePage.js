import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { doc, deleteDoc } from 'firebase/firestore';
import { Container, Typography, IconButton, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Stack } from '@mui/material';
import { Delete, PlayArrow, Visibility, Stars } from '@mui/icons-material';

import JoinDialog, { joinDialogDefaultContent } from '../../components/JoinDialog';
import GameDialog, { gameDialogDefaultContent } from '../../components/GameDialog';
import DeleteDialog, { deleteDialogDefaultContent } from '../../components/DeleteDialog';
import { database } from '../../utils/settings/firebase';

function HomePage({ auth, profile, games }) {
    const pageHistory = useHistory();
    const [joinDialogContent, setJoinDialogContent] = useState(joinDialogDefaultContent);
    const [gameDialogContent, setGameDialogContent] = useState(gameDialogDefaultContent);
    const [deleteDialogContent, setDeleteDialogContent] = useState(deleteDialogDefaultContent);

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
                                    Nome
                                </TableCell>
                                <TableCell>
                                    Tamanho
                                </TableCell>
                                <TableCell>
                                    Jogadores
                                </TableCell>
                                <TableCell>
                                    Jogadas
                                </TableCell>
                                <TableCell>
                                    Data de início
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
                                            {game.name}
                                        </TableCell>
                                        <TableCell>
                                            {game.tileSize}
                                        </TableCell>
                                        <TableCell>
                                            {game.participantUserIds.length}
                                        </TableCell>
                                        <TableCell>
                                            {game.moves.length}
                                        </TableCell>
                                        <TableCell>
                                            {game.createTimestamp?.toDate().toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction='row' justifyContent='flex-end' spacing={2}>
                                                {(game.currentUserId === auth.currentUser.uid && !game.isRunning && !game.isOpen) &&
                                                    <IconButton size='small' variant='contained' color='primary' style={{ marginRight: 4 }}>
                                                        <Stars />
                                                    </IconButton>
                                                }
                                                <IconButton size='small' variant='contained' color='primary' onClick={() => pageHistory.push('/jogo/' + game.id)} style={{ marginRight: 4 }}>
                                                    {(game.isRunning || game.isOpen) ?
                                                        <PlayArrow />
                                                        :
                                                        <Visibility />
                                                    }
                                                </IconButton>
                                                <IconButton size='small' variant='contained' color='secondary' disabled={game.userId !== auth.currentUser.uid} onClick={() => setDeleteDialogContent({ ...deleteDialogContent, name: game.name, onDelete: () => deleteGame(game.id), isOpen: true })}>
                                                    <Delete />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button variant='contained' color='primary' onClick={() => setGameDialogContent({ ...gameDialogContent, isOpen: true })} style={{ marginRight: 16 }}>
                    Novo jogo
                </Button>
                <Button variant='contained' color='primary' onClick={() => setJoinDialogContent({ ...joinDialogContent, isOpen: true })}>
                    Entrar em um jogo
                </Button>
            </Container>
            <JoinDialog
                dialogContent={joinDialogContent}
                setDialogContent={setJoinDialogContent}
                auth={auth}
            />
            <GameDialog
                dialogContent={gameDialogContent}
                setDialogContent={setGameDialogContent}
                auth={auth}
            />
            <DeleteDialog
                dialogContent={deleteDialogContent}
                setDialogContent={setDeleteDialogContent}
            />
        </>
    );
};

export default HomePage;
