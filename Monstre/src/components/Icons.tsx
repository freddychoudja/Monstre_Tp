import React from 'react';
import { View, StyleSheet } from 'react-native';

interface IconProps {
  color: string;
  size?: number;
}

export const DocumentIcon: React.FC<IconProps> = ({ color, size = 20 }) => (
  <View style={[styles.iconContainer, { width: size, height: size, borderWidth: 2, borderColor: color, borderRadius: 4, padding: 3 }]}>
    <View style={{ height: 2, backgroundColor: color, marginBottom: 2 }} />
    <View style={{ height: 2, backgroundColor: color, marginBottom: 2, width: '80%' }} />
    <View style={{ height: 2, backgroundColor: color, width: '50%' }} />
  </View>
);

export const MicIcon: React.FC<IconProps> = ({ color, size = 20 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.4, height: size * 0.6, borderRadius: size * 0.2, borderWidth: 2, borderColor: color }} />
    <View style={{
      width: size * 0.7,
      height: size * 0.3,
      borderBottomLeftRadius: size * 0.35,
      borderBottomRightRadius: size * 0.35,
      borderLeftWidth: 2,
      borderRightWidth: 2,
      borderBottomWidth: 2,
      borderColor: color,
      marginTop: -2,
    }} />
    <View style={{ width: 2, height: 3, backgroundColor: color }} />
    <View style={{ width: size * 0.4, height: 2, backgroundColor: color }} />
  </View>
);

export const EditIcon: React.FC<IconProps> = ({ color, size = 20 }) => (
  <View style={{ width: size, height: size, transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.3, height: size * 0.7, borderWidth: 2, borderColor: color, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
    <View style={{ width: size * 0.2, height: size * 0.2, backgroundColor: color, transform: [{ rotate: '45deg' }], marginTop: -2 }} />
  </View>
);

export const GlobeIcon: React.FC<IconProps> = ({ color, size = 20 }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.4, height: '100%', borderRadius: size * 0.2, borderWidth: 1.5, borderColor: color, borderTopWidth: 0, borderBottomWidth: 0 }} />
    <View style={{ width: '100%', height: size * 0.4, borderRadius: size * 0.2, borderWidth: 1.5, borderColor: color, borderLeftWidth: 0, borderRightWidth: 0, position: 'absolute' }} />
  </View>
);

export const CopyIcon: React.FC<IconProps> = ({ color, size = 16 }) => (
  <View style={{ width: size, height: size }}>
    <View style={{ width: size * 0.65, height: size * 0.65, borderWidth: 1.5, borderColor: color, borderRadius: 2, position: 'absolute', top: 0, left: 0 }} />
    <View style={{ width: size * 0.65, height: size * 0.65, borderWidth: 1.5, borderColor: color, borderRadius: 2, backgroundColor: '#152031', position: 'absolute', bottom: 0, right: 0 }} />
  </View>
);

export const RefreshIcon: React.FC<IconProps> = ({ color, size = 16 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{
      width: size * 0.8,
      height: size * 0.8,
      borderRadius: (size * 0.8) / 2,
      borderWidth: 1.5,
      borderColor: color,
      borderTopColor: 'transparent',
      transform: [{ rotate: '45deg' }]
    }} />
    <View style={{
      width: 0,
      height: 0,
      borderLeftWidth: 3,
      borderLeftColor: 'transparent',
      borderRightWidth: 3,
      borderRightColor: 'transparent',
      borderBottomWidth: 4,
      borderBottomColor: color,
      position: 'absolute',
      top: 1,
      right: 1,
      transform: [{ rotate: '35deg' }]
    }} />
  </View>
);

export const PaintIcon: React.FC<IconProps> = ({ color, size = 16 }) => (
  <View style={{ width: size, height: size, flexDirection: 'row', flexWrap: 'wrap', gap: 2, padding: 1 }}>
    <View style={{ width: size * 0.35, height: size * 0.35, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: size * 0.35, height: size * 0.35, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: size * 0.35, height: size * 0.35, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: size * 0.35, height: size * 0.35, borderWidth: 1.5, borderColor: color, borderRadius: 1 }} />
  </View>
);

