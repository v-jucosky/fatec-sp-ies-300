import React, { useEffect, useState } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, Timestamp } from 'firebase/firestore';
import { AppBar, Toolbar, IconButton, Stack } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { Home, AccountCircle, ExitToApp, Store, Settings } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import StorePage from './pages/StorePage';
import GamePage from './pages/GamePage';
import ProfileDialog, { profileDialogDefaultContent } from './components/ProfileDialog';
import { firebaseApp, database } from './utils/settings/firebase';
import { DEFAULT_ACCENT_COLOR_CODE, NEUTRAL_COLOR_CODE } from './utils/settings/app';
import { arrayUpdate, objectUpdate } from './utils/utils/common';

const profileDefaultValue = {
    userId: '',
    displayName: '',
    accentColorCode: DEFAULT_ACCENT_COLOR_CODE,
    isSuperUser: false,
    createTimestamp: new Timestamp(),
    updateTimestamp: new Timestamp()
};

function App() {
    const auth = getAuth(firebaseApp);
    const pageHistory = useHistory();
    const [profile, setProfile] = useState(profileDefaultValue);
    const [purchases, setPurchases] = useState([]);
    const [games, setGames] = useState([]);
    const [themes, setThemes] = useState([]);
    const [profileDialogContent, setProfileDialogContent] = useState(profileDialogDefaultContent);

    useEffect(() => {
        let unsubscribeProfile = () => { return };
        let unsubscribePurchases = () => { return };
        let unsubscribeGames = () => { return };
        let unsubscribeThemes = () => { return };

        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            if (user) {
                unsubscribeProfile = onSnapshot(doc(database, 'profiles', auth.currentUser.uid), snapshot => {
                    objectUpdate(snapshot, setProfile);
                });

                unsubscribePurchases = onSnapshot(query(collection(database, 'profiles', auth.currentUser.uid, 'purchases')), snapshot => {
                    arrayUpdate(snapshot, setPurchases);
                });

                unsubscribeGames = onSnapshot(query(collection(database, 'games'), where('participantUserIds', 'array-contains', auth.currentUser.uid)), snapshot => {
                    arrayUpdate(snapshot, setGames);
                });

                unsubscribeThemes = onSnapshot(query(collection(database, 'themes')), snapshot => {
                    arrayUpdate(snapshot, setThemes);
                });
            } else {
                unsubscribeProfile();
                unsubscribePurchases();
                unsubscribeGames();
                unsubscribeThemes();
                setProfile(profileDefaultValue);
            };
        });

        return (() => {
            unsubscribeProfile();
            unsubscribePurchases();
            unsubscribeGames();
            unsubscribeThemes();
            unsubscribeAuth();
        });
    }, []);

    return (
        <ThemeProvider theme={createTheme({ palette: { primary: { main: profile.accentColorCode }, neutral: { main: NEUTRAL_COLOR_CODE } } })}>
            {auth.currentUser ? (
                <SnackbarProvider maxSnack={10}>
                    <AppBar position='sticky'>
                        <Toolbar>
                            <IconButton color='inherit' onClick={() => pageHistory.push('/')}>
                                <Home />
                            </IconButton>
                            <div style={{ flexGrow: 1 }} />
                            <Stack direction='row' justifyContent='flex-end' spacing={2}>
                                {profile.isSuperUser &&
                                    <IconButton color='inherit' onClick={() => pageHistory.push('/configuracao')}>
                                        <Settings />
                                    </IconButton>
                                }
                                <IconButton color='inherit' onClick={() => pageHistory.push('/loja')}>
                                    <Store />
                                </IconButton>
                                <IconButton color='inherit' onClick={() => setProfileDialogContent({ ...profile, isOpen: true })}>
                                    <AccountCircle />
                                </IconButton>
                                <IconButton color='inherit' onClick={() => signOut(auth)}>
                                    <ExitToApp />
                                </IconButton>
                            </Stack>
                        </Toolbar>
                    </AppBar>
                    <Switch>
                        <Route exact path='/'>
                            <HomePage auth={auth} profile={profile} games={games} />
                        </Route>
                        {profile.isSuperUser &&
                            <Route exact path='/configuracao'>
                                <SettingsPage auth={auth} profile={profile} themes={themes} />
                            </Route>
                        }
                        <Route exact path='/loja'>
                            <StorePage auth={auth} profile={profile} themes={themes} purchases={purchases} />
                        </Route>
                        <Route path='/jogo/:gameId'>
                            <GamePage auth={auth} profile={profile} />
                        </Route>
                    </Switch>
                    <ProfileDialog
                        dialogContent={profileDialogContent}
                        setDialogContent={setProfileDialogContent}
                        auth={auth}
                        purchases={purchases}
                    />
                </SnackbarProvider>
            ) : (
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
                            <RegisterPage auth={auth} />
                        </Route>
                        <Route path='/'>
                            <LoginPage auth={auth} />
                        </Route>
                    </Switch>
                </>
            )}
        </ThemeProvider>
    );
};

export default App;
