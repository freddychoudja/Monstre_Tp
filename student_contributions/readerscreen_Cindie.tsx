import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Clipboard,
  Alert
} from 'react-native';
import axios from 'axios';
import { Theme } from '../styles/theme';
import { API_URL } from '../config';
import { SparklesIcon, CopyIcon, RefreshIcon, PaintIcon } from '../components/Icons';

interface ReaderScreenProps {
  initialText?: string;
  onSendToRemix: (text: string, imageUri?: string) => void;
}

const REGIONS = ['CAMEROUN', "CÔTE D'IVOIRE", 'FRANCE', 'SÉNÉGAL'];

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ initialText = '', onSendToRemix }) => {
  const [inputText, setInputText] = useState(initialText);
  const [selectedRegion, setSelectedRegion] = useState('CAMEROUN');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [memeResult, setMemeResult] = useState<{
    memeText: string;
    situation: string;
    culturalExplanation: string;
    imagePrompt?: string;
  } | null>(null);

  const [isFocused, setIsFocused] = useState(false);

  React.useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
  }, [initialText]);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir ou coller un extrait de discussion.');
      return;
    }

    setIsLoading(true);
    setMemeResult(null);

    try {
      // Contacter l'hôte via l'URL de configuration
      const response = await axios.post(`${API_URL}/analyze-context`, {
        text: inputText,
        culture: selectedRegion
      });
      setMemeResult(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', "Impossible de contacter le serveur d'IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToRemix = async () => {
    if (!memeResult) return;

    setIsGeneratingImage(true);
    try {
      console.log("Appel de la génération automatique d'image avec le prompt :", memeResult.imagePrompt);
      const response = await axios.post(`${API_URL}/generate-meme-image`, {
        prompt: memeResult.imagePrompt || `A highly expressive funny background matching: ${memeResult.memeText}, no text`
      });

      const imageUrl = response.data?.imageUrl;
      onSendToRemix(memeResult.memeText, imageUrl);
    } catch (error) {
      console.error("Erreur de pré-génération d'image:", error);
      // En cas d'échec de la génération, on bascule sur l'éditeur avec le texte seul
      onSendToRemix(memeResult.memeText);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopy = () => {
    if (memeResult) {
      Clipboard.setString(memeResult.memeText);
      Alert.alert('Succès', 'Texte du meme copié dans le presse-papiers.');
    }
  };

  const handleReset = () => {
    setMemeResult(null);
    setInputText('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!isLoading && !memeResult && (
        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.labelCaps}>SOURCE DE CONTEXTE</Text>
            <TextInput
              style={[
                styles.textArea,
                isFocused && styles.textAreaFocus
              ]}
              multiline
              numberOfLines={6}
              placeholder="Collez ou tapez une discussion ici..."
              placeholderTextColor="rgba(216, 227, 251, 0.3)"
              value={inputText}
              onChangeText={setInputText}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.regionContainer}>
            <Text style={styles.labelCaps}>RÉGION & CULTURE</Text>
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
                    <Text
                      style={[
                        styles.regionChipText,
                        isSelected ? styles.regionChipTextSelected : styles.regionChipTextUnselected
                      ]}
                    >
                      {region}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleGenerate} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>GÉNÉRER LE MEME</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingSection}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>ANALYSE DU CONTEXTE...</Text>
        </View>
      )}

      {!isLoading && memeResult && (
        <View style={styles.resultSection}>
          {/* Main Meme Card */}
          <View style={styles.memeCard}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>PUNCHLINE</Text>
            </View>
            <View style={styles.punchlineContent}>
              <Text style={styles.punchlineText}>
                "{memeResult.memeText.toUpperCase()}"
              </Text>
            </View>
            <View style={styles.memeCardFooter}>
              <Text style={styles.footerTag}>#{selectedRegion.replace(/\s+/g, '')}Humor</Text>
              <Text style={styles.confidenceText}>CONFIANCE IA: 98%</Text>
            </View>
          </View>

          {/* Cultural Context Block */}
          <View style={styles.culturalCard}>
            <View style={styles.culturalHeader}>
              <SparklesIcon color={Theme.colors.primary} size={16} />
              <Text style={styles.culturalTitle}>ANALYSE CULTURELLE</Text>
            </View>
            <Text style={styles.culturalText}>
              {memeResult.culturalExplanation}
            </Text>
          </View>

          {/* Action Cluster */}
          <View style={styles.actionCluster}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleCopy} activeOpacity={0.7}>
              <CopyIcon color="#FFFFFF" size={16} />
              <Text style={styles.actionBtnText}>COPIER LE TEXTE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleReset} activeOpacity={0.7}>
              <RefreshIcon color="#FFFFFF" size={16} />
              <Text style={styles.actionBtnText}>RÉGÉNÉRER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryContainerButton}
              onPress={handleSendToRemix}
              activeOpacity={0.7}
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? (
                <ActivityIndicator size="small" color={Theme.colors.onPrimaryContainer} />
              ) : (
                <PaintIcon color={Theme.colors.onPrimaryContainer} size={16} />
              )}
              <Text style={styles.primaryContainerBtnText}>
                {isGeneratingImage ? "GÉNÉRATION..." : "CRÉER L'IMAGE"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    paddingBottom: 80, // Espace pour le BottomNavBar
  },
  inputSection: {
    gap: Theme.spacing.stackLg,
  },
  inputContainer: {
    gap: 8,
  },
  labelCaps: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 12,
    color: Theme.colors.secondary,
    letterSpacing: 1.2,
    opacity: 0.6,
  },
  textArea: {
    width: '100%',
    height: 180,
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
    borderRadius: Theme.roundness.xl,
    padding: 16,
    fontFamily: Theme.fonts.body.fontFamily,
    fontSize: 16,
    color: Theme.colors.onSurface,
  },
  textAreaFocus: {
    borderColor: Theme.colors.primaryContainer,
    borderWidth: 1.5,
  },
  regionContainer: {
    gap: 12,
  },
  regionsScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  regionChip: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: Theme.roundness.full,
    marginRight: 8,
  },
  regionChipSelected: {
    backgroundColor: Theme.colors.primaryContainer,
  },
  regionChipUnselected: {
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  regionChipText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1.1,
  },
  regionChipTextSelected: {
    color: Theme.colors.onPrimaryContainer,
  },
  regionChipTextUnselected: {
    color: Theme.colors.secondary,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: Theme.colors.primaryContainer,
    paddingVertical: 18,
    borderRadius: Theme.roundness.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '900',
    fontSize: 14,
    color: Theme.colors.onPrimaryContainer,
    letterSpacing: 1.5,
  },
  loadingSection: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  loadingText: {
    fontFamily: Theme.fonts.heading.fontFamily,
    fontWeight: '700',
    fontSize: 18,
    color: Theme.colors.primary,
  },
  resultSection: {
    gap: Theme.spacing.stackLg,
  },
  memeCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    borderRadius: Theme.roundness.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Theme.roundness.sm,
  },
  badgeText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 10,
    color: Theme.colors.onPrimary,
    letterSpacing: 1,
  },
  punchlineContent: {
    paddingVertical: 64,
    paddingHorizontal: 24,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  punchlineText: {
    fontFamily: Theme.fonts.display.fontFamily,
    fontWeight: '900',
    fontSize: 26,
    fontStyle: 'italic',
    color: Theme.colors.onSurface,
    textAlign: 'center',
    lineHeight: 36,
  },
  memeCardFooter: {
    padding: 16,
    backgroundColor: 'rgba(42, 53, 72, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerTag: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 11,
    color: Theme.colors.primary,
    letterSpacing: 1.1,
  },
  confidenceText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 10,
    color: Theme.colors.secondary,
    opacity: 0.6,
  },
  culturalCard: {
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
    borderRadius: Theme.roundness.xl,
    padding: 24,
    gap: 16,
  },
  culturalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sparkIcon: {
    fontSize: 16,
    color: Theme.colors.primary,
  },
  culturalTitle: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 12,
    color: Theme.colors.onSurface,
    letterSpacing: 1.2,
  },
  culturalText: {
    fontFamily: Theme.fonts.body.fontFamily,
    fontSize: 15,
    color: Theme.colors.secondary,
    lineHeight: 22,
  },
  actionCluster: {
    gap: Theme.spacing.stackSm,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: 'rgba(51, 65, 85, 0.3)',
    paddingVertical: 14,
    borderRadius: Theme.roundness.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionBtnText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  primaryContainerButton: {
    width: '100%',
    backgroundColor: Theme.colors.primaryContainer,
    paddingVertical: 14,
    borderRadius: Theme.roundness.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryContainerBtnText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '900',
    fontSize: 12,
    color: Theme.colors.onPrimaryContainer,
    letterSpacing: 1.2,
  },
});
