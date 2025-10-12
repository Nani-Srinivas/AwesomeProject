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
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onMenuPress}>
          <Feather name="menu" size={24} color="#000000" />
        </TouchableOpacity>
        <View style={styles.topRightIcons}>
          <Feather name="bell" size={24} color="#1E73B8" />
        </View>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.userName}>{userName || 'User'}</Text>
        <View style={styles.bottomRightIcons}>
            <Feather name="search" size={24} color="#000000" style={styles.searchIconMargin} />
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
        paddingBottom: 12,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topRightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    userName: {
        fontSize: 18,
        fontWeight: '500',
        color: '#000000',
    },
    bottomRightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    searchIconMargin: {
        marginRight: 12,
    },
});
