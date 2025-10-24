import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
    loading?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    onPress,
    style,
    textStyle,
    disabled = false,
    loading = false,
}) => (
    <TouchableOpacity
        style={[styles.button, style, (disabled || loading) && styles.disabled]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled || loading}
    >
        {loading ? (
            <ActivityIndicator color="#fff" />
        ) : (
            <Text style={[styles.text, textStyle]}>{title}</Text>
        )}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#047857',
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 18,
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default PrimaryButton;