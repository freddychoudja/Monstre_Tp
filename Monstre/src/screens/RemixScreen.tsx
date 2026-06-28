import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../styles/theme';
import { API_URL } from '../config';
import {
  ImageIcon,
  FolderIcon,
  SparklesIcon,
  SaveIcon,
  ShareIcon,
  AlignTopIcon,
  AlignCenterIcon,
  AlignBottomIcon,
  GifIcon,
  CloseIcon
} from '../components/Icons';

const { width } = Dimensions.get('window');

interface RemixScreenProps {
  initialText?: string;
  initialImageUri?: string;
}

const REGIONS = ['CAMEROUN', "CÔTE D'IVOIRE", 'FRANCE', 'SÉNÉGAL'];

export const RemixScreen: React.FC<RemixScreenProps> = ({ initialText = '', initialImageUri = '' }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [memeText, setMemeText] = useState(initialText);
  const [fontSize, setFontSize] = useState(32);
  const [position, setPosition] = useState<'TOP' | 'CENTER' | 'BOTTOM'>('CENTER');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [selectedRegion, setSelectedRegion] = useState('CAMEROUN');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Sticker GIF State
  const [isStickerModalVisible, setIsStickerModalVisible] = useState(false);
  const [stickersList, setStickersList] = useState<any[]>([]);
  const [isLoadingStickers, setIsLoadingStickers] = useState(false);
  const [stickerSearchQuery, setStickerSearchQuery] = useState('');

  const base64Ref = useRef<string | null>(null);
  const mimeTypeRef = useRef<string>('image/jpeg');
  const viewShotRef = useRef<any>(null);

  useEffect(() => {
    if (initialText) {
      setMemeText(initialText.toUpperCase());
    }
  }, [initialText]);

  useEffect(() => {
    if (initialImageUri) {
      setSelectedImage(initialImageUri);
    }
  }, [initialImageUri]);

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage(asset.uri || null);
        if (asset.base64) {
          base64Ref.current = asset.base64;
          mimeTypeRef.current = asset.type || 'image/jpeg';
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir la galerie.');
    }
  };

  const handleGenerateAIImage = async () => {
    if (!memeText.trim()) {
      Alert.alert('Texte vide', 'Veuillez saisir du texte pour inspirer la génération d\'image.');
      return;
    }

    setIsGeneratingImage(true);
    try {
      // Call backend to generate image via Pollinations.ai
      const response = await axios.post(`${API_URL}/generate-meme-image`, {
        prompt: `A highly expressive background photo or illustration matching: ${memeText}, cinematic lighting, 8k, funny meme style, no text`
      });

      if (response.data && response.data.imageUrl) {
        setSelectedImage(response.data.imageUrl);
        base64Ref.current = null; // Generated from URL, not local upload
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'La génération d\'image IA a échoué.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAIPunchline = async () => {
    if (!selectedImage) {
      Alert.alert('Image manquante', 'Veuillez d\'abord importer ou générer une image.');
      return;
    }

    setIsLoading(true);
    try {
      let payload: any = { culture: selectedRegion };

      if (base64Ref.current) {
        payload.image = base64Ref.current;
        payload.mimeType = mimeTypeRef.current;
      } else {
        // Fallback or URL handling if image was AI generated (we can download and convert or just analyze prompt)
        Alert.alert('Analyse', 'L\'analyse d\'image fonctionne mieux avec des photos de votre galerie.');
        setIsLoading(false);
        return;
      }

      const response = await axios.post(`${API_URL}/status-remix`, payload);
      setMemeText(response.data.memeText.toUpperCase());
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'L\'IA n\'a pas pu analyser cette image.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveToHistory = async (capturedUri: string, type: 'meme' | 'sticker' = 'meme', text: string = memeText) => {
    try {
      const stored = await AsyncStorage.getItem('MONSTRE_MEME_HISTORY');
      const history = stored ? JSON.parse(stored) : [];
      const newItem = {
        id: Date.now().toString(),
        imageUri: capturedUri,
        memeText: text,
        date: new Date().toLocaleDateString('fr-FR'),
        type: type
      };
      history.push(newItem);
      await AsyncStorage.setItem('MONSTRE_MEME_HISTORY', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const handleSave = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (uri) {
        await saveToHistory(uri, 'meme');
        Alert.alert('Sauvegardé !', 'Meme ajouté à votre historique et galerie locale.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le meme.');
    }
  };

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (uri) {
        await saveToHistory(uri, 'meme');
        await Share.open({
          url: uri,
          type: 'image/jpeg',
          title: 'Mon Meme',
          message: 'Partagé depuis Vibrant Meme Engine !',
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Sticker GIF functions
  const openStickerModal = () => {
    setIsStickerModalVisible(true);
    // Use first 3 words of memeText as query seed
    const seed = memeText.split(' ').slice(0, 3).join(' ') || 'meme';
    setStickerSearchQuery(seed);
    searchStickers(seed);
  };

  const searchStickers = async (query: string) => {
    if (!query.trim()) return;
    setIsLoadingStickers(true);
    try {
      const response = await axios.get(`${API_URL}/giphy-stickers?q=${encodeURIComponent(query)}`);
      setStickersList(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingStickers(false);
    }
  };

  const handleSelectSticker = async (sticker: any) => {
    setIsStickerModalVisible(false);
    try {
      // Save to history automatically
      await saveToHistory(sticker.url, 'sticker', sticker.title || 'Sticker GIF');
      
      // Share sticker GIF
      await Share.open({
        url: sticker.url,
        type: 'image/gif',
        title: 'Sticker GIF',
        message: 'Regarde ce sticker !',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getJustifyContent = () => {
    if (position === 'TOP') return 'flex-start';
    if (position === 'BOTTOM') return 'flex-end';
    return 'center';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Region Selector */}
      <View style={styles.regionSection}>
        <Text style={styles.labelCaps}>ADAPTER L'HUMOUR IA</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionsScroll}>
          {REGIONS.map((region) => {
            const isSelected = region === selectedRegion;
            return (
              <TouchableOpacity
                key={region}
                style={[
                  styles.regionChip,
                  isSelected ? styles.regionChipSelected : styles.regionChipUnselected
                ]}
                onPress={() => setSelectedRegion(region)}
                activeOpacity={0.7}
              >
                <Text style={styles.regionChipText}>{region}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Canvas ViewShot (NO buttons inside it so they don't render on the output meme) */}
      <View style={styles.canvasContainer}>
        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
          <View style={styles.canvas}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={StyleSheet.absoluteFill} />
            ) : (
              <View style={styles.canvasPlaceholder}>
                <ImageIcon color={Theme.colors.primary} size={48} />
                <Text style={styles.placeholderText}>Sélectionnez ou générez une image</Text>
              </View>
            )}

            <View style={[styles.textOverlayContainer, { justifyContent: getJustifyContent() }]}>
              <TextInput
                style={[
                  styles.overlayText,
                  {
                    fontSize: fontSize,
                    color: textColor,
                    textShadowColor: '#000000',
                    textShadowOffset: { width: 2, height: 2 },
                    textShadowRadius: 6,
                  }
                ]}
                multiline
                value={memeText}
                onChangeText={setMemeText}
                placeholder="SAISISSEZ VOTRE TEXTE"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                textAlign="center"
              />
            </View>
          </View>
        </ViewShot>

        {/* Buttons overlay positioned absolutely OUTSIDE the ViewShot capture container */}
        <View style={styles.canvasActionsOverlay}>
          <TouchableOpacity style={styles.canvasFloatBtn} onPress={handlePickImage} activeOpacity={0.7}>
            <FolderIcon color="#FFFFFF" size={12} />
            <Text style={styles.canvasFloatBtnText}>Galerie</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.canvasFloatBtn} onPress={handleGenerateAIImage} activeOpacity={0.7}>
            {isGeneratingImage ? (
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            ) : (
              <>
                <SparklesIcon color={Theme.colors.primary} size={12} />
                <Text style={styles.canvasFloatBtnText}>Générer IA</Text>
              </>
            )}
          </TouchableOpacity>

          {selectedImage && base64Ref.current && (
            <TouchableOpacity style={[styles.canvasFloatBtn, styles.accentFloatBtn]} onPress={handleAIPunchline} activeOpacity={0.7}>
              {isLoading ? (
                <ActivityIndicator size="small" color={Theme.colors.onPrimary} />
              ) : (
                <>
                  <SparklesIcon color={Theme.colors.onPrimary} size={12} />
                  <Text style={styles.canvasFloatBtnTextAccent}>IA Punchline</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Text Size Control */}
      <View style={styles.controlRow}>
        <View style={styles.controlHeader}>
          <Text style={styles.labelCaps}>Taille du texte</Text>
          <Text style={styles.controlValue}>{fontSize}px</Text>
        </View>
        <View style={styles.sliderContainer}>
          <TouchableOpacity
            style={styles.stepButton}
            onPress={() => setFontSize(prev => Math.max(12, prev - 4))}
          >
            <Text style={styles.stepText}>-</Text>
          </TouchableOpacity>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${((fontSize - 12) / 60) * 100}%` }]} />
          </View>
          <TouchableOpacity
            style={styles.stepButton}
            onPress={() => setFontSize(prev => Math.min(72, prev + 4))}
          >
            <Text style={styles.stepText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Position and Color Controls */}
      <View style={styles.controlsGrid}>
        {/* Position */}
        <View style={styles.gridCol}>
          <Text style={styles.labelCaps}>Position</Text>
          <View style={styles.positionSelector}>
            {(['TOP', 'CENTER', 'BOTTOM'] as const).map((pos) => {
              const isSelected = pos === position;
              return (
                <TouchableOpacity
                  key={pos}
                  style={[
                    styles.posBtn,
                    isSelected && styles.posBtnSelected
                  ]}
                  onPress={() => setPosition(pos)}
                >
                  <View style={{ height: 20, justifyContent: 'center', alignItems: 'center' }}>
                    {pos === 'TOP' && <AlignTopIcon color={isSelected ? '#FFFFFF' : Theme.colors.secondary} size={16} />}
                    {pos === 'CENTER' && <AlignCenterIcon color={isSelected ? '#FFFFFF' : Theme.colors.secondary} size={16} />}
                    {pos === 'BOTTOM' && <AlignBottomIcon color={isSelected ? '#FFFFFF' : Theme.colors.secondary} size={16} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Text Color */}
        <View style={styles.gridCol}>
          <Text style={styles.labelCaps}>Couleur</Text>
          <View style={styles.colorSelector}>
            {['#FFFFFF', '#000000', '#FACC15'].map((color) => {
              const isSelected = color === textColor;
              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    isSelected && styles.colorSwatchSelected
                  ]}
                  onPress={() => setTextColor(color)}
                />
              );
            })}
          </View>
        </View>
      </View>

      {/* Stickers GIF Trigger */}
      <TouchableOpacity style={styles.stickerTriggerBtn} onPress={openStickerModal} activeOpacity={0.8}>
        <GifIcon color={Theme.colors.primary} size={16} />
        <Text style={styles.stickerTriggerBtnText}>TROUVER DES STICKERS ANIMÉS (GIF)</Text>
      </TouchableOpacity>

      {/* Save and Share Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSave}>
          <SaveIcon color={Theme.colors.primary} size={14} />
          <Text style={styles.secondaryBtnText}>SAUVEGARDER</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleShare}>
          <ShareIcon color={Theme.colors.onPrimary} size={14} />
          <Text style={styles.primaryBtnText}>PARTAGER</Text>
        </TouchableOpacity>
      </View>

      {/* Sticker Giphy Search Modal */}
      <Modal
        visible={isStickerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsStickerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>STICKERS ANIMÉS (GIF)</Text>
              <TouchableOpacity onPress={() => setIsStickerModalVisible(false)} style={styles.modalCloseBtn}>
                <CloseIcon color="#FFFFFF" size={16} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchRow}>
              <TextInput
                style={styles.modalSearchInput}
                value={stickerSearchQuery}
                onChangeText={setStickerSearchQuery}
                placeholder="Rechercher des stickers..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                onSubmitEditing={() => searchStickers(stickerSearchQuery)}
              />
              <TouchableOpacity style={styles.modalSearchBtn} onPress={() => searchStickers(stickerSearchQuery)}>
                <Text style={styles.modalSearchBtnText}>OK</Text>
              </TouchableOpacity>
            </View>

            {isLoadingStickers ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
              </View>
            ) : (
              <FlatList
                data={stickersList}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.stickersGrid}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.stickerCard}
                    onPress={() => handleSelectSticker(item)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: item.url }} style={styles.stickerImage} resizeMode="contain" />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.stickersEmpty}>
                    <Text style={styles.stickersEmptyText}>Aucun sticker trouvé. Essayez une autre recherche.</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingTop: Theme.spacing.stackLg,
    paddingBottom: 100,
    gap: Theme.spacing.stackLg,
  },
  regionSection: {
    gap: Theme.spacing.stackSm,
  },
  labelCaps: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 12,
    color: Theme.colors.secondary,
    letterSpacing: 1.2,
    opacity: 0.6,
  },
  regionsScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  regionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Theme.roundness.default,
    marginRight: 8,
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  regionChipSelected: {
    backgroundColor: Theme.colors.primaryContainer,
  },
  regionChipUnselected: {},
  regionChipText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 1.1,
  },
  canvasContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: Theme.roundness.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  canvas: {
    width: '100%',
    height: '100%',
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderRadius: Theme.roundness.xl,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    overflow: 'hidden',
  },
  canvasPlaceholder: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  placeholderText: {
    fontFamily: Theme.fonts.body.fontFamily,
    fontSize: 14,
    color: Theme.colors.secondary,
    opacity: 0.6,
  },
  textOverlayContainer: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: 24,
    paddingVertical: 32,
    zIndex: 10,
  },
  overlayText: {
    fontFamily: Theme.fonts.display.fontFamily,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  canvasActionsOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    zIndex: 30,
  },
  canvasFloatBtn: {
    backgroundColor: 'rgba(21, 32, 49, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.roundness.full,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accentFloatBtn: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
    marginLeft: 'auto',
  },
  canvasFloatBtnText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 9,
    color: '#FFFFFF',
  },
  canvasFloatBtnTextAccent: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 9,
    color: Theme.colors.onPrimary,
  },
  controlRow: {
    gap: Theme.spacing.base,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlValue: {
    fontFamily: Theme.fonts.body.fontFamily,
    fontSize: 14,
    color: Theme.colors.onSurface,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  stepText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: 3,
  },
  controlsGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.gutter,
  },
  gridCol: {
    flex: 1,
    gap: Theme.spacing.stackSm,
  },
  positionSelector: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    borderRadius: Theme.roundness.default,
    padding: 4,
  },
  posBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Theme.roundness.sm,
  },
  posBtnSelected: {
    backgroundColor: Theme.colors.secondaryContainer,
  },
  colorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  colorSwatchSelected: {
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  stickerTriggerBtn: {
    width: '100%',
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    paddingVertical: 14,
    borderRadius: Theme.roundness.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  stickerTriggerBtnText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 11,
    color: Theme.colors.primary,
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Theme.spacing.gutter,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.roundness.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 13,
    color: Theme.colors.primary,
    letterSpacing: 1,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.roundness.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 13,
    color: Theme.colors.onPrimary,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderTopLeftRadius: Theme.roundness.xl,
    borderTopRightRadius: Theme.roundness.xl,
    minHeight: 480,
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '900',
    fontSize: 16,
    color: Theme.colors.primary,
    letterSpacing: 1,
  },
  modalCloseBtn: {
    padding: 8,
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderRadius: Theme.roundness.full,
  },
  modalSearchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modalSearchInput: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    borderRadius: Theme.roundness.default,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    height: 48,
  },
  modalSearchBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.roundness.default,
    height: 48,
  },
  modalSearchBtnText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    color: Theme.colors.onPrimary,
  },
  modalLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickersGrid: {
    paddingBottom: 20,
  },
  stickerCard: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderRadius: Theme.roundness.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  stickersEmpty: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  stickersEmptyText: {
    fontFamily: Theme.fonts.body.fontFamily,
    color: Theme.colors.secondary,
    textAlign: 'center',
  },
});
