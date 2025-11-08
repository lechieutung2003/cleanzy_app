import React from 'react';
import { TouchableOpacity, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface BackButtonProps {
    onPress?: () => void;
    style?: ViewStyle;
    iconStyle?: ImageStyle;
}

const BackButton: React.FC<BackButtonProps> = ({ onPress, style, iconStyle }) => {
    const navigation = useNavigation();

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            navigation.goBack();
        }
    };

    return (
        <TouchableOpacity style={[styles.backBtn, style]} onPress={handlePress}>
            <Image
                source={require('../assets/back_button/back_button.png')}
                style={[styles.icon, iconStyle]} // Cho phép ghi đè style
                resizeMode="contain"
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    backBtn: {
        position: 'absolute',
        top: 56,
        left: 16,
        zIndex: 10,
        padding: 8,
    },
    icon: {
        width: 40,
        height: 40,
    },
});

export default BackButton;