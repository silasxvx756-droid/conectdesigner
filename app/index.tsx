import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  Animated,
  Platform,
  Linking,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const STORAGE_KEY = '@cfi_screen_state';
const PROXY_BASE_URL = 'http://localhost:3000/api';

export default function App() {
  const [screen, setScreen] = useState('home');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [imageUrls, setImageUrls] = useState('');
  const [loading, setLoading] = useState(false);

  const [isRestoring, setIsRestoring] = useState(true);

  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  const animation = useRef(new Animated.Value(0)).current;

  // =====================================
  // RECUPERAR DADOS SALVOS
  // =====================================

  useEffect(() => {
    const restoreData = async () => {
      try {
        let savedData = null;

        if (Platform.OS === 'web') {
          const saved = localStorage.getItem(STORAGE_KEY);
          savedData = saved ? JSON.parse(saved) : null;
        } else {
          const saved = await AsyncStorage.getItem(STORAGE_KEY);
          savedData = saved ? JSON.parse(saved) : null;
        }

        if (savedData) {
          if (
            savedData.screen === 'home' ||
            savedData.screen === 'login' ||
            savedData.screen === 'dashboard'
          ) {
            setScreen(savedData.screen);
          }

          if (typeof savedData.email === 'string') {
            setEmail(savedData.email);
          }
        }
      } catch (error) {
        console.log('Erro ao recuperar os dados:', error);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreData();
  }, []);

  // =====================================
  // SALVAR DADOS AUTOMATICAMENTE
  // =====================================

  useEffect(() => {
    if (isRestoring) return;

    const saveData = async () => {
      try {
        const data = JSON.stringify({
          screen,
          email,
        });

        if (Platform.OS === 'web') {
          localStorage.setItem(STORAGE_KEY, data);
        } else {
          await AsyncStorage.setItem(STORAGE_KEY, data);
        }
      } catch (error) {
        console.log('Erro ao salvar os dados:', error);
      }
    };

    saveData();
  }, [screen, email, isRestoring]);

  // =====================================
  // ANIMAÇÃO AUTOMÁTICA
  // =====================================

  useEffect(() => {
    const animationLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    );

    animationLoop.start();

    return () => animationLoop.stop();
  }, [animation]);

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded || isRestoring) return null;

  // =====================================
  // LOGIN
  // =====================================

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha seu usuário e senha.');
      return;
    }

    if (email.trim() === 'conta' && password.trim() === '123456') {
      setScreen('dashboard');
    } else {
      Alert.alert('Erro de Acesso', 'Usuário ou senha incorretos.');
    }
  };

  // =====================================
  // LOGOUT / DESLOGAR DA CONTA
  // =====================================

  const handleLogout = async () => {
    try {
      setEmail('');
      setPassword('');
      setImageUrls('');
      setScreen('home');

      if (Platform.OS === 'web') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.log('Erro ao efetuar logout:', error);
    }
  };

  // =====================================
  // EXECUTAR DOWNLOAD DIRETO
  // =====================================

  const handleDirectDownload = async () => {
    if (!imageUrls.trim()) {
      Alert.alert('Atenção', 'Insira pelo menos uma URL de imagem.');
      return;
    }

    const urlsArray = imageUrls
      .split('\n')
      .map((url) => url.trim())
      .filter(Boolean);

    try {
      setLoading(true);
      const targetUrl = urlsArray[0];

      console.log('\n========================================');
      console.log('🔍 [INÍCIO DO PROCESSAMENTO DIRETO]');
      console.log('🔗 URL Alvo:', targetUrl);

      // 1. Obter informações/detalhes do arquivo
      const encodedUrl = encodeURIComponent(targetUrl);
      const infoEndpoint = `${PROXY_BASE_URL}/stockinfo?url=${encodedUrl}`;

      const infoResponse = await fetch(infoEndpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const infoData = await infoResponse.json();

      if (!infoResponse.ok || !infoData.success) {
        const msg = infoData.message || 'Falha ao buscar informações da imagem.';
        if (
          msg.toLowerCase().includes('point') ||
          msg.toLowerCase().includes('balance') ||
          msg.toLowerCase().includes('ponto') ||
          msg.toLowerCase().includes('saldo')
        ) {
          Alert.alert('Pontos Insuficientes', 'Você não tem pontos suficientes para realizar este download.');
        } else {
          Alert.alert('Aviso', msg);
        }
        return;
      }

      const source = infoData.data?.source || 'freepik';
      const fileId = infoData.data?.id;

      if (!fileId) {
        Alert.alert('Erro', 'Não foi possível identificar o ID do arquivo.');
        return;
      }

      // 2. Criar a ordem de download diretamente
      const orderEndpoint = `${PROXY_BASE_URL}/stockorder/${source}/${fileId}`;
      console.log('🔗 Endpoint Order:', orderEndpoint);

      const orderResponse = await fetch(orderEndpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success || !orderData.task_id) {
        const orderMsg = orderData.message || 'Falha ao criar ordem de download.';
        if (
          orderMsg.toLowerCase().includes('point') ||
          orderMsg.toLowerCase().includes('balance') ||
          orderMsg.toLowerCase().includes('ponto') ||
          orderMsg.toLowerCase().includes('saldo')
        ) {
          Alert.alert('Pontos Insuficientes', 'Você não tem pontos suficientes para realizar este download.');
        } else {
          Alert.alert('Erro', orderMsg);
        }
        return;
      }

      const taskId = orderData.task_id;
      console.log('🔑 Task ID obtido:', taskId);

      // 3. Verificação contínua do status do download
      let isReady = false;
      let finalDownloadUrl = '';
      let attempts = 0;
      const maxAttempts = 10;

      while (!isReady && attempts < maxAttempts) {
        attempts++;
        console.log(`⏳ [Status Check] Tentativa ${attempts} de ${maxAttempts}...`);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        const statusEndpoint = `${PROXY_BASE_URL}/order/${taskId}/status?responsetype=any`;
        const statusResponse = await fetch(statusEndpoint, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        const statusData = await statusResponse.json();

        if (statusData.status === 'ready' && statusData.available_download_links?.length > 0) {
          isReady = true;
          finalDownloadUrl = statusData.available_download_links[0].url;
        }
      }

      if (!isReady || !finalDownloadUrl) {
        Alert.alert('Aviso', 'O tempo limite para gerar o link de download esgotou-se.');
        return;
      }

      console.log('🎉 [PRONTO] Abrindo link de download na mesma aba:', finalDownloadUrl);

      if (Platform.OS === 'web') {
        window.location.href = finalDownloadUrl;
      } else {
        const supported = await Linking.canOpenURL(finalDownloadUrl);
        if (supported) {
          await Linking.openURL(finalDownloadUrl);
        } else {
          Alert.alert('Erro', 'Não é possível abrir este link no dispositivo.');
        }
      }
    } catch (error: any) {
      console.error('❌ [ERRO NO PROCESSO]:', error.message || error);
      Alert.alert('Erro', 'Não foi possível concluir a operação.');
    } finally {
      setLoading(false);
      console.log('========================================\n');
    }
  };

  // =====================================
  // TELA DE BAIXAR (DASHBOARD)
  // =====================================

  if (screen === 'dashboard') {
    return (
      <View style={styles.dashboardScreen}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <TouchableOpacity style={styles.topLogoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color="#ef3340" />
          <Text style={styles.topLogoutText}>Sair</Text>
        </TouchableOpacity>

        <ScrollView
          style={styles.dashboardMain}
          contentContainerStyle={styles.dashboardMainContent}
          showsVerticalScrollIndicator={true}
        >
          <TextInput
            style={styles.urlInput}
            multiline
            value={imageUrls}
            onChangeText={setImageUrls}
            placeholder=""
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.getFilesButton}
            activeOpacity={0.75}
            disabled={loading}
            onPress={handleDirectDownload}
          >
            <Text style={styles.getFilesButtonText}>Baixar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // =====================================
  // TELA INICIAL
  // =====================================

  if (screen === 'home') {
    return (
      <View style={styles.homeContainer}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.navbar}>
          <TouchableOpacity
            style={styles.logoArea}
            onPress={() => setScreen('home')}
          />
        </View>

        <View style={[styles.hero, isMobile && styles.heroMobile]}>
          <View style={[styles.heroText, isMobile && styles.heroTextMobile]}>
            <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
              MAGNIFIC, ENVATO E DESIGNI
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => setScreen('login')}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>ENTRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // =====================================
  // TELA DE LOGIN
  // =====================================

  return (
    <LinearGradient
      colors={['#ffffff', '#f8fafc', '#f1f5f9']}
      locations={[0, 0.55, 1]}
      style={styles.loginContainer}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.loginContent}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              selectionColor="#2563eb"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              autoComplete="off"
              selectionColor="#2563eb"
            />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={1}
          >
            <Text style={styles.loginButtonText}>ENTRAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

// =====================================
// ESTILOS
// =====================================

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    height: '100%',
    backgroundColor: '#ffffff',
  },
  navbar: {
    height: 72,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hero: {
    flex: 1,
    width: '100%',
    maxWidth: 1250,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 45,
    paddingVertical: 20,
  },
  heroText: {
    width: '100%',
    maxWidth: 800,
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 42,
    lineHeight: 52,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -1,
    textAlign: 'center',
  },
  startButton: {
    height: 52,
    minWidth: 190,
    paddingHorizontal: 25,
    backgroundColor: '#000000',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  heroMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  heroTextMobile: {
    width: '100%',
    alignItems: 'center',
  },
  heroTitleMobile: {
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginContent: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 350,
  },
  inputContainer: {
    width: '100%',
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 18,
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    color: '#0f172a',
    fontSize: 16,
    letterSpacing: 0.5,
    backgroundColor: 'transparent',
    outlineStyle: 'none' as any,
  },
  loginButton: {
    width: '100%',
    height: 48,
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  dashboardScreen: {
    flex: 1,
    backgroundColor: '#ffffff',
    minHeight: '100%',
    position: 'relative',
  },
  dashboardMain: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  dashboardMainContent: {
    paddingHorizontal: 25,
    paddingTop: 80,
    paddingBottom: 80,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  topLogoutButton: {
    position: 'absolute',
    top: 25,
    right: 25,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  topLogoutText: {
    fontSize: 14,
    color: '#ef3340',
    fontWeight: '600',
  },
  urlInput: {
    width: '100%',
    height: 318,
    borderWidth: 1.5,
    borderColor: '#000000',
    borderStyle: 'solid',
    borderRadius: 0, // Cantos retos (sem arredondamento)
    backgroundColor: '#ffffff',
    padding: 15,
    fontSize: 15,
    color: '#1e293b',
    outlineStyle: 'none' as any,
  },
  getFilesButton: {
    minHeight: 60,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#000000',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 75,
    borderRadius: 0, // Cantos retos no botão também para manter o estilo
  },
  getFilesButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
});