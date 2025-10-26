import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface Props extends TextInputProps {
    rightIcon?: React.ReactNode;
}

const TextField: React.FC<Props> = ({ rightIcon, style, ...rest }) => (
    <View style={styles.inputWrapper}>
        <TextInput
            style={[styles.input, style]}
            placeholderTextColor="#bdbdbd"
            {...rest}
        />
        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
    </View>
);

const styles = StyleSheet.create({
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 12,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
        color: '#222',
    },
    icon: {
        marginLeft: 8,
    },
});

export default TextField;