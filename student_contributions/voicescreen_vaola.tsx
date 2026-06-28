import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Clipboard,
  Alert,
  PermissionsAndroid,
  Platform
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import axios from 'axios';
import { Theme } from '../styles/theme';
import { API_URL } from '../config';
import { MicIcon, PlayIcon, PauseIcon, DeleteIcon, CopyIcon, ShareIcon, PaintIcon } from '../components/Icons';

interface VoiceScreenProps {
  onSendToRemix: (text: string) => void;
}

const REGIONS = ['FRANCE', 'QUÉBEC', 'BELGIQUE', 'SÉNÉGAL'];

export const VoiceScreen: React.FC<VoiceScreenProps> = ({ onSendToRemix }) => {
  const [selectedRegion, setSelectedRegion] = useState('FRANCE');
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState('00:00');
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [memeResult, setMemeResult] = useState<{
    transcript: string;
    memeText: string;
    situation: string;
    culturalExplanation: string;
    imagePrompt?: string;
  } | null>(null);

  // Waveform bars simulation heights [ignoring loop detection]
  const [waveHeights, setWaveHeights] = useState<number[]>([10, 20, 40, 15, 30, 10, 20, 40, 15, 30]);

  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const waveIntervalRef = useRef<any | null>(null);

  useEffect(() => {
    return () => {
      // Nettoyage au démontage
      audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.stopPlayer();
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    };
  }, []);

  // Simuler les animations d'ondes audio
  useEffect(() => {
    if (isRecording) {
      waveIntervalRef.current = setInterval(() => {
        setWaveHeights(prev => prev.map(() => Math.floor(Math.random() * 32) + 8));
      }, 100);
    } else {
      if (waveIntervalRef.current) {
        clearInterval(waveIntervalRef.current);
        waveIntervalRef.current = null;
      }
      setWaveHeights([8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);
    }
  }, [isRecording]);

  const checkPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        if (
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          return true;
        } else {
          Alert.alert('Permission refusée', 'L\'autorisation du microphone est requise.');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startRecording = async () => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) return;

    try {
      setTimer('00:00');
      const uri = await audioRecorderPlayer.startRecorder();
      setIsRecording(true);
      setAudioPath(null);
      setMemeResult(null);

      audioRecorderPlayer.addRecordBackListener((e: any) => {
        const seconds = Math.floor(e.currentPosition / 1000);
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        setTimer(`${m}:${s}`);
      });
      console.log('Enregistrement démarré:', uri);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de démarrer le micro.');
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setAudioPath(result);
      console.log('Enregistrement arrêté:', result);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePlayPause = async () => {
    if (!audioPath) return;

    if (isPlaying) {
      await audioRecorderPlayer.stopPlayer();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await audioRecorderPlayer.startPlayer(audioPath);
      audioRecorderPlayer.addPlayBackListener((e: any) => {
        if (e.currentPosition === e.duration) {
          audioRecorderPlayer.stopPlayer();
          setIsPlaying(false);
        }
      });
    }
  };

  const handleDeleteAudio = () => {
    audioRecorderPlayer.stopPlayer();
    setIsPlaying(false);
    setAudioPath(null);
    setTimer('00:00');
  };

  const handleAnalyze = async () => {
    if (!audioPath) {
      Alert.alert('Erreur', 'Veuillez d\'abord enregistrer une note vocale.');
      return;
    }

    setIsLoading(true);
    setMemeResult(null);

    try {
      const formData = new FormData();
      
      // Nettoyer l'URI pour Android (enlever file:// si nécessaire, bien que Axios le supporte)
      const cleanUri = Platform.OS === 'android' && !audioPath.startsWith('file://') && !audioPath.startsWith('content://')
        ? `file://${audioPath}`
        : audioPath;

      formData.append('audio', {
        uri: cleanUri,
        type: 'audio/mp4', // Format par défaut sur Android
        name: 'voice.mp4',
      } as any);
      formData.append('culture', selectedRegion);

      const response = await axios.post(`${API_URL}/voice-to-meme`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMemeResult(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'L\'analyse audio a échoué. Assurez-vous que le backend tourne.');
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
      Alert.alert('Succès', 'Punchline copiée !');
    }
  };

  const handleShare = () => {
    if (memeResult) {
      Clipboard.setString(memeResult.memeText);
      Alert.alert('Partager', `Texte copié. Prêt à être partagé :\n"${memeResult.memeText}"`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Region Selector */}
      <View style={styles.selectorSection}>
        <Text style={styles.labelCaps}>SÉLECTION DE LA RÉGION</Text>
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

      {/* Recording Box */}
      <View style={styles.recordingArea}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{timer}</Text>
          <Text style={styles.statusText}>
            {isRecording ? 'ENREGISTREMENT EN COURS' : 'EN ATTENTE DU SIGNAL'}
          </Text>
        </View>

        {/* Mic Button with Glow */}
        <View style={styles.micButtonContainer}>
          {isRecording && <View style={styles.micGlow} />}
          <TouchableOpacity
            style={styles.micButton}
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.8}
          >
            {isRecording ? (
              <View style={{ width: 30, height: 30, backgroundColor: Theme.colors.onPrimary, borderRadius: 4 }} />
            ) : (
              <MicIcon color={Theme.colors.onPrimary} size={42} />
            )}
          </TouchableOpacity>
        </View>

        {/* Waveform Bars */}
        <View style={styles.waveformContainer}>
          {waveHeights.map((height, i) => (
            <View key={i} style={[styles.waveBar, { height: height }]} />
          ))}
        </View>
      </View>

      {/* Mini Audio Player */}
      {audioPath && (
        <View style={styles.audioPlaybackCard}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            {isPlaying ? (
              <PauseIcon color={Theme.colors.onPrimaryContainer} size={14} />
            ) : (
              <PlayIcon color={Theme.colors.onPrimaryContainer} size={14} />
            )}
          </TouchableOpacity>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: isPlaying ? '60%' : '10%' }]} />
          </View>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAudio}>
            <DeleteIcon color={Theme.colors.error} size={20} />
          </TouchableOpacity>
        </View>
      )}

      {/* Main CTA */}
      {!isLoading && (
        <TouchableOpacity
          style={[styles.analyzeButton, !audioPath && styles.analyzeButtonDisabled]}
          onPress={handleAnalyze}
          disabled={!audioPath}
          activeOpacity={0.8}
        >
          <Text style={styles.analyzeButtonText}>LANCER L'ANALYSE AUDIO</Text>
        </TouchableOpacity>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>TRANSCRIPTION ET ANALYSE IA EN COURS...</Text>
        </View>
      )}

      {/* Result Section */}
      {!isLoading && memeResult && (
        <View style={styles.resultSection}>
          <View style={styles.gridRow}>
            {/* Transcription Box */}
            <View style={styles.resultCard}>
              <Text style={styles.resultCardLabel}>TRANSCRIPTION</Text>
              <Text style={styles.transcriptionText}>
                "{memeResult.transcript}"
              </Text>
            </View>

            {/* Suggested Punchline */}
            <View style={[styles.resultCard, styles.punchlineCard]}>
              <Text style={styles.resultCardLabel}>PUNCHLINE SUGGÉRÉE</Text>
              <Text style={styles.punchlineText}>
                {memeResult.memeText.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Explanation Box */}
          {memeResult.culturalExplanation && (
            <View style={styles.explanationCard}>
              <Text style={styles.resultCardLabel}>ANALYSE DE L'HUMOUR ({selectedRegion})</Text>
              <Text style={styles.explanationText}>
                {memeResult.culturalExplanation}
              </Text>
            </View>
          )}

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
              <CopyIcon color="#FFFFFF" size={14} />
              <Text style={styles.actionBtnText}>COPIER</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <ShareIcon color="#FFFFFF" size={14} />
              <Text style={styles.actionBtnText}>PARTAGER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={handleSendToRemix}
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? (
                <ActivityIndicator size="small" color={Theme.colors.onPrimaryContainer} />
              ) : (
                <PaintIcon color={Theme.colors.onPrimaryContainer} size={14} />
              )}
              <Text style={styles.primaryActionBtnText}>
                {isGeneratingImage ? "GÉNÉRATION..." : "ÉDITEUR D'IMAGES"}
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
    paddingBottom: 80,
    gap: Theme.spacing.stackLg,
  },
  selectorSection: {
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Theme.roundness.default,
    marginRight: 8,
  },
  regionChipSelected: {
    backgroundColor: Theme.colors.primary,
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
    color: '#FFFFFF',
    letterSpacing: 1.1,
  },
  recordingArea: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    borderRadius: Theme.roundness.xl,
    padding: Theme.spacing.stackLg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
    gap: 24,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontFamily: Theme.fonts.display.fontFamily,
    fontWeight: '900',
    fontSize: 48,
    color: Theme.colors.onSurface,
  },
  statusText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 12,
    color: Theme.colors.secondary,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  micButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  micGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 180, 171, 0.15)',
  },
  micButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  micIconText: {
    fontSize: 40,
    color: Theme.colors.onPrimary,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    height: 48,
    width: '100%',
    maxWidth: 240,
  },
  waveBar: {
    width: 6,
    backgroundColor: Theme.colors.primary,
    borderRadius: 3,
    opacity: 0.7,
  },
  audioPlaybackCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    borderRadius: Theme.roundness.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconText: {
    fontSize: 16,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: 3,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIconText: {
    fontSize: 20,
  },
  analyzeButton: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.roundness.default,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  analyzeButtonDisabled: {
    opacity: 0.4,
  },
  analyzeButtonText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 13,
    color: Theme.colors.onPrimary,
    letterSpacing: 1.2,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: Theme.fonts.heading.fontFamily,
    fontWeight: '700',
    fontSize: 14,
    color: Theme.colors.primary,
    textAlign: 'center',
  },
  resultSection: {
    gap: Theme.spacing.stackMd,
  },
  gridRow: {
    flexDirection: 'column',
    gap: Theme.spacing.stackMd,
  },
  resultCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    borderRadius: Theme.roundness.xl,
    padding: Theme.spacing.stackMd,
    gap: 8,
  },
  punchlineCard: {
    borderColor: 'rgba(255, 188, 127, 0.3)',
  },
  resultCardLabel: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 10,
    color: Theme.colors.secondary,
    letterSpacing: 1,
    opacity: 0.6,
  },
  transcriptionText: {
    fontFamily: Theme.fonts.body.fontFamily,
    fontSize: 16,
    color: Theme.colors.onSurface,
    lineHeight: 24,
  },
  punchlineText: {
    fontFamily: Theme.fonts.display.fontFamily,
    fontWeight: '900',
    fontSize: 22,
    fontStyle: 'italic',
    color: Theme.colors.primary,
    lineHeight: 28,
  },
  explanationCard: {
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
    borderRadius: Theme.roundness.xl,
    padding: Theme.spacing.stackMd,
    gap: 8,
  },
  explanationText: {
    fontFamily: Theme.fonts.body.fontFamily,
    fontSize: 15,
    color: Theme.colors.secondary,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    minWidth: 100,
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
    paddingVertical: 14,
    borderRadius: Theme.roundness.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnIcon: {
    fontSize: 14,
  },
  actionBtnText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '800',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  primaryActionBtn: {
    width: '100%',
    backgroundColor: Theme.colors.primaryContainer,
    paddingVertical: 14,
    borderRadius: Theme.roundness.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionBtnText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '900',
    fontSize: 12,
    color: Theme.colors.onPrimaryContainer,
    letterSpacing: 1,
  },
});
