import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  Animated,
  Platform,
  Linking,
  Image,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const STORAGE_KEY = '@cfi_screen_state';
const PROXY_BASE_URL = 'http://localhost:3000/api';

const PLATFORMS_LIST = [
  { name: 'iconscout', cost: '0.6', domain: 'iconscout.com' },
  { name: 'depositphotos', cost: '1', domain: 'depositphotos.com' },
  { name: 'motionelements', cost: 'off', domain: 'motionelements.com' },
  { name: 'shutterstock', cost: '0.8', domain: 'shutterstock.com' },
  { name: 'dreamstime', cost: '0.8', domain: 'dreamstime.com' },
  { name: 'istock video hd', cost: '20', domain: 'istockphoto.com' },
  { name: 'vectorstock', cost: '0.6', domain: 'vectorstock.com' },
  { name: 'motionarray', cost: '0.3', domain: 'motionarray.com' },
  { name: 'freepik', cost: '0.3', domain: 'freepik.com' },
  { name: 'storyblocks', cost: '1', domain: 'storyblocks.com' },
  { name: 'istockphoto', cost: '0.8', domain: 'istockphoto.com' },
  { name: '123rf', cost: '0.65', domain: '123rf.com' },
  { name: 'pixeden', cost: '0.6', domain: 'pixeden.com' },
  { name: 'ss video 4k', cost: '12', domain: 'shutterstock.com' },
  { name: 'ss video hd', cost: '7', domain: 'shutterstock.com' },
  { name: 'uihut', cost: '0.5', domain: 'uihut.com' },
  { name: 'designi', cost: '0.8', domain: 'designi.com.br' },
  { name: 'ui8', cost: '3', domain: 'ui8.net' },
  { name: 'adobestock', cost: '0.4', domain: 'stock.adobe.com' },
  { name: 'envato', cost: '0.5', domain: 'envato.com' },
  { name: 'pixelbuddha', cost: '0.6', domain: 'pixelbuddha.net' },
  { name: 'mockupcloud', cost: '1', domain: 'mockupcloud.com' },
  { name: 'creativefabrica', cost: '0.5', domain: 'creativefabrica.com' },
  { name: 'vecteezy', cost: '0.3', domain: 'vecteezy.com' },
  { name: 'rawpixel', cost: '0.3', domain: 'rawpixel.com' },
  { name: 'freepik video', cost: '1', domain: 'freepik.com' },
  { name: 'ss music', cost: '1', domain: 'shutterstock.com' },
  { name: 'adobestock video', cost: '4.5', domain: 'stock.adobe.com' },
  { name: 'flaticon', cost: '0.2', domain: 'flaticon.com' },
  { name: 'craftwork', cost: '2', domain: 'craftwork.design' },
  { name: 'alamy', cost: '16', domain: 'alamy.com' },
  { name: 'yellowimages', cost: '12', domain: 'yellowimages.com' },
  { name: 'artlist music/sfx', cost: '0.4', domain: 'artlist.io' },
  { name: 'epidemicsound', cost: '0.3', domain: 'epidemicsound.com' },
  { name: 'artgrid_hd', cost: '0.8', domain: 'artgrid.io' },
  { name: 'deeezy', cost: '0.5', domain: 'deeezy.com' },
  { name: 'artlist video/template', cost: '1', domain: 'artlist.io' },
  { name: 'footagecrate', cost: '1', domain: 'footagecrate.com' },
];

