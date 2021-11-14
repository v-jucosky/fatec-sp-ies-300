import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { doc, addDoc, getDoc, setDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove, collection, query, where, increment, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Container, Typography, Chip, Avatar, ButtonGroup, Button, Fab, Card, CardContent, CardActions, Tooltip } from '@material-ui/core';

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
    const [currentMove, setCurrentMove] = useState({ deck: { tile: undefined, number: undefined }, game: { tile: undefined } });

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

    useEffect(() => {
        const lastLeftMove = moves.at(0);
        const lastRightMove = moves.at(-1);

        if (moves.length === 0 || !currentMove.deck.tile || !currentMove.game.tile) {
            return;
        };

        let tileIndex = undefined;
        let tile = undefined;

        if (lastLeftMove.tile === currentMove.game.tile) {
            if (lastLeftMove.tile.left === currentMove.deck.number) {
                tileIndex = lastLeftMove.index - 1;

                if (lastLeftMove.tile.left === currentMove.deck.tile.right) {
                    tile = currentMove.deck.tile;
                } else {
                    tile = flipTile(currentMove.deck.tile);
                };
            } else {
                return;
            };
        } else if (lastRightMove.tile === currentMove.game.tile) {
            if (lastRightMove.tile.right === currentMove.deck.number) {
                tileIndex = lastRightMove.index + 1;

                if (lastRightMove.tile.right === currentMove.deck.tile.left) {
                    tile = currentMove.deck.tile;
                } else {
                    tile = flipTile(currentMove.deck.tile);
                };
            } else {
                return;
            };
        } else {
            return;
        };

        addDoc(collection(database, 'games', gameId, 'moves'), {
            move: game.moves + 1,
            index: tileIndex,
            player: auth.currentUser.uid,
            tile: tile,
            createTimestamp: serverTimestamp()
        });

        updateDoc(doc(database, 'games', gameId, 'decks', auth.currentUser.uid), {
            tiles: arrayRemove(currentMove.deck.tile),
            updateTimestamp: serverTimestamp()
        });

        passTurn();
    }, [currentMove]);

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

    function getTile() {
        let tile = Math.floor(Math.random() * game.sleep.length);

        updateDoc(doc(database, 'games', gameId, 'decks', auth.currentUser.uid), {
            tiles: arrayUnion(game.sleep[tile])
        });

        updateDoc(doc(database, 'games', gameId), {
            sleep: arrayRemove(game.sleep[tile])
        });
    };

    function passTurn() {
        const currentPlayer = game.players.indexOf(auth.currentUser.uid);

        let nextPlayer = undefined;

        if (currentPlayer >= game.players.length - 1) {
            nextPlayer = game.players[0];
        } else {
            nextPlayer = game.players[currentPlayer + 1];
        };

        updateDoc(doc(database, 'games', gameId), {
            moves: increment(1),
            currentPlayer: nextPlayer,
            updateTimestamp: serverTimestamp()
        });

        setCurrentMove({ deck: { tile: undefined, number: undefined }, game: { tile: undefined } });
    };

    return (
        <>
            <Container maxWidth='md' style={{ marginTop: 64, marginBottom: 64 }}>
                <Typography gutterBottom variant='h4'>
                    {game.name}
                </Typography>
                <Typography gutterBottom style={{ marginBottom: 8 }}>
                    ID do jogo: {game.id} | Criado por: {profiles.filter(profile => profile.userId === game.owner)[0]?.displayName}
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
                <Card style={{ marginTop: 16, marginBottom: 16 }}>
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
                    {!game.open &&
                        <CardActions style={{ overflowX: 'scroll', display: 'flex' }}>
                            <Button color='primary' variant='contained' disabled={game.currentPlayer !== auth.currentUser.uid} onClick={() => passTurn()}>
                                Passar a vez
                            </Button>
                            {deck?.tiles.map(tile => {
                                return (
                                    <ButtonGroup color='primary' variant='contained' disabled={game.currentPlayer !== auth.currentUser.uid}>
                                        <Button color={currentMove.deck.tile === tile && currentMove.deck.number === tile.left ? 'secondary' : 'primary'} onClick={() => setCurrentMove({ ...currentMove, deck: { tile: tile, number: tile.left } })}>
                                            {tile.left.toString()}
                                        </Button>
                                        <Button color={currentMove.deck.tile === tile && currentMove.deck.number === tile.right ? 'secondary' : 'primary'} onClick={() => setCurrentMove({ ...currentMove, deck: { tile: tile, number: tile.right } })}>
                                            {tile.right.toString()}
                                        </Button>
                                    </ButtonGroup>
                                );
                            })}
                        </CardActions>
                    }
                </Card>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant='h6'>
                            Tabuleiro
                        </Typography>
                        {game.open &&
                            <Typography gutterBottom>
                                As peças aparecerão aqui conforme os jogadores fizerem suas jogadas.
                            </Typography>
                        }
                    </CardContent>
                    <CardActions style={{ overflowX: 'scroll', display: 'flex' }}>
                        {moves.map(move => {
                            return (
                                <Tooltip arrow title={profiles.filter(profile => profile.userId === move.player)[0]?.displayName || move.player}>
                                    <ButtonGroup variant='contained' color={currentMove.game.tile === move.tile ? 'secondary' : 'primary'}>
                                        <Button onClick={() => setCurrentMove({ ...currentMove, game: { tile: move.tile } })}>
                                            {move.tile.left.toString()}
                                        </Button>
                                        <Button onClick={() => setCurrentMove({ ...currentMove, game: { tile: move.tile } })}>
                                            {move.tile.right.toString()}
                                        </Button>
                                    </ButtonGroup>
                                </Tooltip>
                            );
                        })}
                    </CardActions>
                </Card>
            </Container>
            <Fab variant='extended' color='secondary' onClick={() => getTile()} disabled={game.sleep.length === 0 || game.open} style={{ position: 'absolute', bottom: 64, right: 64 }} >
                Dorme
            </Fab>
        </>
    );
};

export default GamePage;