export const PlayIcon: React.FC<IconProps> = ({ color, size = 16 }) => (
  <View style={{
    width: 0,
    height: 0,
    borderTopWidth: size * 0.375,
    borderTopColor: 'transparent',
    borderBottomWidth: size * 0.375,
    borderBottomColor: 'transparent',
    borderLeftWidth: size * 0.625,
    borderLeftColor: color,
    marginLeft: 2,
  }} />
);

export const PauseIcon: React.FC<IconProps> = ({ color, size = 16 }) => (
  <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
    <View style={{ width: 3, height: size * 0.75, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: 3, height: size * 0.75, backgroundColor: color, borderRadius: 1 }} />
  </View>
);

export const DeleteIcon: React.FC<IconProps> = ({ color, size = 18 }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
    <View style={{ width: size * 0.5, height: 2, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: size * 0.8, height: 2, backgroundColor: color, marginTop: 1 }} />
    <View style={{ width: size * 0.6, height: size * 0.55, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, borderWidth: 1.5, borderColor: color, borderTopWidth: 0, marginTop: 1 }} />
  </View>
);

export const SaveIcon: React.FC<IconProps> = ({ color, size = 16 }) => (
  <View style={{ width: size, height: size, borderWidth: 1.5, borderColor: color, borderRadius: 3, padding: 2, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.5, height: size * 0.25, backgroundColor: color, marginBottom: 2 }} />
    <View style={{ width: size * 0.4, height: size * 0.3, borderWidth: 1, borderColor: color }} />
  </View>
);

export const ShareIcon: React.FC<IconProps> = ({ color, size = 16 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.45, height: size * 0.45, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderRightWidth: 1.5, borderColor: color, borderTopLeftRadius: 1, borderTopRightRadius: 1 }} />
    <View style={{ width: 1.5, height: size * 0.4, backgroundColor: color, position: 'absolute', top: 1 }} />
    <View style={{
      width: 0,
      height: 0,
      borderLeftWidth: 3,
      borderLeftColor: 'transparent',
      borderRightWidth: 3,
      borderRightColor: 'transparent',
      borderBottomWidth: 3.5,
      borderBottomColor: color,
      position: 'absolute',
      top: 0
    }} />
    <View style={{ width: size * 0.8, height: size * 0.45, borderWidth: 1.5, borderColor: color, borderTopWidth: 0, borderRadius: 1, marginTop: -1 }} />
  </View>
);

export const FolderIcon: React.FC<IconProps> = ({ color, size = 16 }) => (
  <View style={{ width: size, height: size * 0.85, borderWidth: 1.5, borderColor: color, borderRadius: 3, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.4, height: 2, backgroundColor: color, position: 'absolute', top: -2, left: 1, borderTopLeftRadius: 1, borderTopRightRadius: 1 }} />
  </View>
);

