import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface HeaderProps {
  onMenuPress: () => void;
  userName?: string;
}

export const Header = ({ onMenuPress, userName }: HeaderProps) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.singleRow}>
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <Feather name="menu" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.userName}>{userName || 'User'}</Text>
        <View style={styles.rightIcons}>
          <Feather name="search" size={24} color="#000000" style={styles.iconSpacing} />
          <Feather name="bell" size={24} color="#1E73B8" style={styles.iconSpacing} />
          <Image
            source={{ uri: 'https://picsum.photos/40' }} // Placeholder for avatar
            style={styles.avatar}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  singleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 16,
  },
  userName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginRight: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
