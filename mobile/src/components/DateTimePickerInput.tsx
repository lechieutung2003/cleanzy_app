import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface Props {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
}

const DateTimePickerInput: React.FC<Props> = ({ label, value, onChange, mode = 'datetime' }) => {
  const [isPickerVisible, setPickerVisible] = useState(false);

  const showPicker = () => setPickerVisible(true);
  const hidePicker = () => setPickerVisible(false);

  const handleConfirm = (date: Date) => {
    onChange(date);
    hidePicker();
  };

  return (
    <View style={styles.container}>

      <Pressable style={styles.inputContainer} onPress={showPicker}>
        <Text style={styles.inputText}>
          {value ? value.toLocaleString() : `Select ${label}`}
        </Text>
      </Pressable>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode={mode}
        date={value || new Date()}
        onConfirm={handleConfirm}
        onCancel={hidePicker}
        is24Hour
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0F7B5E',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#666',
  },
});

export default DateTimePickerInput;