export const SparklesIcon: React.FC<IconProps> = ({ color, size = 16 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.5, height: size * 0.5, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
    <View style={{ width: size * 0.25, height: size * 0.25, backgroundColor: color, position: 'absolute', top: 1, left: 1, transform: [{ rotate: '45deg' }] }} />
  </View>
);

export const ImageIcon: React.FC<IconProps> = ({ color, size = 48 }) => (
  <View style={{ width: size, height: size * 0.8, borderWidth: 3, borderColor: color, borderRadius: 6, padding: 3, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
    <View style={{ width: size * 0.16, height: size * 0.16, borderRadius: size * 0.08, backgroundColor: color, position: 'absolute', top: 4, left: 4 }} />
    <View style={{
      width: 0,
      height: 0,
      borderLeftWidth: size * 0.3,
      borderLeftColor: 'transparent',
      borderRightWidth: size * 0.3,
      borderRightColor: 'transparent',
      borderBottomWidth: size * 0.4,
      borderBottomColor: color,
      position: 'absolute',
      bottom: -1,
      right: 2
    }} />
  </View>
);

export const AlignTopIcon: React.FC<IconProps> = ({ color, size = 16 }) => (
  <View style={{ width: size, height: size, gap: 2 }}>
    <View style={{ width: size, height: 3, backgroundColor: color, borderRadius: 1.5 }} />
    <View style={{ width: size * 0.6, height: 2, backgroundColor: color, opacity: 0.5, borderRadius: 1, alignSelf: 'center' }} />
    <View style={{ width: size * 0.9, height: 2, backgroundColor: color, opacity: 0.5, borderRadius: 1, alignSelf: 'center' }} />
  </View>
);

export const AlignCenterIcon: React.FC<IconProps> = ({ color, size = 16 }) => (
  <View style={{ width: size, height: size, gap: 2, justifyContent: 'center' }}>
    <View style={{ width: size * 0.75, height: 2, backgroundColor: color, opacity: 0.5, borderRadius: 1, alignSelf: 'center' }} />
    <View style={{ width: size, height: 3, backgroundColor: color, borderRadius: 1.5 }} />
    <View style={{ width: size * 0.75, height: 2, backgroundColor: color, opacity: 0.5, borderRadius: 1, alignSelf: 'center' }} />
  </View>
);export const AlignBottomIcon: React.FC<IconProps> = ({ color, size = 16 }) => (
  <View style={{ width: size, height: size, gap: 2, justifyContent: 'flex-end' }}>
    <View style={{ width: size * 0.9, height: 2, backgroundColor: color, opacity: 0.5, borderRadius: 1, alignSelf: 'center' }} />
    <View style={{ width: size * 0.6, height: 2, backgroundColor: color, opacity: 0.5, borderRadius: 1, alignSelf: 'center' }} />
    <View style={{ width: size, height: 3, backgroundColor: color, borderRadius: 1.5 }} />
  </View>
);

export const HistoryIcon: React.FC<IconProps> = ({ color, size = 20 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.8, height: size * 0.8, borderRadius: (size * 0.8) / 2, borderWidth: 2, borderColor: color, borderLeftColor: 'transparent', transform: [{ rotate: '-45deg' }] }} />
    <View style={{ width: 1.5, height: size * 0.3, backgroundColor: color, position: 'absolute', top: size * 0.25 }} />
    <View style={{ width: size * 0.25, height: 1.5, backgroundColor: color, position: 'absolute', top: size * 0.5, left: size * 0.5 }} />
    <View style={{ width: 0, height: 0, borderLeftWidth: 3, borderLeftColor: 'transparent', borderRightWidth: 3, borderRightColor: 'transparent', borderBottomWidth: 4, borderBottomColor: color, position: 'absolute', top: 1, left: 1, transform: [{ rotate: '-45deg' }] }} />
  </View>
);

export const GifIcon: React.FC<IconProps> = ({ color, size = 20 }) => (
  <View style={{ width: size, height: size, borderWidth: 2, borderColor: color, borderRadius: 4, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      <View style={{ width: size * 0.2, height: size * 0.4, borderLeftWidth: 1.5, borderTopWidth: 1.5, borderBottomWidth: 1.5, borderColor: color }} />
      <View style={{ width: 1.5, height: size * 0.4, backgroundColor: color }} />
      <View style={{ width: size * 0.2, height: size * 0.4, borderLeftWidth: 1.5, borderTopWidth: 1.5, borderBottomWidth: 1.5, borderColor: color, transform: [{ rotate: '180deg' }] }} />
    </View>
  </View>
);

export const CloseIcon: React.FC<IconProps> = ({ color, size = 16 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size, height: 2, backgroundColor: color, transform: [{ rotate: '45deg' }], position: 'absolute' }} />
    <View style={{ width: size, height: 2, backgroundColor: color, transform: [{ rotate: '-45deg' }], position: 'absolute' }} />
  </View>
);

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});
