import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import '@walletconnect/react-native-compat';
import Clipboard from '@react-native-clipboard/clipboard';
import {DarkTheme, LightTheme} from '../constants/Colors';
import {providerMetadata, sessionParams} from '../constants/Config';
import {BlockchainActions} from '../components/BlockchainActions';
import {utf8ToHex} from '@walletconnect/encoding';

import {
  useWalletConnectModal,
  WalletConnectModal,
} from '@walletconnect/modal-react-native';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [clientId, setClientId] = useState<string>();
  const {isConnected, provider, open, address} = useWalletConnectModal();
  const backgroundColor = isDarkMode
    ? DarkTheme.background2
    : LightTheme.background2;

  const onCopy = (value: string) => {
    Clipboard.setString(value);
  };

  const handleButtonPress = async () => {
    if (isConnected) {
      return provider?.disconnect();
    }
    return open();
  };

  const handlePersonalSign = async () => {
    const message = 'Hello World';
    const hexMsg = utf8ToHex(message, true);
    const signature = await provider?.request(
      {method: 'personal_sign', params: [hexMsg, address]},
      'eip155:1', //optional
    );

    console.log({signature});
  };

  useEffect(() => {
    async function getClientId() {
      if (provider && isConnected) {
        const _clientId = await provider?.client?.core.crypto.getClientId();
        setClientId(_clientId);
      } else {
        setClientId(undefined);
      }
    }

    getClientId();
  }, [isConnected, provider]);

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor}]}>
      <View style={[styles.container, {backgroundColor}]}>
        {clientId && (
          <TouchableOpacity
            style={[styles.card, isDarkMode && styles.cardDark]}
            onPress={() => onCopy(clientId)}>
            <Text style={[styles.propTitle, isDarkMode && styles.darkText]}>
              {'Client ID:'}{' '}
              <Text style={[styles.propValue, isDarkMode && styles.darkText]}>
                {clientId}
              </Text>
            </Text>
          </TouchableOpacity>
        )}
        {isConnected ? (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={handlePersonalSign}>
              <Text style={styles.text}>{'Sign Message'}</Text>
            </TouchableOpacity>
            <BlockchainActions onDisconnect={handleButtonPress} />
          </>
        ) : (
          <View style={styles.centerContainer}>
            <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
              <Text style={styles.text}>
                {isConnected ? 'Disconnect' : 'Connect Wallet'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <WalletConnectModal
          projectId="ae5b999a8385d494400c0b3966a71209"
          providerMetadata={providerMetadata}
          sessionParams={sessionParams}
          onCopyClipboard={onCopy}
        />
      </View>
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 64,
    padding: 16,
    borderColor: LightTheme.accent,
    backgroundColor: LightTheme.background2,
    borderWidth: 1,
    borderRadius: 16,
    shadowColor: LightTheme.foreground1,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    elevation: 4,
  },
  cardDark: {
    backgroundColor: DarkTheme.background2,
    borderColor: DarkTheme.accent,
    shadowColor: DarkTheme.foreground1,
    shadowOpacity: 0.5,
  },
  propTitle: {
    fontWeight: 'bold',
  },
  propValue: {
    fontWeight: 'normal',
  },
  darkText: {
    color: DarkTheme.foreground1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  centerContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3396FF',
    borderRadius: 20,
    width: 200,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 4,
  },
  text: {
    color: 'white',
    fontWeight: '700',
  },
});
