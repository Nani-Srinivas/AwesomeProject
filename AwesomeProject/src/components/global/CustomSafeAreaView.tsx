import { View, StyleSheet, ViewStyle } from 'react-native';
import React, { FC, ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../utils/Constants';

interface CustomSafeAreaViewProps {
    children: ReactNode;
    style?: ViewStyle;
}

const CustomSafeAreaView: FC<CustomSafeAreaViewProps> = ({ children, style }) => {
    return (
        <SafeAreaView style={[styles.container, style]}>
            <View style={[styles.container, style]}>{children}</View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
});

export default CustomSafeAreaView;

