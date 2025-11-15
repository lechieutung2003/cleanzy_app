import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import useInvoiceViewModel from '../../viewmodels/InvoiceScreen/useInvoiceViewModel';

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '-'}</Text>
    </View>
  );
}

export default function InvoiceScreen() {
  const { loading, invoice, totals, onCancel, onHome } = useInvoiceViewModel();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Invoice</Text>

      <View style={styles.card}>
        {loading && <ActivityIndicator style={{ marginVertical: 12 }} color="#047857" />}

        {!loading && invoice && (
          <>
            <Row label="Name" value={invoice.name} />
            <Row label="Phone" value={invoice.phone} />
            <Row label="Address" value={invoice.address} />

            <View style={styles.separator} />

            <Row label="Type" value={invoice.type} />
            <Row label="Area" value={invoice.area} />
            <Row label="Start time" value={invoice.startTime} />
            <Row label="End time" value={invoice.endTime} />
            <Row label="Note" value={invoice.note} />

            <View style={styles.separator} />

            <Row label="Time" value={invoice.duration} />
            <Row label="Method" value={invoice.method} />
            <Row label="Price" value={invoice.price !== undefined ? invoice.price.toLocaleString('vi-VN') : undefined} />

            <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
              <Text style={styles.vatText}>{totals?.vatText}</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.footer}>
        
        {/* <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Order's status:</Text>
          <Text style={styles.statusValue}>{invoice?.status || '-'}</Text>
        </View> */}

        <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={onCancel}>
          <Text style={[styles.btnText, styles.btnTextOutline]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onHome}>
          <Text style={[styles.btnText, styles.btnTextPrimary]}>Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 32 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#047857',
    textAlign: 'center',
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  rowLabel: {
    width: 110,
    color: '#111827',
    fontWeight: '600',
    fontSize: 18,
  },
  rowValue: {
    flex: 1,
    color: '#374151',
    fontSize: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#cbd5e1',
    marginVertical: 10,
  },
  vatText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 18,
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#047857',
    marginRight: 6,
  },
  statusValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f59e42',
    textTransform: 'capitalize',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: '#047857',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  btnPrimary: {
    backgroundColor: '#047857',
    marginLeft: 10,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  btnTextOutline: { color: '#047857' },
  btnTextPrimary: { color: '#fff' },
});