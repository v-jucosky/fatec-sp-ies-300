import React, { useEffect, useState } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { AppBar, Toolbar, Button, Container } from '@material-ui/core';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage/GamePage';
import { firebaseApp, database } from './utils/settings/firebase';

function App() {
    const auth = getAuth(firebaseApp);
    const pageHistory = useHistory();
    const [profile, setProfile] = useState();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async user => {
            if (user) {
                const documents = await getDocs(query(collection(database, 'profiles'), where('user', '==', auth.currentUser.uid)));

                setProfile(documents.docs[0].data());
            };
        });

        return unsubscribe;
    }, [auth]);

    function getMainContent() {
        if (auth.currentUser) {
            return (
                <>
                    <AppBar position='sticky'>
                        <Toolbar>
                            <Button color='inherit' onClick={() => pageHistory.push('/')}>
                                Dominó
                            </Button>
                            <Container style={{ flexGrow: 1 }} />
                            <Button color='inherit' onClick={() => signOut(auth)}>
                                Sair
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <Switch>
                        <Route exact path='/'>
                            <HomePage auth={auth} profile={profile} pageHistory={pageHistory} />
                        </Route>
                        <Route path='/jogo/:gameId'>
                            <GamePage auth={auth} profile={profile} pageHistory={pageHistory} />
                        </Route>
                    </Switch>
                </>
            );
        } else {
            return (
                <>
                    <AppBar position='sticky'>
                        <Toolbar>
                            <Button color='inherit' onClick={() => pageHistory.push('/')}>
                                Dominó
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <Switch>
                        <Route exact path='/registrar'>
                            <RegisterPage auth={auth} pageHistory={pageHistory} />
                        </Route>
                        <Route path='/'>
                            <LoginPage auth={auth} pageHistory={pageHistory} />
                        </Route>
                    </Switch>
                </>
            );
        };
    };

    return (
        <>
            {getMainContent()}
        </>
    );
};

export default App;
