import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
// @ts-ignore
import ShareMenu from 'react-native-share-menu';

import { Theme } from './src/styles/theme';
import { Header } from './src/components/Header';
import { ReaderScreen } from './src/screens/ReaderScreen';
import { VoiceScreen } from './src/screens/VoiceScreen';
import { RemixScreen } from './src/screens/RemixScreen';
import { DocumentIcon, MicIcon, EditIcon } from './src/components/Icons';

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [currentTab, setCurrentTab] = useState<'reader' | 'voice' | 'remix'>('reader');

  // Shared intent state
  const [sharedText, setSharedText] = useState<string>('');
  const [sharedImageUri, setSharedImageUri] = useState<string>('');

  const handleSharedItem = (item: any) => {
    if (!item) return;
    const { mimeType, data } = item;
    console.log('Contenu partagé reçu dans l\'app:', data, mimeType);

    if (mimeType.startsWith('text/')) {
      setSharedText(data);
      setSharedImageUri('');
      setCurrentTab('reader');
    } else if (mimeType.startsWith('image/')) {
      setSharedImageUri(data);
      setSharedText('');
      setCurrentTab('remix');
    }
  };

  useEffect(() => {
    // 1. Demander les permissions système de base au démarrage
    const requestInitialPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ]);
        } catch (err) {
          console.warn(err);
        }
      }
    };
    requestInitialPermissions();

    // 2. Récupérer le partage initial si l'application a été ouverte via le menu de partage
    ShareMenu.getInitialShare(handleSharedItem);

    // 3. Écouter les nouveaux partages entrants quand l'app est en tâche de fond
    const listener = ShareMenu.addNewShareListener(handleSharedItem);

    return () => {
      listener.remove();
    };
  }, []);

  const handleSendToRemix = (text: string) => {
    setSharedText(text);
    setCurrentTab('remix');
  };

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.screenContainer}>
        {currentTab === 'reader' && (
          <ReaderScreen
            initialText={sharedText}
            onSendToRemix={handleSendToRemix}
          />
        )}
        {currentTab === 'voice' && (
          <VoiceScreen onSendToRemix={handleSendToRemix} />
        )}
        {currentTab === 'remix' && (
          <RemixScreen
            initialText={sharedText}
            initialImageUri={sharedImageUri}
          />
        )}
      </View>

      {/* Bottom Custom Tab Bar (Glassmorphic & Fluid Spacing) */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(12, safeAreaInsets.bottom) }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('reader')}
          activeOpacity={0.7}
        >
          <View style={{ opacity: currentTab === 'reader' ? 1 : 0.5, marginBottom: 4 }}>
            <DocumentIcon color={currentTab === 'reader' ? Theme.colors.primary : Theme.colors.secondary} size={22} />
          </View>
          <Text style={[styles.navText, currentTab === 'reader' ? styles.navTextActive : styles.navTextInactive]}>
            Reader
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('voice')}
          activeOpacity={0.7}
        >
          <View style={{ opacity: currentTab === 'voice' ? 1 : 0.5, marginBottom: 4 }}>
            <MicIcon color={currentTab === 'voice' ? Theme.colors.primary : Theme.colors.secondary} size={22} />
          </View>
          <Text style={[styles.navText, currentTab === 'voice' ? styles.navTextActive : styles.navTextInactive]}>
            Voice
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('remix')}
          activeOpacity={0.7}
        >
          <View style={{ opacity: currentTab === 'remix' ? 1 : 0.5, marginBottom: 4 }}>
            <EditIcon color={currentTab === 'remix' ? Theme.colors.primary : Theme.colors.secondary} size={22} />
          </View>
          <Text style={[styles.navText, currentTab === 'remix' ? styles.navTextActive : styles.navTextInactive]}>
            Remix
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  screenContainer: {
    flex: 1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 28, 45, 0.9)',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.outlineVariant,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    zIndex: 50,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  navIconActive: {
    opacity: 1,
  },
  navIconInactive: {
    opacity: 0.5,
  },
  navText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  navTextActive: {
    color: Theme.colors.primary,
    opacity: 1,
  },
  navTextInactive: {
    color: Theme.colors.secondary,
    opacity: 0.5,
  },
});

export default App;
