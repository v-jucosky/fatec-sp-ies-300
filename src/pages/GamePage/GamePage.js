import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { doc, addDoc, getDoc, setDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove, collection, query, where, increment, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Container, Typography, Chip, Avatar, ButtonGroup, Button, Fab, Card, CardContent, CardActions } from '@material-ui/core';

import { database } from '../../utils/settings/firebase';
import { arrayUpdate, objectUpdate } from '../../utils/utils/common';
import { buildSleep, getTileFromSleep, flipTile } from '../../utils/utils/game';
import { DECK_START_SIZE, MAXIMUM_NUMBER_PLAYERS, SYSTEM_PLAYER_DISPLAY_NAME } from '../../utils/settings/app';

function GamePage({ auth, profile, games }) {
    const pageHistory = useHistory();
    const { gameId } = useParams();
    const [deck, setDeck] = useState({ tiles: [] });
    const [moves, setMoves] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [game, setGame] = useState({ id: '', owner: '', currentPlayer: '', players: [], sleep: [], moves: 0, running: undefined, open: undefined, createTimestamp: new Timestamp() });

    useEffect(() => {
        getDoc(doc(database, 'games', gameId))
            .then(document => {
                let game = document.data();

                try {
                    if (!game.players.includes(auth.currentUser.uid)) {
                        if (!game.open) {
                            alert('Este jogo não está aberto.');
                            pageHistory.push('/');
                            return;
                        } else if (game.players.length >= MAXIMUM_NUMBER_PLAYERS) {
                            alert('Número máximo de jogadores atingido.');
                            pageHistory.push('/');
                            return;
                        } else {
                            updateDoc(doc(database, 'games', gameId), {
                                players: arrayUnion(auth.currentUser.uid)
                            });
                        };
                    };
                } catch (error) {
                    alert('Não foi possível entrar neste jogo (' + error + ').');
                    pageHistory.push('/');
                    return;
                };
            });

        const unsubscribeDeck = onSnapshot(doc(database, 'games', gameId, 'decks', auth.currentUser.uid), snapshot => {
            objectUpdate(snapshot, deck, setDeck);
        });

        const unsubscribeMoves = onSnapshot(query(collection(database, 'games', gameId, 'moves')), snapshot => {
            arrayUpdate(snapshot, moves, setMoves, 'index');
        });

        return (() => {
            unsubscribeDeck();
            unsubscribeMoves();
        });
    }, []);

    useEffect(() => {
        let unsubscribeProfiles = () => { return };
        let game = games.filter(game => game.id === gameId)[0];

        if (game) {
            setGame(game);

            if (game.players.length !== profiles.length) {
                setProfiles([]);

                unsubscribeProfiles = onSnapshot(query(collection(database, 'profiles'), where('userId', 'in', game.players)), snapshot => {
                    arrayUpdate(snapshot, profiles, setProfiles);
                });
            };
        };

        return unsubscribeProfiles;
    }, [games]);

    function startGame() {
        let sleep = buildSleep(game.size);

        game.players.forEach(player => {
            let tiles = [];

            for (let i = 0; i < DECK_START_SIZE; i++) {
                tiles.push(getTileFromSleep(sleep));
            };

            setDoc(doc(database, 'games', gameId, 'decks', player), {
                tiles: tiles
            });
        });

        addDoc(collection(database, 'games', gameId, 'moves'), {
            move: 1,
            index: 0,
            player: SYSTEM_PLAYER_DISPLAY_NAME,
            tile: getTileFromSleep(sleep),
            createTimestamp: serverTimestamp()
        });

        updateDoc(doc(database, 'games', gameId), {
            sleep: sleep,
            open: false,
            running: true,
            moves: increment(1)
        });
    };

    function moveTile(tile) {
        const lastLeftMove = moves.at(0);
        const lastRightMove = moves.at(-1);
        let currentPlayer = game.players.indexOf(auth.currentUser.uid);
        let nextPlayer = undefined;
        let tileIndex = undefined;
        let _tile = undefined;

        if (lastRightMove.tile.rightNumber === tile.leftNumber) {
            tileIndex = lastRightMove.index + 1;
        } else if (lastLeftMove.tile.leftNumber === tile.rightNumber) {
            tileIndex = lastLeftMove.index - 1;
        } else if (lastRightMove.tile.rightNumber === tile.rightNumber) {
            _tile = flipTile(tile);
            tileIndex = lastRightMove.index + 1;
        } else if (lastLeftMove.tile.leftNumber === tile.leftNumber) {
            _tile = flipTile(tile);
            tileIndex = lastLeftMove.index - 1;
        } else {
            return;
        };

        if (currentPlayer >= game.players.length - 1) {
            nextPlayer = game.players[0];
        } else {
            nextPlayer = game.players[currentPlayer + 1];
        };

        addDoc(collection(database, 'games', gameId, 'moves'), {
            move: game.moves + 1,
            index: tileIndex,
            player: auth.currentUser.uid,
            tile: tile,
            createTimestamp: serverTimestamp()
        });

        updateDoc(doc(database, 'games', gameId, 'decks', auth.currentUser.uid), {
            tiles: arrayRemove(_tile || tile),
            updateTimestamp: serverTimestamp()
        });

        updateDoc(doc(database, 'games', gameId), {
            moveCount: increment(1),
            currentPlayer: nextPlayer,
            updateTimestamp: serverTimestamp()
        });
    };

    function getTile() {
        let tile = Math.floor(Math.random() * game.sleep.length);

        updateDoc(doc(database, 'games', gameId, 'decks', auth.currentUser.uid), {
            tiles: arrayUnion(game.sleep[tile])
        });

        updateDoc(doc(database, 'games', gameId), {
            sleep: arrayRemove(game.sleep[tile])
        });
    };

    return (
        <>
            <Container maxWidth='md' style={{ marginTop: 64, marginBottom: 64 }}>
                <Typography gutterBottom variant='h4'>
                    {game.name}
                </Typography>
                <Typography gutterBottom style={{ marginBottom: 8 }}>
                    ID do jogo: {game.id}
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
                {game.owner === auth.currentUser.uid &&
                    <Card style={{ marginTop: 8, marginBottom: 8 }}>
                        <CardContent>
                            <Typography gutterBottom variant='h6'>
                                Painel do administrador
                            </Typography>
                            <Typography gutterBottom>
                                Este painel só é visível a você, {profile.displayName}, por ter iniciado o jogo. Quando todos os jogadores entrarem, clique em “Iniciar” para iniciar o jogo.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button color='primary' onClick={() => navigator.clipboard.writeText(gameId)}>
                                Copiar ID
                            </Button>
                            <Button color='primary' onClick={() => startGame()} disabled={!game.open}>
                                Iniciar
                            </Button>
                        </CardActions>
                    </Card>
                }
                <Card style={{ marginTop: 8, marginBottom: 16 }}>
                    <CardContent>
                        <Typography gutterBottom variant='h6'>
                            Deck
                        </Typography>
                        <Typography gutterBottom>
                            {game.open ?
                                'Você receberá suas peças aqui quando o administrador do jogo iniciar a partida.'
                                :
                                'As peças ficarão disponíveis quando for a sua vez de jogar.'
                            }
                        </Typography>
                    </CardContent>
                    {deck?.tiles.length > 0 &&
                        <CardActions>
                            {deck?.tiles.map(tile => {
                                return (
                                    <ButtonGroup color='primary' disabled={game.currentPlayer !== auth.currentUser.uid} onClick={() => moveTile(tile)}>
                                        <Button>{tile.leftString}</Button>
                                        <Button>{tile.rightString}</Button>
                                    </ButtonGroup>
                                );
                            })}
                        </CardActions>
                    }
                </Card>
                {moves.map(move => {
                    return (
                        <ButtonGroup color='primary' variant='contained' style={{ marginRight: 16, marginBottom: 16 }}>
                            <Button>{move.tile.leftString}</Button>
                            <Button>{move.tile.rightString}</Button>
                        </ButtonGroup>
                    );
                })}
            </Container>
            <Fab variant='extended' color='secondary' onClick={() => getTile()} disabled={game.sleep.length === 0 || game.open} style={{ position: 'absolute', bottom: 64, right: 64 }} >
                Dorme
            </Fab>
        </>
    );
};

export default GamePage;
