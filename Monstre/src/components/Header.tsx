import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Theme } from '../styles/theme';
import { GlobeIcon } from './Icons';

export const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.brandContainer}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKyil6X0dQ9g7d0O9B6FSY_m2Os5DUgq6uYxv_vcX43sFm2-gZbPEwMfEeVDpgzAfai4PsnQ7D5JslXGApc5-4zgGpC12miBEsRqBSfCkNPv1JlbS9Bh3e8UvvKo37pwP2w_z-vI2qX9Gc0nfzWzJEHz3b3THz2cMYQvTFJX6sI-2j0yqpJ_MhyGjynPNLLcoiKin5ZMJPuLLcIRs3zyj3wZAFsyV1kVkVseDUb2U-PPe-hnEWkbUdXzKsFdp8qkTlCOI99qAPN5dp' }}
            style={styles.profileImage}
          />
        </View>
        <Text style={styles.title}>Vibrant Meme Engine</Text>
      </View>
      <TouchableOpacity style={styles.langButton} activeOpacity={0.7}>
        <GlobeIcon color={Theme.colors.primary} size={20} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: 'rgba(8, 20, 37, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.marginMobile,
    zIndex: 50,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  title: {
    fontFamily: Theme.fonts.display.fontFamily,
    fontWeight: '900',
    fontSize: 18,
    color: Theme.colors.primary,
    letterSpacing: -0.5,
  },
  langButton: {
    padding: 6,
  },
  langIcon: {
    fontSize: 20,
    color: Theme.colors.primary,
  },
});
