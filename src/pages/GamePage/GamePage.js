import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, updateDoc, onSnapshot, arrayUnion, arrayRemove, collection, query, where, increment, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Container, Typography, Chip, Avatar, ButtonGroup, Button, Fab, Card, CardContent, CardActions, Tooltip, Divider, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { Create, Add } from '@mui/icons-material';

import EndDialog, { endDialogDefaultContent } from '../../components/EndDialog';
import MessageDialog, { messageDialogDefaultContent } from '../../components/MessageDialog';
import Confetti from '../../assets/Confetti';
import { database } from '../../utils/settings/firebase';
import { arrayUpdate } from '../../utils/utils/common';
import { buildSleep, getTileFromSleep, flipTile } from '../../utils/utils/game';
import { DECK_START_SIZE, SYSTEM_PLAYER_DISPLAY_NAME } from '../../utils/settings/app';

const currentMoveDefaultValue = {
    deckSelection: {
        tile: undefined,
        number: undefined
    },
    gameSelection: {
        tile: undefined
    }
};

function GamePage({ auth, profile, games }) {
    const { gameId } = useParams();
    const { enqueueSnackbar } = useSnackbar();
    const { startConfetti, stopConfetti } = Confetti();
    const [profiles, setProfiles] = useState([]);
    const [game, setGame] = useState({ name: '', userId: '', currentUserId: '', participantUserIds: [], sleepTiles: [], moves: [], deckContent: {}, moveCount: 0, tileSize: 6, isRunning: false, isOpen: true, createTimestamp: new Timestamp(), updateTimestamp: new Timestamp() });
    const [currentMove, setCurrentMove] = useState(currentMoveDefaultValue);
    const [endDialogContent, setEndDialogContent] = useState(endDialogDefaultContent);
    const [messageDialogContent, setMessageDialogContent] = useState(messageDialogDefaultContent);

    useEffect(() => {
        const unsubscribeMessages = onSnapshot(query(collection(database, 'games', gameId, 'messages'), where('createTimestamp', '>=', Timestamp.now())), snapshot => {
            snapshot.docChanges()
                .forEach(change => {
                    if (change.type === 'added') {
                        let data = change.doc.data();

                        enqueueSnackbar(data.content, {
                            style: {
                                width: '200px',
                                wordBreak: 'break-all'
                            }
                        });
                    };
                });
        });

        return unsubscribeMessages;
    }, []);

    useEffect(() => {
        const game = games.filter(game => game.id === gameId)[0];

        if (game) {
            setGame(game);

            if (!game.isRunning && !game.isOpen) {
                setEndDialogContent({ ...endDialogContent, isOpen: true });

                if (game.currentUserId === auth.currentUser.uid) {
                    startConfetti();
                    setTimeout(stopConfetti, 10000);
                };
            };

            if (game.participantUserIds.length !== profiles.length) {
                setProfiles([]);

                const unsubscribeProfiles = onSnapshot(query(collection(database, 'profiles'), where('userId', 'in', game.participantUserIds)), snapshot => {
                    arrayUpdate(snapshot, setProfiles);
                });

                return unsubscribeProfiles;
            };
        };
    }, [games]);

    useEffect(() => {
        const moves = game.moves.sort((a, b) => {
            return a.index - b.index;
        });

        const lastLeftMove = moves[0];
        const lastRightMove = moves[moves.length - 1];
        const currentUserIdIndex = game.participantUserIds.indexOf(auth.currentUser.uid);

        if (moves.length === 0 || !currentMove.deckSelection.tile || !currentMove.gameSelection.tile) {
            return;
        };

        let index = undefined;
        let tile = undefined;
        let nextUserId = undefined;

        if (lastLeftMove.tile === currentMove.gameSelection.tile) {
            if (lastLeftMove.tile.left === currentMove.deckSelection.number) {
                index = lastLeftMove.index - 1;

                if (lastLeftMove.tile.left === currentMove.deckSelection.tile.right) {
                    tile = currentMove.deckSelection.tile;
                } else {
                    tile = flipTile(currentMove.deckSelection.tile);
                };
            } else if (lastLeftMove.tile === lastRightMove.tile && lastLeftMove.tile.right === currentMove.deckSelection.number) {
                // Caso excepcional: no 1º movimento (quando "lastLeftMove == lastRightMove"), há alguns casos em que só será possível
                // prosseguir com o movimento através desta condição

                index = lastLeftMove.index + 1;

                if (lastLeftMove.tile.right === currentMove.deckSelection.tile.left) {
                    tile = currentMove.deckSelection.tile;
                } else {
                    tile = flipTile(currentMove.deckSelection.tile);
                };
            } else {
                return;
            };
        } else if (lastRightMove.tile === currentMove.gameSelection.tile) {
            if (lastRightMove.tile.right === currentMove.deckSelection.number) {
                index = lastRightMove.index + 1;

                if (lastRightMove.tile.right === currentMove.deckSelection.tile.left) {
                    tile = currentMove.deckSelection.tile;
                } else {
                    tile = flipTile(currentMove.deckSelection.tile);
                };
            } else {
                return;
            };
        } else {
            return;
        };

        if (game.deckContent[auth.currentUser.uid].length === 1) {
            updateDoc(doc(database, 'games', gameId), {
                moves: arrayUnion({
                    index: index,
                    userId: auth.currentUser.uid,
                    tile: tile
                }),
                [`deckContent.${auth.currentUser.uid}`]: arrayRemove(currentMove.deckSelection.tile),
                moveCount: increment(1),
                isRunning: false,
                updateTimestamp: serverTimestamp()
            });
        } else {
            if (currentUserIdIndex >= game.participantUserIds.length - 1) {
                nextUserId = game.participantUserIds[0];
            } else {
                nextUserId = game.participantUserIds[currentUserIdIndex + 1];
            };

            updateDoc(doc(database, 'games', gameId), {
                currentUserId: nextUserId,
                moves: arrayUnion({
                    index: index,
                    userId: auth.currentUser.uid,
                    tile: tile
                }),
                [`deckContent.${auth.currentUser.uid}`]: arrayRemove(currentMove.deckSelection.tile),
                moveCount: increment(1),
                updateTimestamp: serverTimestamp()
            });
        };

        setCurrentMove(currentMoveDefaultValue);
    }, [currentMove]);

    function startGame() {
        let sleepTiles = buildSleep(game.tileSize);
        let deckContent = {};

        game.participantUserIds.forEach(userId => {
            let tiles = [];

            for (let i = 0; i < DECK_START_SIZE; i++) {
                tiles.push(getTileFromSleep(sleepTiles));
            };

            deckContent[userId] = tiles;
        });

        updateDoc(doc(database, 'games', gameId), {
            sleepTiles: sleepTiles,
            moves: arrayUnion({
                index: 0,
                tile: getTileFromSleep(sleepTiles)
            }),
            deckContent: deckContent,
            moveCount: increment(1),
            isRunning: true,
            isOpen: false,
            updateTimestamp: serverTimestamp()
        });
    };

    function getTile() {
        let tile = Math.floor(Math.random() * game.sleepTiles.length);

        updateDoc(doc(database, 'games', gameId), {
            sleepTiles: arrayRemove(game.sleepTiles[tile]),
            [`deckContent.${auth.currentUser.uid}`]: arrayUnion(game.sleepTiles[tile]),
            updateTimestamp: serverTimestamp()
        });
    };

    function passTurn() {
        const currentUserId = game.participantUserIds.indexOf(auth.currentUser.uid);

        let nextUserId = undefined;

        if (currentUserId >= game.participantUserIds.length - 1) {
            nextUserId = game.participantUserIds[0];
        } else {
            nextUserId = game.participantUserIds[currentUserId + 1];
        };

        updateDoc(doc(database, 'games', gameId), {
            moveCount: increment(1),
            currentUserId: nextUserId,
            updateTimestamp: serverTimestamp()
        });

        setCurrentMove(currentMoveDefaultValue);
    };

    return (
        <>
            <Container maxWidth='md' style={{ marginTop: 64, marginBottom: 64 }}>
                <Typography gutterBottom variant='h4'>
                    {game.name}
                </Typography>
                <Typography style={{ marginBottom: 8 }}>
                    ID do jogo: {game.id} | Criado por: {profiles.filter(profile => profile.userId === game.userId)[0]?.displayName}
                </Typography>
                {profiles.map(profile => {
                    return (
                        <Chip
                            label={profile.displayName}
                            avatar={<Avatar />}
                            style={{ marginRight: 8, marginBottom: 8 }}
                        />
                    );
                })}
                {game.userId === auth.currentUser.uid &&
                    <Card style={{ marginTop: 8, marginBottom: 8 }}>
                        <CardContent>
                            <Typography gutterBottom variant='h6'>
                                Painel do administrador
                            </Typography>
                            <Typography>
                                Este painel só é visível a você, {profile.displayName}, por ter iniciado o jogo. Quando todos os jogadores entrarem, clique em “Iniciar” para iniciar o jogo.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button color='primary' onClick={() => navigator.clipboard.writeText(gameId)}>
                                Copiar ID
                            </Button>
                            <Button color='primary' onClick={() => startGame()} disabled={!game.isOpen}>
                                Iniciar
                            </Button>
                        </CardActions>
                    </Card>
                }
                <div>
                    <Button color='primary' variant='contained' disabled={!game.isRunning || game.currentUserId !== auth.currentUser.uid} onClick={() => passTurn()} style={{ marginTop: 8, marginBottom: 8 }}>
                        Passar a vez
                    </Button>
                </div>
                <div>
                    {game.deckContent[auth.currentUser.uid]?.map(tile => {
                        return (
                            <ButtonGroup color='primary' variant='contained' orientation='vertical' disabled={!game.isRunning || game.currentUserId !== auth.currentUser.uid} style={{ marginTop: 8, marginBottom: 8, marginRight: 16 }}>
                                <Button color={currentMove.deckSelection.tile === tile && currentMove.deckSelection.number === tile.left ? 'secondary' : 'primary'} onClick={() => setCurrentMove({ ...currentMove, deckSelection: { tile: tile, number: tile.left } })}>
                                    {tile.left.toString()}
                                </Button>
                                <Button color={currentMove.deckSelection.tile === tile && currentMove.deckSelection.number === tile.right ? 'secondary' : 'primary'} onClick={() => setCurrentMove({ ...currentMove, deckSelection: { tile: tile, number: tile.right } })}>
                                    {tile.right.toString()}
                                </Button>
                            </ButtonGroup>
                        );
                    })}
                </div>
                <Divider style={{ marginTop: 8, marginBottom: 8 }} />
                {game.moves.sort((a, b) => {
                    return a.index - b.index;
                }).map(move => {
                    return (
                        <div style={{ textAlign: 'center' }}>
                            <Tooltip arrow placement='right' title={profiles.filter(profile => profile.userId === move.userId)[0]?.displayName || SYSTEM_PLAYER_DISPLAY_NAME}>
                                <ButtonGroup variant='contained' orientation={move.tile.left === move.tile.right ? 'horizontal' : 'vertical'} color={currentMove.gameSelection.tile === move.tile ? 'secondary' : 'primary'} style={{ marginTop: 8, marginBottom: 8 }}>
                                    <Button onClick={() => setCurrentMove({ ...currentMove, gameSelection: { tile: move.tile } })}>
                                        {move.tile.left.toString()}
                                    </Button>
                                    <Button onClick={() => setCurrentMove({ ...currentMove, gameSelection: { tile: move.tile } })}>
                                        {move.tile.right.toString()}
                                    </Button>
                                </ButtonGroup>
                            </Tooltip>
                        </div>
                    );
                })}
            </Container>
            <div style={{ bottom: 64, right: 64, position: 'fixed' }}>
                <Stack direction='row' spacing={2}>
                    <Fab variant='extended' color='primary' onClick={() => setMessageDialogContent({ ...messageDialogDefaultContent, isOpen: true })}>
                        <Create style={{ marginRight: 8 }} />
                        Mensagem
                    </Fab>
                    <Fab variant='extended' color='secondary' disabled={!game.isRunning || game.sleepTiles.length === 0} onClick={() => getTile()}>
                        <Add style={{ marginRight: 8 }} />
                        Dorme
                    </Fab>
                </Stack>
            </div>
            <EndDialog
                dialogContent={endDialogContent}
                setDialogContent={setEndDialogContent}
            />
            <MessageDialog
                dialogContent={messageDialogContent}
                setDialogContent={setMessageDialogContent}
                auth={auth}
            />
        </>
    );
};

export default GamePage;
