import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

const TextField: React.FC<TextInputProps> = (props) => {
    return (
        <TextInput
            style={[styles.input, props.style]}
            placeholderTextColor="#bdbdbd"
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#bdbdbd',
        borderRadius: 20,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
});

export default TextField;