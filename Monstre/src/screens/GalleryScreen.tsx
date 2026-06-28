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
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Share from 'react-native-share';
import { Theme } from '../styles/theme';
import { ShareIcon, DeleteIcon, PaintIcon, RefreshIcon, SparklesIcon } from '../components/Icons';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

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
        type: item.type === 'sticker' ? 'image/webp' : 'image/jpeg',
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
        <TouchableOpacity style={styles.refreshBtn} onPress={loadHistory} activeOpacity={0.7}>
          <RefreshIcon color={Theme.colors.primary} size={14} />
        </TouchableOpacity>
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
  refreshBtn: {
    padding: 8,
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderRadius: Theme.roundness.full,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100, // Espace navigation
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
});
