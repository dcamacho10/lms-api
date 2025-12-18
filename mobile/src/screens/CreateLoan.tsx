import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Title, Snackbar, List, Portal, Modal, Text } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLoan, getClients } from '../api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export default function CreateLoan() {
    const queryClient = useQueryClient();
    const [selectedClient, setSelectedClient] = useState<{ id: number; name: string } | null>(null);
    const [amount, setAmount] = useState('');
    const [feeRate, setFeeRate] = useState('40');
    const [loanDate, setLoanDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [visible, setVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [msg, setMsg] = useState('');

    const { data: clients, isLoading: clientsLoading } = useQuery({
        queryKey: ['clients'],
        queryFn: getClients,
    });

    const mutation = useMutation({
        mutationFn: createLoan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            setMsg('Loan created successfully!');
            setVisible(true);
            setAmount('');
            setFeeRate('40');
            setSelectedClient(null);
            setLoanDate(new Date());
        },
        onError: () => {
            setMsg('Failed to create loan.');
            setVisible(true);
        },
    });

    const handleCreate = () => {
        if (!selectedClient || !amount) return;
        mutation.mutate({
            clientId: selectedClient.id,
            principal: parseFloat(amount),
            loanDate: loanDate.toISOString(),
            monthlyFeeRate: parseFloat(feeRate),
        });
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setLoanDate(selectedDate);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title style={styles.title}>Create New Loan</Title>

            <Button
                mode="outlined"
                onPress={() => setModalVisible(true)}
                style={styles.selectButton}
            >
                {selectedClient ? `Client: ${selectedClient.name}` : 'Select Client'}
            </Button>

            <Text style={styles.label}>Loan Start Date:</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                <View pointerEvents="none">
                    <TextInput
                        value={format(loanDate, 'PPPP')}
                        editable={false}
                        mode="outlined"
                        right={<TextInput.Icon icon="calendar" />}
                    />
                </View>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={loanDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                />
            )}

            <TextInput
                label="Loan Amount"
                value={amount}
                onChangeText={setAmount}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                left={<TextInput.Affix text="$" />}
            />

            <TextInput
                label="Monthly Fee (%)"
                value={feeRate}
                onChangeText={setFeeRate}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                right={<TextInput.Affix text="%" />}
            />

            <Button
                mode="contained"
                onPress={handleCreate}
                loading={mutation.isPending}
                disabled={!selectedClient || !amount || mutation.isPending}
                style={styles.button}
            >
                Issue Loan
            </Button>

            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={styles.modal}
                >
                    <Title>Select Client</Title>
                    <ScrollView>
                        {clients?.map((client: any) => (
                            <List.Item
                                key={client.id}
                                title={client.name}
                                description={client.phone}
                                onPress={() => {
                                    setSelectedClient(client);
                                    setModalVisible(false);
                                }}
                            />
                        ))}
                        {clients?.length === 0 && <Text>No clients found.</Text>}
                    </ScrollView>
                </Modal>
            </Portal>

            <Snackbar
                visible={visible}
                onDismiss={() => setVisible(false)}
                duration={3000}
            >
                {msg}
            </Snackbar>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f8f9fa',
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#6200ee',
    },
    input: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    datePickerButton: {
        marginBottom: 20,
    },
    selectButton: {
        marginBottom: 20,
        paddingVertical: 5,
    },
    button: {
        marginTop: 10,
        paddingVertical: 5,
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
        maxHeight: '80%',
    },
});
