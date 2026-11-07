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
  SafeAreaView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const STORAGE_KEY = '@cfi_screen_state';
const PROXY_BASE_URL = 'http://192.168.18.5:3000/api';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <View style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      </View>
    );
  }

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha seu usuário e senha.');
      return;
    }

    if (email.trim() === 'conta' && password.trim() === 'mesmasenha55') {
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
      setMobileMenuOpen(false);
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
      Alert.alert('Erro de Conexão', `Não foi possível carregar a prévia:\n${error.message || error}`);
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
      Alert.alert('Erro de Conexão', `Não foi possível concluir a operação:\n${error.message || error}`);
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
        <View style={styles.sidebarUserSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>c</Text>
          </View>
          {!isMobile && <Text style={styles.userName}>conta</Text>}
        </View>
      </View>

      <Pressable style={({ hovered }: any) => [styles.balanceCard, hovered && styles.hoverOpacity, isMobile && styles.balanceCardMobile]}>
        <View style={styles.balanceIconBox}>
          <Ionicons name="wallet-outline" size={isMobile ? 16 : 20} color="#2563eb" />
        </View>
        <View style={styles.balanceInfo}>
          {!isMobile && <Text style={styles.balanceLabel}>SALDO</Text>}
          <Text style={[styles.balanceValue, isMobile && styles.balanceValueMobile]}>{userBalance}</Text>
        </View>
        {!isMobile && <Ionicons name="chevron-forward" size={16} color="#94a3b8" />}
      </Pressable>

      {!isMobile && (
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
            <Text style={[styles.menuItemText, styles.menuItemTextActive]}>Estoque original</Text>
          </Pressable>
        </ScrollView>
      )}

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
      <SafeAreaView style={[styles.dashboardContainer, isMobile && styles.dashboardContainerMobile]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
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
                <View style={[isMobile && { width: '100%', alignItems: 'center' }]}>
                  <Text style={[styles.summaryPanelTitle, isMobile && { textAlign: 'center' }]}>Resumo</Text>
                  <Text style={[styles.summaryPanelDetails, isMobile && { textAlign: 'center' }]}>
                    {sourceName} - 1 link - 0.30 pts
                  </Text>
                  <Text style={[styles.summaryPanelTotal, isMobile && { textAlign: 'center' }]}>
                    Total: 0.30 pts
                  </Text>
                </View>

                <Pressable
                  style={({ hovered }: any) => [
                    styles.summaryConfirmButtonCompact,
                    finalDownloadUrl ? { backgroundColor: '#10b981' } : null,
                    isMobile && { width: '100%' },
                    hovered && styles.hoverOpacity,
                  ]}
                  disabled={downloading}
                  onPress={finalDownloadUrl ? handleExecuteDownload : handleConfirmAndGenerate}
                >
                  <Text style={[styles.summaryConfirmButtonCompactText, isMobile && { textAlign: 'center' }]}>
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
      </SafeAreaView>
    );
  }

  if (screen === 'dashboard') {
    return (
      <SafeAreaView style={[styles.dashboardContainer, isMobile && styles.dashboardContainerMobile]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
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
              isMobile && { width: '100%', alignSelf: 'center' },
              hovered && styles.hoverOpacity,
            ]}
            disabled={loading}
            onPress={handleFetchInfoForPreview}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="cloud-download-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.getFilesButtonText}>
                {loading ? 'Processando URLs...' : 'OBTER informações dos arquivos'}
              </Text>
            </View>
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
      </SafeAreaView>
    );
  }

  if (screen === 'recursos') {
    return (
      <SafeAreaView style={styles.homeSafeArea}>
        <ScrollView style={styles.homeContainer} contentContainerStyle={styles.scrollContentContainer} showsVerticalScrollIndicator={false}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <View style={[styles.navbar, isMobile && styles.navbarMobile]}>
            <View style={styles.logoArea} />
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
            {isMobile ? (
              <Pressable onPress={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ padding: 6 }}>
                <Ionicons name={mobileMenuOpen ? 'close' : 'menu'} size={24} color="#0f172a" />
              </Pressable>
            ) : (
              <Pressable style={({ hovered }: any) => [styles.navAccessButton, hovered && styles.hoverOpacity]} onPress={() => setScreen('login')}>
                <Text style={styles.navAccessButtonText}>Acessar</Text>
              </Pressable>
            )}
          </View>

          {isMobile && mobileMenuOpen && (
            <View style={styles.mobileDropdownMenu}>
              <Pressable style={styles.mobileDropdownItem} onPress={() => { setScreen('recursos'); setMobileMenuOpen(false); }}>
                <Text style={[styles.mobileDropdownText, { color: '#2563eb', fontWeight: '700' }]}>Recursos Premium</Text>
              </Pressable>
              <Pressable style={styles.mobileDropdownItem} onPress={() => { setScreen('precos'); setMobileMenuOpen(false); }}>
                <Text style={styles.mobileDropdownText}>Preços</Text>
              </Pressable>
              <Pressable style={styles.mobileDropdownItem} onPress={() => { setScreen('suporte'); setMobileMenuOpen(false); }}>
                <Text style={styles.mobileDropdownText}>Suporte</Text>
              </Pressable>
              <Pressable style={styles.mobileDropdownItemBtn} onPress={() => { setScreen('login'); setMobileMenuOpen(false); }}>
                <Text style={styles.mobileDropdownBtnText}>Acessar</Text>
              </Pressable>
            </View>
          )}

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
      </SafeAreaView>
    );
  }

  if (screen === 'precos') {
    return (
      <SafeAreaView style={styles.homeSafeArea}>
        <ScrollView style={styles.homeContainer} contentContainerStyle={styles.scrollContentContainer} showsVerticalScrollIndicator={false}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <View style={[styles.navbar, isMobile && styles.navbarMobile]}>
            <View style={styles.logoArea} />
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
            {isMobile ? (
              <Pressable onPress={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ padding: 6 }}>
                <Ionicons name={mobileMenuOpen ? 'close' : 'menu'} size={24} color="#0f172a" />
              </Pressable>
            ) : (
              <Pressable style={({ hovered }: any) => [styles.navAccessButton, hovered && styles.hoverOpacity]} onPress={() => setScreen('login')}>
                <Text style={styles.navAccessButtonText}>Acessar</Text>
              </Pressable>
            )}
          </View>

          {isMobile && mobileMenuOpen && (
            <View style={styles.mobileDropdownMenu}>
              <Pressable style={styles.mobileDropdownItem} onPress={() => { setScreen('recursos'); setMobileMenuOpen(false); }}>
                <Text style={styles.mobileDropdownText}>Recursos Premium</Text>
              </Pressable>
              <Pressable style={styles.mobileDropdownItem} onPress={() => { setScreen('precos'); setMobileMenuOpen(false); }}>
                <Text style={[styles.mobileDropdownText, { color: '#2563eb', fontWeight: '700' }]}>Preços</Text>
              </Pressable>
              <Pressable style={styles.mobileDropdownItem} onPress={() => { setScreen('suporte'); setMobileMenuOpen(false); }}>
                <Text style={styles.mobileDropdownText}>Suporte</Text>
              </Pressable>
              <Pressable style={styles.mobileDropdownItemBtn} onPress={() => { setScreen('login'); setMobileMenuOpen(false); }}>
                <Text style={styles.mobileDropdownBtnText}>Acessar</Text>
              </Pressable>
            </View>
          )}

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
      </SafeAreaView>
    );
  }

  if (screen === 'suporte') {
    return (
      <SafeAreaView style={styles.homeSafeArea}>
        <ScrollView style={styles.homeContainer} contentContainerStyle={styles.scrollContentContainer} showsVerticalScrollIndicator={false}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <View style={[styles.navbar, isMobile && styles.navbarMobile]}>
            <View style={styles.logoArea} />
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
            {isMobile ? (
              <Pressable onPress={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ padding: 6 }}>
                <Ionicons name={mobileMenuOpen ? 'close' : 'menu'} size={24} color="#0f172a" />
              </Pressable>
            ) : (
              <Pressable style={({ hovered }: any) => [styles.navAccessButton, hovered && styles.hoverOpacity]} onPress={() => setScreen('login')}>
                <Text style={styles.navAccessButtonText}>Acessar</Text>
              </Pressable>
            )}
          </View>

          {isMobile && mobileMenuOpen && (
            <View style={styles.mobileDropdownMenu}>
              <Pressable style={styles.mobileDropdownItem} onPress={() => { setScreen('recursos'); setMobileMenuOpen(false); }}>
                <Text style={styles.mobileDropdownText}>Recursos Premium</Text>
              </Pressable>
              <Pressable style={styles.mobileDropdownItem} onPress={() => { setScreen('precos'); setMobileMenuOpen(false); }}>
                <Text style={styles.mobileDropdownText}>Preços</Text>
              </Pressable>
              <Pressable style={styles.mobileDropdownItem} onPress={() => { setScreen('suporte'); setMobileMenuOpen(false); }}>
                <Text style={[styles.mobileDropdownText, { color: '#2563eb', fontWeight: '700' }]}>Suporte</Text>
              </Pressable>
              <Pressable style={styles.mobileDropdownItemBtn} onPress={() => { setScreen('login'); setMobileMenuOpen(false); }}>
                <Text style={styles.mobileDropdownBtnText}>Acessar</Text>
              </Pressable>
            </View>
          )}

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
      </SafeAreaView>
    );
  }

  if (screen === 'home') {
    return (
      <SafeAreaView style={styles.homeSafeArea}>
        <ScrollView style={styles.homeContainer} contentContainerStyle={styles.scrollContentContainer} showsVerticalScrollIndicator={false}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

          <View style={[styles.navbar, isMobile && styles.navbarMobile]}>
            <View style={styles.logoArea} />

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

            {isMobile ? (
              <Pressable onPress={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ padding: 6 }}>
                <Ionicons name={mobileMenuOpen ? 'close' : 'menu'} size={24} color="#0f172a" />
              </Pressable>
            ) : (
              <Pressable
                style={({ hovered }: any) => [styles.navAccessButton, hovered && styles.hoverOpacity]}
                onPress={() => setScreen('login')}
              >
                <Text style={styles.navAccessButtonText}>Acessar</Text>
              </Pressable>
            )}
          </View>

          {isMobile && mobileMenuOpen && (
            <View style={styles.mobileDropdownMenu}>
              <Pressable style={styles.mobileDropdownItem} onPress={() => { setScreen('recursos'); setMobileMenuOpen(false); }}>
                <Text style={styles.mobileDropdownText}>Recursos Premium</Text>
              </Pressable>
              <Pressable style={styles.mobileDropdownItem} onPress={() => { setScreen('precos'); setMobileMenuOpen(false); }}>
                <Text style={styles.mobileDropdownText}>Preços</Text>
              </Pressable>
              <Pressable style={styles.mobileDropdownItem} onPress={() => { setScreen('suporte'); setMobileMenuOpen(false); }}>
                <Text style={styles.mobileDropdownText}>Suporte</Text>
              </Pressable>
              <Pressable style={styles.mobileDropdownItemBtn} onPress={() => { setScreen('login'); setMobileMenuOpen(false); }}>
                <Text style={styles.mobileDropdownBtnText}>Acessar</Text>
              </Pressable>
            </View>
          )}

          <View style={[styles.hero, isMobile && styles.heroMobile]}>
            <View style={[styles.heroLeft, isMobile && styles.heroLeftMobile]}>
              <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
                Todos os recursos.{'\n'}Um só acesso.
              </Text>
              <Text style={[styles.heroDescription, isMobile && styles.heroDescriptionMobile]}>
                Encontre um mundo de recursos criativos, ferramentas premium e muito mais, em um só lugar.
              </Text>

              <Pressable
                style={({ hovered }: any) => [
                  styles.heroCtaButton,
                  isMobile && styles.heroCtaButtonMobile,
                  hovered && styles.hoverOpacity,
                ]}
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
      </SafeAreaView>
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
            style={{ width: 160, height: 60, tintColor: '#2563eb', marginBottom: 15 }}
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
  homeSafeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 24,
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
    height: 60,
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
  mobileDropdownMenu: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  mobileDropdownItem: {
    paddingVertical: 8,
  },
  mobileDropdownText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },
  mobileDropdownItemBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  mobileDropdownBtnText: {
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 20,
  },
  heroLeft: {
    flex: 1,
    maxWidth: 600,
  },
  heroLeftMobile: {
    maxWidth: '100%',
    alignItems: 'flex-start',
    textAlign: 'left',
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
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'left',
  },
  heroDescription: {
    fontSize: 18,
    lineHeight: 28,
    color: '#475569',
    marginBottom: 30,
  },
  heroDescriptionMobile: {
    textAlign: 'left',
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
  heroCtaButtonMobile: {
    alignSelf: 'flex-start',
    width: 'auto',
    paddingHorizontal: 22,
    height: 44,
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
    paddingBottom: 20,
  },
  platformsSectionMobile: {
    paddingHorizontal: 16,
    paddingBottom: 10,
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
    minHeight: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loginBackButton: {
    position: 'absolute',
    top: 20,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
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
    padding: 24,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  loginHeaderArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginTitleModern: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  loginSubtitleModern: {
    fontSize: 13,
    color: '#64748b',
  },
  formModern: {
    width: '100%',
  },
  inputContainerModern: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
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
    height: 50,
    marginTop: 6,
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
    minHeight: 0,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  dashboardContainerMobile: {
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  },
  sidebar: {
    width: 270,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'column',
  },
  sidebarMobile: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  sidebarUserWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  sidebarUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  userName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  balanceCardMobile: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 0,
    height: 36,
  },
  balanceIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d4ed8',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e40af',
  },
  balanceValueMobile: {
    fontSize: 13,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
    gap: 10,
  },
  menuIconContainer: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemActive: {
    backgroundColor: '#f1f5f9',
  },
  menuItemText: {
    fontSize: 13,
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
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 'auto',
  },
  sidebarLogoutText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
  },
  dashboardMain: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#ffffff',
  },
  dashboardMainContent: {
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 20,
    width: '100%',
  },
  dashboardMainContentMobile: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexGrow: 1,
  },
  dashboardHeaderArea: {
    marginBottom: 16,
  },
  instructionsTopText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '400',
  },
  urlInput: {
    width: '100%',
    height: 180,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    padding: 14,
    fontSize: 14,
    color: '#0f172a',
    outlineStyle: 'none' as any,
    marginBottom: 16,
  },
  getFilesButton: {
    height: 48,
    paddingHorizontal: 24,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 24,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  getFilesButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
  platformsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    paddingBottom: 10,
  },
  platformRowItem: {
    width: '24%',
    minWidth: 200,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  platformNameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformLogoImage: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 8,
  },
  platformNameText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  platformCostBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  platformCostText: {
    fontSize: 11,
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
    marginBottom: 16,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  backButtonText: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
  },
  previewVerticalLayout: {
    flexDirection: 'column',
    gap: 16,
    width: '100%',
  },
  previewFileCard: {
    width: 280,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  previewCardImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f8fafc',
  },
  previewCardInfo: {
    padding: 12,
  },
  previewCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  previewSourceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  previewIdSub: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748b',
  },
  previewIdDetailText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10,
  },
  previewCardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewCostText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  confirmButtonSmall: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  confirmButtonSmallText: {
    fontSize: 12,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'lowercase',
    lineHeight: 13,
  },
  generatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  generatingText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },
  progressBarBg: {
    height: 5,
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
    borderRadius: 10,
    padding: 16,
  },
  summaryContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryPanelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  summaryPanelDetails: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  summaryPanelTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  summaryConfirmButtonCompact: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryConfirmButtonCompactText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  tierBarContainer: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tierBadge: {
    backgroundColor: '#f1f5f9',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    color: '#0f172a',
  },
  tierInfoText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
    marginLeft: 10,
  },
  tierProgressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tierProgressBarFill: {
    width: '0.3%',
    height: '100%',
    backgroundColor: '#2563eb',
  },
});