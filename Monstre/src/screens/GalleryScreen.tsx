import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Share from 'react-native-share';
import { Theme } from '../styles/theme';
import {
  ShareIcon,
  DeleteIcon,
  PaintIcon,
  RefreshIcon,
  SparklesIcon,
  GlobeIcon,
  CloseIcon
} from '../components/Icons';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

// Load contributors JSON
const CONTRIBUTORS = require('../data/contributors.json');

interface GalleryItem {
  id: string;
  imageUri: string;
  memeText: string;
  date: string;
  type: 'meme' | 'sticker';
}

interface GalleryScreenProps {
  onSendToRemix: (text: string, imageUri: string) => void;
  activeTab: string;
}

export const GalleryScreen: React.FC<GalleryScreenProps> = ({ onSendToRemix, activeTab }) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreditsVisible, setIsCreditsVisible] = useState(false);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem('MONSTRE_MEME_HISTORY');
      if (stored) {
        setItems(JSON.parse(stored).reverse()); // Newest first
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'gallery') {
      loadHistory();
    }
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous vraiment supprimer ce meme de votre historique ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = items.filter(item => item.id !== id);
              setItems(updated);
              // Reverse back to store chronologically
              await AsyncStorage.setItem('MONSTRE_MEME_HISTORY', JSON.stringify([...updated].reverse()));
            } catch (error) {
              console.error('Error deleting item:', error);
            }
          }
        }
      ]
    );
  };

  const handleShare = async (item: GalleryItem) => {
    try {
      await Share.open({
        url: item.imageUri,
        type: item.type === 'sticker' ? 'image/webp' : 'image/gif',
        title: 'Meme Partagé',
        message: 'Généré avec Vibrant Meme Engine !',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderItem = ({ item }: { item: GalleryItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUri }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardText} numberOfLines={2}>{item.memeText}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(item)}
          activeOpacity={0.7}
        >
          <ShareIcon color={Theme.colors.primary} size={14} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onSendToRemix(item.memeText, item.imageUri)}
          activeOpacity={0.7}
        >
          <PaintIcon color={Theme.colors.secondary} size={14} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id)}
          activeOpacity={0.7}
        >
          <DeleteIcon color={Theme.colors.error} size={14} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>MES CRÉATIONS</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setIsCreditsVisible(true)} activeOpacity={0.7}>
            <GlobeIcon color={Theme.colors.primary} size={14} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={loadHistory} activeOpacity={0.7}>
            <RefreshIcon color={Theme.colors.primary} size={14} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Chargement de la galerie...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <SparklesIcon color={Theme.colors.primary} size={48} />
          <Text style={styles.emptyTitle}>Galerie vide</Text>
          <Text style={styles.emptySubtitle}>
            Vos memes et stickers générés s'afficheront ici. Allez dans l'onglet "Reader" ou "Voice" pour créer vos premiers chefs-d'œuvre !
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Contributors Credits Modal */}
      <Modal
        visible={isCreditsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreditsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CONTRIBUTEURS DU PROJET</Text>
              <TouchableOpacity onPress={() => setIsCreditsVisible(false)} style={styles.modalCloseBtn}>
                <CloseIcon color="#FFFFFF" size={16} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Voici la liste des étudiants et développeurs ayant collaboré sur Vibrant Meme Engine :
            </Text>

            <FlatList
              data={CONTRIBUTORS}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.contributorsList}
              renderItem={({ item }) => (
                <View style={styles.contributorCard}>
                  <View style={styles.contributorAvatar}>
                    <Text style={styles.avatarText}>
                      {item.name ? item.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                    </Text>
                  </View>
                  <View style={styles.contributorInfo}>
                    <Text style={styles.contributorName}>{item.name}</Text>
                    <Text style={styles.contributorRole}>{item.role || 'Contributeur'}</Text>
                    {item.github && (
                      <Text style={styles.contributorGithub}>@{item.github}</Text>
                    )}
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContributors}>
                  <Text style={styles.emptyContributorsText}>Aucun contributeur répertorié pour l'instant.</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  title: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: '900',
    fontSize: 16,
    color: Theme.colors.onSurface,
    letterSpacing: 1.5,
  },
  headerBtn: {
    padding: 8,
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderRadius: Theme.roundness.full,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  card: {
    width: COLUMN_WIDTH,
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderRadius: Theme.roundness.lg,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    margin: 8,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: COLUMN_WIDTH * 1.25,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(8, 20, 37, 0.75)',
    padding: 8,
  },
  cardText: {
    fontFamily: Theme.fonts.display.fontFamily,
    fontWeight: '900',
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  cardActions: {
    flexDirection: 'row',
    height: 40,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.outlineVariant,
    backgroundColor: Theme.colors.surfaceContainerHigh,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Theme.colors.outlineVariant,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: Theme.fonts.body.fontFamily,
    fontSize: 14,
    color: Theme.colors.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyTitle: {
    fontFamily: Theme.fonts.heading.fontFamily,
    fontWeight: 'bold',
    fontSize: 20,
    color: Theme.colors.onSurface,
    marginTop: 8,
  },
  emptySubtitle: {
    fontFamily: Theme.fonts.body.fontFamily,
    fontSize: 14,
    color: Theme.colors.secondary,
    textAlign: 'center',
    lineHeight: 20,
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
    maxHeight: '80%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  modalSubtitle: {
    fontFamily: Theme.fonts.body.fontFamily,
    fontSize: 13,
    color: Theme.colors.secondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  contributorsList: {
    paddingBottom: 20,
  },
  contributorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    borderRadius: Theme.roundness.lg,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  contributorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  avatarText: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  contributorInfo: {
    flex: 1,
  },
  contributorName: {
    fontFamily: Theme.fonts.body.fontFamily,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  contributorRole: {
    fontFamily: Theme.fonts.body.fontFamily,
    fontSize: 11,
    color: Theme.colors.secondary,
    marginTop: 2,
  },
  contributorGithub: {
    fontFamily: Theme.fonts.label.fontFamily,
    fontSize: 11,
    color: Theme.colors.primary,
    marginTop: 2,
  },
  emptyContributors: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContributorsText: {
    fontFamily: Theme.fonts.body.fontFamily,
    color: Theme.colors.secondary,
  },
});
