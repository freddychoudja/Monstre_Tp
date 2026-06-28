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
  Platform
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import axios from 'axios';
import { Theme } from '../styles/theme';
import { API_URL } from '../config';
import { ImageIcon, FolderIcon, SparklesIcon, SaveIcon, ShareIcon, AlignTopIcon, AlignCenterIcon, AlignBottomIcon } from '../components/Icons';

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

  const base64Ref = useRef<string | null>(null);
  const mimeTypeRef = useRef<string>('image/jpeg');
  const viewShotRef = useRef<any>(null);

  // Écouter les changements de props initialText et initialImageUri
  useEffect(() => {
    if (initialText) {
      setMemeText(initialText.toUpperCase());
    }
  }, [initialText]);

  useEffect(() => {
    if (initialImageUri) {
      setSelectedImage(initialImageUri);
      // Si c'est une URI locale partagée, nous pourrons la lire.
      // Note: pour le share intent, on peut aussi l'analyser.
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
      Alert.alert('Erreur', 'Impossible d\'ouvrir la galerie de photos.');
    }
  };

  const handleAIPunchline = async () => {
    if (!selectedImage || !base64Ref.current) {
      Alert.alert('Image manquante', 'Veuillez d\'abord importer une image de votre galerie.');
      return;
    }

    setIsLoading(true);

    try {
      console.log("Appel de la vision IA...");
      const response = await axios.post(`${API_URL}/status-remix`, {
        image: base64Ref.current,
        mimeType: mimeTypeRef.current,
        culture: selectedRegion
      });

      setMemeText(response.data.memeText.toUpperCase());
      Alert.alert('Génération réussie', `Texte suggéré avec humour (${selectedRegion}) : \n"${response.data.memeText}"`);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'L\'IA n\'a pas pu analyser cette image. Vérifiez que le backend fonctionne.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (uri) {
        Alert.alert('Sauvegardé !', `Meme sauvegardé dans le cache temporaire :\n${uri}\n\nVous pouvez le partager sur WhatsApp pour l'enregistrer.`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible d\'exporter l\'image du meme.');
    }
  };

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (uri) {
        await Share.open({
          url: uri,
          type: 'image/jpeg',
          title: 'Mon Meme',
          message: 'Généré avec Vibrant Meme Engine !',
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Ajustement de la disposition verticale du texte
  const getJustifyContent = () => {
    if (position === 'TOP') return 'flex-start';
    if (position === 'BOTTOM') return 'flex-end';
    return 'center';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Region selector for AI punchline */}
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

      {/* Canvas ViewShot */}
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
        <View style={styles.canvas}>
          {/* Background Image / Placeholder */}
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={styles.canvasPlaceholder}>
              <ImageIcon color={Theme.colors.primary} size={48} />
              <Text style={styles.placeholderText}>Sélectionnez une image</Text>
            </View>
          )}

          {/* Editable Text Overlay */}
          <View style={[styles.textOverlayContainer, { justifyContent: getJustifyContent() }]}>
            <TextInput
              style={[
                styles.overlayText,
                {
                  fontSize: fontSize,
                  color: textColor,
                  // Text Stroke effect for legibility on white backgrounds
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

          {/* Canvas Buttons Overlay */}
          <TouchableOpacity style={[styles.canvasBtnLeft, { flexDirection: 'row', alignItems: 'center', gap: 6 }]} onPress={handlePickImage} activeOpacity={0.7}>
            <FolderIcon color="#FFFFFF" size={12} />
            <Text style={styles.canvasBtnText}>Galerie</Text>
          </TouchableOpacity>

          {selectedImage && (
            <TouchableOpacity style={[styles.canvasBtnRight, { flexDirection: 'row', alignItems: 'center', gap: 6 }]} onPress={handleAIPunchline} activeOpacity={0.7}>
              {isLoading ? (
                <ActivityIndicator size="small" color={Theme.colors.onPrimary} />
              ) : (
                <>
                  <SparklesIcon color={Theme.colors.onPrimary} size={12} />
                  <Text style={styles.canvasBtnTextRight}>IA Punchline</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ViewShot>

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
    paddingBottom: 80,
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
  canvas: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderRadius: Theme.roundness.xl,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  canvasPlaceholder: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  placeholderIcon: {
    fontSize: 64,
    opacity: 0.4,
  },
  placeholderText: {
    fontFamily: Theme.fonts.body.fontFamily,
    fontSize: 16,
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
  canvasBtnLeft: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(21, 32, 49, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Theme.roundness.full,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    zIndex: 20,
  },
  canvasBtnRight: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Theme.roundness.full,
    zIndex: 20,
  },
  canvasBtnText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 10,
    color: '#FFFFFF',
  },
  canvasBtnTextRight: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 10,
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
  posBtnText: {
    fontSize: 16,
  },
  posBtnTextSelected: {
    color: '#FFFFFF',
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
  btnIcon: {
    fontSize: 14,
  },
});
