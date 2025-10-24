import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Hello() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Hello từ component mới</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    text: { fontSize: 16 },
});