export default function App() {
  const [screen, setScreen] = useState('home');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [userBalance, setUserBalance] = useState('0.20');

  const [imageUrls, setImageUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [finalDownloadUrl, setFinalDownloadUrl] = useState('');

  const [isRestoring, setIsRestoring] = useState(true);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { width } = useWindowDimensions();
  const isMobile = width < 900;

  const animation = useRef(new Animated.Value(0)).current;

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
            savedData.screen === 'dashboard' ||
            savedData.screen === 'recursos' ||
            savedData.screen === 'precos' ||
            savedData.screen === 'suporte'
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

  if (!fontsLoaded || isRestoring) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      </View>
    );
  }

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha seu usuário e senha.');
      return;
    }

    if (email.trim() === 'conta' && password.trim() === 'mesamesenha55') {
      setScreen('dashboard');
    } else {
      Alert.alert('Erro de Acesso', 'Usuário ou senha incorretos.');
    }
  };

  const handleLogout = async () => {
    try {
      setEmail('');
      setPassword('');
      setImageUrls('');
      setPreviewData(null);
      setFinalDownloadUrl('');
      setUserMenuOpen(false);
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

  const handleFetchInfoForPreview = async () => {
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
      setFinalDownloadUrl('');
      const targetUrl = urlsArray[0];

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
          Alert.alert('Pontos Insuficientes', 'Você está sem pontos para realizar este download.');
        } else {
          Alert.alert('Aviso', msg);
        }
        return;
      }

      setPreviewData(infoData.data);
      setScreen('preview');
    } catch (error: any) {
      console.error('❌ [ERRO AO BUSCAR INFO]:', error.message || error);
      Alert.alert('Erro', 'Não foi possível carregar a prévia do arquivo.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndGenerate = async () => {
    if (!previewData || !previewData.id) {
      Alert.alert('Erro', 'Dados do arquivo inválidos.');
      setScreen('dashboard');
      return;
    }

    try {
      setDownloading(true);
      const source = previewData.source || 'freepik';
      const fileId = previewData.id;

      const orderEndpoint = `${PROXY_BASE_URL}/stockorder/${source}/${fileId}`;
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
          Alert.alert('Pontos Insuficientes', 'Você está sem pontos para realizar este download.');
        } else {
          Alert.alert('Erro', orderMsg);
        }
        return;
      }

      const taskId = orderData.task_id;

      let isReady = false;
      let urlFound = '';
      let attempts = 0;
      const maxAttempts = 10;

      while (!isReady && attempts < maxAttempts) {
        attempts++;
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
          urlFound = statusData.available_download_links[0].url;
        }
      }

      if (!isReady || !urlFound) {
        Alert.alert('Aviso', 'O tempo limite para gerar o link de download esgotou-se.');
        return;
      }

      setFinalDownloadUrl(urlFound);
    } catch (error: any) {
      console.error('❌ [ERRO NO PROCESSO]:', error.message || error);
      Alert.alert('Erro', 'Não foi possível concluir a operação.');
    } finally {
      setDownloading(false);
    }
  };

  const handleExecuteDownload = async () => {
    if (!finalDownloadUrl) return;

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
  };

  const renderSidebar = () => (
    <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
      <View style={styles.sidebarUserWrapper}>
        <Pressable
          style={({ hovered }: any) => [styles.sidebarUserSection, hovered && styles.hoverOpacity]}
          onPress={() => setUserMenuOpen(!userMenuOpen)}
        >
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>c</Text>
          </View>
          {!isMobile && <Text style={styles.userName}>conta</Text>}
          <Ionicons
            name={userMenuOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#64748b"
          />
        </Pressable>
      </View>

      <Pressable style={({ hovered }: any) => [styles.balanceCard, hovered && styles.hoverOpacity]}>
        <View style={styles.balanceIconBox}>
          <Ionicons name="wallet-outline" size={20} color="#2563eb" />
        </View>
        {!isMobile && (
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>SALDO</Text>
            <Text style={styles.balanceValue}>{userBalance}</Text>
          </View>
        )}
        {!isMobile && <Ionicons name="chevron-forward" size={16} color="#94a3b8" />}
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: 8 }}>
        <Pressable
          style={({ hovered }: any) => [
            styles.menuItem,
            styles.menuItemActive,
            hovered && styles.hoverOpacity,
          ]}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="images-outline" size={18} color="#2563eb" />
          </View>
          {!isMobile && <Text style={[styles.menuItemText, styles.menuItemTextActive]}>Estoque original</Text>}
        </Pressable>
      </ScrollView>

      {/* Botão Sair fora da seta, fixo na sidebar */}
      <Pressable
        style={({ hovered }: any) => [
          styles.sidebarLogoutButton,
          hovered && styles.hoverOpacity,
        ]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        {!isMobile && <Text style={styles.sidebarLogoutText}>Sair</Text>}
      </Pressable>
    </View>
  );

  if (screen === 'preview') {
    const previewImage = previewData?.preview || previewData?.image || previewData?.thumbnail;
    const sourceName = previewData?.source || 'freepik';

    return (
      <View style={[styles.dashboardContainer, isMobile && styles.dashboardContainerMobile]}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        {renderSidebar()}

        <ScrollView
          style={styles.dashboardMain}
          contentContainerStyle={[styles.dashboardMainContent, isMobile && styles.dashboardMainContentMobile]}
          showsVerticalScrollIndicator={true}
        >
          <Pressable
            style={({ hovered }: any) => [
              styles.backButton,
              hovered && styles.hoverOpacity,
            ]}
            onPress={() => {
              setScreen('dashboard');
              setPreviewData(null);
              setFinalDownloadUrl('');
            }}
          >
            <Ionicons name="arrow-back-outline" size={18} color="#0f172a" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </Pressable>

          <View style={styles.previewVerticalLayout}>
            <View style={[styles.previewFileCard, isMobile && { width: '100%' }]}>
              {previewImage ? (
                <Image source={{ uri: previewImage }} style={styles.previewCardImage} resizeMode="cover" />
              ) : (
                <View style={[styles.previewCardImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' }]}>
                  <Ionicons name="image-outline" size={32} color="#94a3b8" />
                </View>
              )}

              <View style={styles.previewCardInfo}>
                <View style={styles.previewCardHeaderRow}>
                  <Text style={styles.previewSourceText}>
                    {sourceName} <Text style={styles.previewIdSub}>/ {previewData?.id || 'ID'}</Text>
                  </Text>
                  <Ionicons name="document-text-outline" size={16} color="#64748b" />
                </View>

                <Text style={styles.previewIdDetailText} numberOfLines={1}>
                  📄 {sourceName.charAt(0).toUpperCase() + sourceName.slice(1)} ID {previewData?.id || ''}
                </Text>

                {downloading ? (
                  <View style={styles.loadingCardContent}>
                    <View style={styles.freeBadgeRow}>
                      <View style={styles.freeBadgeContainer}>
                        <Text style={styles.freeBadgeText}>grátis</Text>
                      </View>
                    </View>
                    <View style={styles.generatingRow}>
                      <Ionicons name="checkbox" size={16} color="#10b981" style={{ marginRight: 4 }} />
                      <Text style={styles.generatingText}>Grátis, gerando link de download</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={styles.progressBarFill} />
                    </View>
                  </View>
                ) : (
                  <View style={styles.previewCardFooterRow}>
                    <Text style={styles.previewCostText}>0.3 pts</Text>
                    <Pressable
                      style={({ hovered }: any) => [
                        styles.confirmButtonSmall,
                        finalDownloadUrl ? { backgroundColor: '#10b981', borderColor: '#10b981' } : null,
                        hovered && styles.hoverOpacity,
                      ]}
                      onPress={finalDownloadUrl ? handleExecuteDownload : handleConfirmAndGenerate}
                    >
                      <Text
                        style={[
                          styles.confirmButtonSmallText,
                          finalDownloadUrl ? { color: '#ffffff' } : null,
                        ]}
                      >
                        {finalDownloadUrl ? 'Baixar' : 'Confirmar'}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.summaryPanelCard}>
              <View style={styles.summaryContentRow}>
                <View>
                  <Text style={styles.summaryPanelTitle}>Resumo</Text>
                  <Text style={styles.summaryPanelDetails}>
                    {sourceName} - 1 link - 0.30 pts
                  </Text>
                  <Text style={styles.summaryPanelTotal}>
                    Total: 0.30 pts
                  </Text>
                </View>

                <Pressable
                  style={({ hovered }: any) => [
                    styles.summaryConfirmButtonCompact,
                    finalDownloadUrl ? { backgroundColor: '#10b981' } : null,
                    hovered && styles.hoverOpacity,
                  ]}
                  disabled={downloading}
                  onPress={finalDownloadUrl ? handleExecuteDownload : handleConfirmAndGenerate}
                >
                  <Text style={styles.summaryConfirmButtonCompactText}>
                    {downloading ? 'Gerando link...' : finalDownloadUrl ? 'Baixar Arquivo' : 'Confirmar para obter todos'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.tierBarContainer}>
            <View style={styles.tierHeader}>
              <Text style={styles.tierBadge}>⭐ Nível 1</Text>
              <Text style={styles.tierInfoText}>1/300 downloads pagos em 30 dias — faltam 299 para desbloquear melhores preços</Text>
              <Ionicons name="help-circle-outline" size={16} color="#94a3b8" />
            </View>
            <View style={styles.tierProgressBarBg}>
              <View style={styles.tierProgressBarFill} />
            </View>
          </View>

          <View style={styles.platformsContainer}>
            {PLATFORMS_LIST.map((item, index) => (
              <View key={index} style={[styles.platformRowItem, isMobile && { width: '100%' }]}>
                <View style={styles.platformNameWrapper}>
                  <Image
                    source={{ uri: `https://www.google.com/s2/favicons?domain=${item.domain}&sz=64` }}
                    style={styles.platformLogoImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.platformNameText}>{item.name}</Text>
                </View>
                <View style={[styles.platformCostBadge, item.cost === 'off' && styles.platformOffBadge]}>
                  <Text style={[styles.platformCostText, item.cost === 'off' && styles.platformOffText]}>
                    {item.cost}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (screen === 'dashboard') {
    return (
      <View style={[styles.dashboardContainer, isMobile && styles.dashboardContainerMobile]}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        {renderSidebar()}

        <ScrollView
          style={styles.dashboardMain}
          contentContainerStyle={[styles.dashboardMainContent, isMobile && styles.dashboardMainContentMobile]}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.dashboardHeaderArea}>
            <Text style={styles.instructionsTopText}>
              Insira as URLs das imagens (uma por linha) e clique no botão para obter informações dos arquivos
            </Text>
          </View>

          <TextInput
            style={styles.urlInput}
            multiline
            value={imageUrls}
            onChangeText={setImageUrls}
            placeholder="Cole as URLs dos ativos aqui (uma por linha)..."
            placeholderTextColor="#94a3b8"
            textAlignVertical="top"
          />

          <Pressable
            style={({ hovered }: any) => [
              styles.getFilesButton,
              hovered && styles.hoverOpacity,
            ]}
            disabled={loading}
            onPress={handleFetchInfoForPreview}
          >
            <Ionicons name="cloud-download-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.getFilesButtonText}>
              {loading ? 'Processando URLs...' : 'OBTER informações dos arquivos'}
            </Text>
          </Pressable>

          <View style={styles.platformsContainer}>
            {PLATFORMS_LIST.map((item, index) => (
              <View key={index} style={[styles.platformRowItem, isMobile && { width: '100%' }]}>
                <View style={styles.platformNameWrapper}>
                  <Image
                    source={{ uri: `https://www.google.com/s2/favicons?domain=${item.domain}&sz=64` }}
                    style={styles.platformLogoImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.platformNameText}>{item.name}</Text>
                </View>
                <View style={[styles.platformCostBadge, item.cost === 'off' && styles.platformOffBadge]}>
                  <Text style={[styles.platformCostText, item.cost === 'off' && styles.platformOffText]}>
                    {item.cost}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (screen === 'recursos') {
    return (
      <ScrollView style={styles.homeContainer} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={[styles.navbar, isMobile && styles.navbarMobile]}>
          <Pressable style={styles.logoArea} onPress={() => setScreen('home')}>
            <Image source={require('../assets/images/logo.png')} style={{ width: 140, height: 45, tintColor: '#2563eb' }} resizeMode="contain" />
          </Pressable>
          {!isMobile && (
            <View style={styles.navLinks}>
              <Pressable style={({ hovered }: any) => [styles.navLinkItem, hovered && styles.hoverOpacity]} onPress={() => setScreen('recursos')}>
                <Text style={[styles.navLinkText, { color: '#2563eb', fontWeight: '700' }]}>Recursos Premium</Text>
              </Pressable>
              <Pressable style={({ hovered }: any) => [styles.navLinkItem, hovered && styles.hoverOpacity]} onPress={() => setScreen('precos')}>
                <Text style={styles.navLinkText}>Preços</Text>
              </Pressable>
              <Pressable style={({ hovered }: any) => [styles.navLinkItem, hovered && styles.hoverOpacity]} onPress={() => setScreen('suporte')}>
                <Text style={styles.navLinkText}>Suporte</Text>
              </Pressable>
            </View>
          )}
          <Pressable style={({ hovered }: any) => [styles.navAccessButton, hovered && styles.hoverOpacity]} onPress={() => setScreen('login')}>
            <Text style={styles.navAccessButtonText}>Acessar</Text>
          </Pressable>
        </View>

        <View style={[styles.subPageContainer, isMobile && styles.subPageContainerMobile]}>
          <Pressable style={({ hovered }: any) => [styles.backButtonSub, hovered && styles.hoverOpacity]} onPress={() => setScreen('home')}>
            <Ionicons name="arrow-back" size={18} color="#0f172a" />
            <Text style={styles.backButtonSubText}>Voltar ao Início</Text>
          </Pressable>
          <Text style={[styles.subPageTitle, isMobile && { fontSize: 28 }]}>Recursos Premium</Text>
          <Text style={styles.subPageDesc}>Explore mais de 40 plataformas integradas com acesso imediato e ilimitado para impulsionar os seus projetos criativos.</Text>
          
          <View style={styles.platformsContainerSub}>
            {PLATFORMS_LIST.map((item, index) => (
              <View key={index} style={[styles.platformRowItemSub, isMobile && { width: '100%' }]}>
                <View style={styles.platformNameWrapper}>
                  <Image
                    source={{ uri: `https://www.google.com/s2/favicons?domain=${item.domain}&sz=64` }}
                    style={styles.platformLogoImageSub}
                    resizeMode="contain"
                  />
                  <Text style={styles.platformNameTextSub}>{item.name.toUpperCase()}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  if (screen === 'precos') {
    return (
      <ScrollView style={styles.homeContainer} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={[styles.navbar, isMobile && styles.navbarMobile]}>
          <Pressable style={styles.logoArea} onPress={() => setScreen('home')}>
            <Image source={require('../assets/images/logo.png')} style={{ width: 140, height: 45, tintColor: '#2563eb' }} resizeMode="contain" />
          </Pressable>
          {!isMobile && (
            <View style={styles.navLinks}>
              <Pressable style={({ hovered }: any) => [styles.navLinkItem, hovered && styles.hoverOpacity]} onPress={() => setScreen('recursos')}>
                <Text style={styles.navLinkText}>Recursos Premium</Text>
              </Pressable>
              <Pressable style={({ hovered }: any) => [styles.navLinkItem, hovered && styles.hoverOpacity]} onPress={() => setScreen('precos')}>
                <Text style={[styles.navLinkText, { color: '#2563eb', fontWeight: '700' }]}>Preços</Text>
              </Pressable>
              <Pressable style={({ hovered }: any) => [styles.navLinkItem, hovered && styles.hoverOpacity]} onPress={() => setScreen('suporte')}>
                <Text style={styles.navLinkText}>Suporte</Text>
              </Pressable>
            </View>
          )}
          <Pressable style={({ hovered }: any) => [styles.navAccessButton, hovered && styles.hoverOpacity]} onPress={() => setScreen('login')}>
            <Text style={styles.navAccessButtonText}>Acessar</Text>
          </Pressable>
        </View>

        <View style={[styles.subPageContainer, isMobile && styles.subPageContainerMobile]}>
          <Pressable style={({ hovered }: any) => [styles.backButtonSub, hovered && styles.hoverOpacity]} onPress={() => setScreen('home')}>
            <Ionicons name="arrow-back" size={18} color="#0f172a" />
            <Text style={styles.backButtonSubText}>Voltar ao Início</Text>
          </Pressable>
          <Text style={[styles.subPageTitle, isMobile && { fontSize: 28 }]}>Planos e Preços</Text>
          <Text style={styles.subPageDesc}>Acesso completo a todas as ferramentas e recursos criativos com uma assinatura única anual.</Text>

          <View style={styles.pricingSingleContainer}>
            <View style={[styles.pricingCard, styles.pricingCardFeatured]}>
              <View style={styles.featuredBadge}><Text style={styles.featuredBadgeText}>Plano Completo</Text></View>
              <Text style={styles.pricingPlanName}>Acesso Anual Ilimitado</Text>
              <Text style={styles.pricingPrice}>R$ 10<Text style={styles.pricingPeriod}>/ano</Text></Text>
              <Text style={styles.pricingPlanDesc}>Tudo o que você precisa em um único plano anual.</Text>
              <View style={styles.pricingFeaturesList}>
                <Text style={styles.pricingFeatureItem}>✔ Acesso total a todas as plataformas integradas</Text>
                <Text style={styles.pricingFeatureItem}>✔ Downloads rápidos e ilimitados</Text>
                <Text style={styles.pricingFeatureItem}>✔ Suporte dedicado</Text>
              </View>
              <Pressable style={({ hovered }: any) => [styles.pricingButtonFeatured, hovered && styles.hoverOpacity]} onPress={() => setScreen('login')}>
                <Text style={styles.pricingButtonFeaturedText}>Assinar Agora por R$ 10/ano</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (screen === 'suporte') {
    return (
      <ScrollView style={styles.homeContainer} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={[styles.navbar, isMobile && styles.navbarMobile]}>
          <Pressable style={styles.logoArea} onPress={() => setScreen('home')}>
            <Image source={require('../assets/images/logo.png')} style={{ width: 140, height: 45, tintColor: '#2563eb' }} resizeMode="contain" />
          </Pressable>
          {!isMobile && (
            <View style={styles.navLinks}>
              <Pressable style={({ hovered }: any) => [styles.navLinkItem, hovered && styles.hoverOpacity]} onPress={() => setScreen('recursos')}>
                <Text style={styles.navLinkText}>Recursos Premium</Text>
              </Pressable>
              <Pressable style={({ hovered }: any) => [styles.navLinkItem, hovered && styles.hoverOpacity]} onPress={() => setScreen('precos')}>
                <Text style={styles.navLinkText}>Preços</Text>
              </Pressable>
              <Pressable style={({ hovered }: any) => [styles.navLinkItem, hovered && styles.hoverOpacity]} onPress={() => setScreen('suporte')}>
                <Text style={[styles.navLinkText, { color: '#2563eb', fontWeight: '700' }]}>Suporte</Text>
              </Pressable>
            </View>
          )}
          <Pressable style={({ hovered }: any) => [styles.navAccessButton, hovered && styles.hoverOpacity]} onPress={() => setScreen('login')}>
            <Text style={styles.navAccessButtonText}>Acessar</Text>
          </Pressable>
        </View>

        <View style={[styles.subPageContainer, isMobile && styles.subPageContainerMobile]}>
          <Pressable style={({ hovered }: any) => [styles.backButtonSub, hovered && styles.hoverOpacity]} onPress={() => setScreen('home')}>
            <Ionicons name="arrow-back" size={18} color="#0f172a" />
            <Text style={styles.backButtonSubText}>Voltar ao Início</Text>
          </Pressable>
          <Text style={[styles.subPageTitle, isMobile && { fontSize: 28 }]}>Central de Suporte</Text>
          <Text style={styles.subPageDesc}>Precisa de Ajuda? Entre em contato conosco ou consulte as dúvidas frequentes.</Text>

          <View style={styles.supportGrid}>
            <View style={styles.supportCard}>
              <Ionicons name="chatbubbles-outline" size={32} color="#2563eb" />
              <Text style={styles.supportCardTitle}>Chat ao Vivo</Text>
              <Text style={styles.supportCardDesc}>Fale instantaneamente com nossa equipe de atendimento.</Text>
            </View>
            <View style={styles.supportCard}>
              <Ionicons name="mail-outline" size={32} color="#2563eb" />
              <Text style={styles.supportCardTitle}>E-mail de Suporte</Text>
              <Text style={styles.supportCardDesc}>suporte@connecteducation.com.br</Text>
            </View>
            <View style={styles.supportCard}>
              <Ionicons name="help-circle-outline" size={32} color="#2563eb" />
              <Text style={styles.supportCardTitle}>FAQ</Text>
              <Text style={styles.supportCardDesc}>Consulte perguntas frequentes sobre os downloads e acessos.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (screen === 'home') {
    return (
      <ScrollView style={styles.homeContainer} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <View style={[styles.navbar, isMobile && styles.navbarMobile]}>
          <Pressable style={styles.logoArea} onPress={() => setScreen('home')}>
            <Image
              source={require('../assets/images/logo.png')}
              style={{ width: 140, height: 45, tintColor: '#2563eb' }}
              resizeMode="contain"
            />
          </Pressable>

          {!isMobile && (
            <View style={styles.navLinks}>
              <Pressable style={({ hovered }: any) => [styles.navLinkItem, hovered && styles.hoverOpacity]} onPress={() => setScreen('recursos')}>
                <Text style={styles.navLinkText}>Recursos Premium</Text>
              </Pressable>
              <Pressable style={({ hovered }: any) => [styles.navLinkItem, hovered && styles.hoverOpacity]} onPress={() => setScreen('precos')}>
                <Text style={styles.navLinkText}>Preços</Text>
              </Pressable>
              <Pressable style={({ hovered }: any) => [styles.navLinkItem, hovered && styles.hoverOpacity]} onPress={() => setScreen('suporte')}>
                <Text style={styles.navLinkText}>Suporte</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            style={({ hovered }: any) => [styles.navAccessButton, hovered && styles.hoverOpacity]}
            onPress={() => setScreen('login')}
          >
            <Text style={styles.navAccessButtonText}>Acessar</Text>
          </Pressable>
        </View>

        <View style={[styles.hero, isMobile && styles.heroMobile]}>
          <View style={[styles.heroLeft, isMobile && styles.heroLeftMobile]}>
            <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
              Todos os recursos.{'\n'}Um só acesso.
            </Text>
            <Text style={styles.heroDescription}>
              Encontre um mundo de recursos criativos, ferramentas premium e muito mais, em um só lugar.
            </Text>

            <Pressable
              style={({ hovered }: any) => [styles.heroCtaButton, hovered && styles.hoverOpacity]}
              onPress={() => setScreen('login')}
            >
              <Text style={styles.heroCtaButtonText}>Acesse e confira</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </Pressable>
          </View>

          <View style={styles.heroRight}>
            <View style={[styles.mockupPlaceholderBox, isMobile && { height: 240 }]}>
              <Image
                source={require('../assets/images/imagem.png')}
                style={styles.heroMockupImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        <View style={[styles.platformsSection, isMobile && styles.platformsSectionMobile]}>
          <Text style={[styles.platformsSectionTitle, isMobile && { fontSize: 24 }]}>Plataformas incluídas</Text>

          <View style={styles.platformsGrid}>
            <View style={[styles.platformCard, isMobile && { width: '100%' }]}>
              <View style={styles.platformCardThumbGrid}>
                <Ionicons name="images-outline" size={36} color="#2563eb" />
              </View>
              <Text style={styles.platformCardTitle}>Banco de Imagens</Text>
            </View>

            <View style={[styles.platformCard, isMobile && { width: '100%' }]}>
              <View style={styles.platformCardThumbPlain}>
                <Text style={styles.fontCardText}>Aa Aa</Text>
              </View>
              <Text style={styles.platformCardTitle}>Fontes</Text>
            </View>

            <View style={[styles.platformCard, isMobile && { width: '100%' }]}>
              <View style={styles.platformCardThumbTemplate}>
                <Ionicons name="browsers-outline" size={36} color="#2563eb" />
              </View>
              <Text style={styles.platformCardTitle}>Templates</Text>
            </View>

            <View style={[styles.platformCard, isMobile && { width: '100%' }]}>
              <View style={styles.platformCardThumbMockup}>
                <Ionicons name="cube-outline" size={36} color="#0f172a" />
              </View>
              <Text style={styles.platformCardTitle}>Mockups</Text>
            </View>

            <View style={[styles.platformCard, isMobile && { width: '100%' }]}>
              <View style={styles.platformCardThumbIcons}>
                <Ionicons name="heart-outline" size={24} color="#0f172a" />
                <Ionicons name="star-outline" size={24} color="#0f172a" />
                <Ionicons name="search-outline" size={24} color="#0f172a" />
                <Ionicons name="person-outline" size={24} color="#0f172a" />
              </View>
              <Text style={styles.platformCardTitle}>Ícones</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <LinearGradient
      colors={['#eff6ff', '#dbeafe', '#bfdbfe']}
      locations={[0, 0.5, 1]}
      style={styles.loginContainer}
    >
      <StatusBar barStyle="dark-content" />

      <Pressable
        style={({ hovered }: any) => [styles.loginBackButton, hovered && styles.hoverOpacity]}
        onPress={() => setScreen('home')}
      >
        <Ionicons name="arrow-back" size={20} color="#1e40af" />
        <Text style={styles.loginBackText}>Voltar ao Início</Text>
      </Pressable>

      <View style={styles.loginCardModern}>
        <View style={styles.loginHeaderArea}>
          <Image
            source={require('../assets/images/logo.png')}
            style={{ width: 180, height: 65, tintColor: '#2563eb', marginBottom: 15 }}
            resizeMode="contain"
          />
          <Text style={styles.loginTitleModern}>Bem-vindo de volta</Text>
          <Text style={styles.loginSubtitleModern}>Acesse sua conta para continuar</Text>
        </View>

        <View style={styles.formModern}>
          <View
            style={[
              styles.inputContainerModern,
              emailFocused && styles.inputContainerFocused,
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={emailFocused ? '#2563eb' : '#64748b'}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.inputModern}
              placeholder="Usuário / E-mail"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              selectionColor="#2563eb"
            />
          </View>

          <View
            style={[
              styles.inputContainerModern,
              passwordFocused && styles.inputContainerFocused,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={passwordFocused ? '#2563eb' : '#64748b'}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.inputModern}
              placeholder="Senha"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              secureTextEntry={!showPassword}
              autoComplete="off"
              selectionColor="#2563eb"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#64748b"
              />
            </Pressable>
          </View>

          <Pressable
            style={({ hovered }: any) => [
              styles.loginButtonModern,
              hovered && styles.hoverOpacity,
            ]}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonTextModern}>ENTRAR</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hoverOpacity: {
    opacity: 0.8,
    cursor: 'pointer' as any,
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navbar: {
    height: 80,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  navbarMobile: {
    paddingHorizontal: 16,
    height: 70,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  navLinkItem: {
    paddingVertical: 6,
  },
  navLinkText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0f172a',
  },
  navAccessButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  navAccessButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  hero: {
    maxWidth: 1250,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 60,
    width: '100%',
  },
  heroMobile: {
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 30,
  },
  heroLeft: {
    flex: 1,
    maxWidth: 600,
  },
  heroLeftMobile: {
    maxWidth: '100%',
    alignItems: 'center',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 52,
    lineHeight: 60,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -1.5,
    marginBottom: 20,
  },
  heroTitleMobile: {
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 18,
    lineHeight: 28,
    color: '#475569',
    marginBottom: 30,
  },
  heroCtaButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    height: 54,
    paddingHorizontal: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
  },
  heroCtaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  heroRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  mockupPlaceholderBox: {
    width: '100%',
    maxWidth: 540,
    height: 360,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 0,
  },
  heroMockupImage: {
    width: '100%',
    height: '100%',
  },
  platformsSection: {
    maxWidth: 1250,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  platformsSectionMobile: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  platformsSectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 30,
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'space-between',
  },
  platformCard: {
    width: '18%',
    minWidth: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 12,
  },
  platformCardThumbGrid: {
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformCardThumbPlain: {
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontCardText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  platformCardThumbTemplate: {
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformCardThumbMockup: {
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformCardThumbIcons: {
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
  },
  platformCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  subPageContainer: {
    maxWidth: 1250,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  subPageContainerMobile: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButtonSub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backButtonSubText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  subPageTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  subPageDesc: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 30,
    maxWidth: 700,
  },
  platformsContainerSub: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  platformRowItemSub: {
    width: '31%',
    minWidth: 280,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  platformLogoImageSub: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  platformNameTextSub: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  pricingSingleContainer: {
    maxWidth: 450,
    marginTop: 20,
    width: '100%',
  },
  pricingCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 35,
  },
  pricingCardFeatured: {
    borderColor: '#2563eb',
    borderWidth: 2,
  },
  featuredBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  featuredBadgeText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
  },
  pricingPlanName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  pricingPrice: {
    fontSize: 48,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  pricingPeriod: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  pricingPlanDesc: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  pricingFeaturesList: {
    gap: 12,
    marginBottom: 30,
  },
  pricingFeatureItem: {
    fontSize: 15,
    color: '#334155',
  },
  pricingButtonFeatured: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  pricingButtonFeaturedText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 20,
  },
  supportCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 24,
    gap: 10,
  },
  supportCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  supportCardDesc: {
    fontSize: 14,
    color: '#64748b',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginBackButton: {
    position: 'absolute',
    top: 30,
    left: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loginBackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  loginCardModern: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  loginHeaderArea: {
    alignItems: 'center',
    marginBottom: 30,
  },
  loginTitleModern: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  loginSubtitleModern: {
    fontSize: 14,
    color: '#64748b',
  },
  formModern: {
    width: '100%',
  },
  inputContainerModern: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  inputContainerFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#ffffff',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  inputModern: {
    flex: 1,
    height: '100%',
    color: '#0f172a',
    fontSize: 15,
    backgroundColor: 'transparent',
    outlineStyle: 'none' as any,
  },
  loginButtonModern: {
    width: '100%',
    height: 52,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonTextModern: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dashboardContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  dashboardContainerMobile: {
    flexDirection: 'column',
  },
  sidebar: {
    width: 270,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    paddingVertical: 24,
    paddingHorizontal: 16,
    flexDirection: 'column',
  },
  sidebarMobile: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sidebarUserWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  sidebarUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userAvatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  userName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  balanceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d4ed8',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e40af',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 4,
    gap: 12,
  },
  menuIconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemActive: {
    backgroundColor: '#f1f5f9',
  },
  menuItemText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  menuItemTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  sidebarLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 'auto',
  },
  sidebarLogoutText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  dashboardMain: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  dashboardMainContent: {
    paddingHorizontal: 35,
    paddingTop: 35,
    paddingBottom: 40,
    width: '100%',
  },
  dashboardMainContentMobile: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  dashboardHeaderArea: {
    marginBottom: 20,
  },
  instructionsTopText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '400',
  },
  urlInput: {
    width: '100%',
    height: 220,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 16,
    fontSize: 15,
    color: '#0f172a',
    outlineStyle: 'none' as any,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
  },
  getFilesButton: {
    height: 52,
    paddingHorizontal: 32,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 35,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  getFilesButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
  },
  platformsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 20,
  },
  platformRowItem: {
    width: '24%',
    minWidth: 200,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
  },
  platformNameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformLogoImage: {
    width: 18,
    height: 18,
    borderRadius: 3,
    marginRight: 8,
  },
  platformNameText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  platformCostBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  platformCostText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  platformOffBadge: {
    backgroundColor: '#f1f5f9',
  },
  platformOffText: {
    color: '#94a3b8',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  backButtonText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  previewVerticalLayout: {
    flexDirection: 'column',
    gap: 20,
    width: '100%',
  },
  previewFileCard: {
    width: 280,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  previewCardImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f8fafc',
  },
  previewCardInfo: {
    padding: 14,
  },
  previewCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  previewSourceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  previewIdSub: {
    fontSize: 13,
    fontWeight: '400',
    color: '#64748b',
  },
  previewIdDetailText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  previewCardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewCostText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  confirmButtonSmall: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  confirmButtonSmallText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  loadingCardContent: {
    marginTop: 4,
  },
  freeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  freeBadgeContainer: {
    backgroundColor: '#eab308',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'lowercase',
    lineHeight: 14,
  },
  generatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  generatingText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '40%',
    height: '100%',
    backgroundColor: '#10b981',
  },
  summaryPanelCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: '0.03' as any,
    shadowRadius: 6,
  },
  summaryContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 15,
  },
  summaryPanelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  summaryPanelDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  summaryPanelTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  summaryConfirmButtonCompact: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  summaryConfirmButtonCompactText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  tierBarContainer: {
    marginTop: 25,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tierBadge: {
    backgroundColor: '#f1f5f9',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    color: '#0f172a',
  },
  tierInfoText: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
    marginLeft: 12,
  },
  tierProgressBarBg: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tierProgressBarFill: {
    width: '0.3%',
    height: '100%',
    backgroundColor: '#2563eb',
  },
});