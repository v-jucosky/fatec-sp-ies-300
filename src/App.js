import React, { useEffect, useState } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { AppBar, Toolbar, Button, Container, IconButton } from '@material-ui/core';
import { Home } from '@material-ui/icons';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import GamePage from './pages/GamePage/GamePage';
import { firebaseApp, database } from './utils/settings/firebase';

function App() {
    const auth = getAuth(firebaseApp);
    const pageHistory = useHistory();
    const [profile, setProfile] = useState({});

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                getDoc(doc(database, 'profiles', auth.currentUser.uid))
                    .then(document => {
                        setProfile(document);
                    });
            } else {
                setProfile({});
            };
        });

        return unsubscribe;
    }, []);

    function getMainContent() {
        if (auth.currentUser) {
            return (
                <>
                    <AppBar position='sticky'>
                        <Toolbar>
                            <IconButton color='inherit' onClick={() => pageHistory.push('/')}>
                                <Home />
                            </IconButton>
                            <Container style={{ flexGrow: 1 }} />
                            <Button color='inherit' onClick={() => pageHistory.push('/perfil')} style={{ marginRight: 16 }}>
                                Perfil
                            </Button>
                            <Button color='inherit' onClick={() => signOut(auth)}>
                                Sair
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <Switch>
                        <Route exact path='/'>
                            <HomePage auth={auth} profile={profile} pageHistory={pageHistory} />
                        </Route>
                        <Route exact path='/perfil'>
                            <ProfilePage auth={auth} profile={profile} setProfile={setProfile} pageHistory={pageHistory} />
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
                            <IconButton color='inherit' onClick={() => pageHistory.push('/')}>
                                <Home />
                            </IconButton>
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
