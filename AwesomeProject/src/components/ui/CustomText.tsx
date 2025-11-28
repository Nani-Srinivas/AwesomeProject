import { Text, TextStyle, StyleSheet } from 'react-native';
import React, { FC } from 'react';
import { Colors, Fonts } from '../../utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';

interface Props {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7' | 'h8' | 'h9' | 'body';
    fontFamily?: Fonts;
    fontSize?: number;
    style?: TextStyle | TextStyle[];
    children?: React.ReactNode;
    numberOfLines?: number;
    onLayout?: (event: any) => void;
}

const CustomText: FC<Props> = ({
    variant = 'body',
    fontFamily = Fonts.Regular,
    fontSize,
    style,
    children,
    numberOfLines,
    onLayout,
    ...props
}) => {
    let computedFontSize: number;

    switch (variant) {
        case 'h1':
            computedFontSize = RFValue(24);
            break;
        case 'h2':
            computedFontSize = RFValue(22);
            break;
        case 'h3':
            computedFontSize = RFValue(20);
            break;
        case 'h4':
            computedFontSize = RFValue(18);
            break;
        case 'h5':
            computedFontSize = RFValue(16);
            break;
        case 'h6':
            computedFontSize = RFValue(14);
            break;
        case 'h7':
            computedFontSize = RFValue(12);
            break;
        case 'h8':
            computedFontSize = RFValue(10);
            break;
        case 'h9':
            computedFontSize = RFValue(9);
            break;
        default:
            computedFontSize = RFValue(12);
    }

    return (
        <Text
            onLayout={onLayout}
            style={[
                styles.text,
                { color: Colors.text, fontSize: fontSize || computedFontSize, fontFamily },
                style,
            ]}
            numberOfLines={numberOfLines !== undefined ? numberOfLines : undefined}
            {...props}
        >
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    text: {
        textAlign: 'left',
    },
});

export default CustomText;
