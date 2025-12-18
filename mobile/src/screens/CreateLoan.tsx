import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Title, Snackbar, List, Portal, Modal, Text, Card, Divider } from 'react-native-paper';
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

            <Card style={styles.formCard}>
                <Card.Content>
                    <Text style={styles.label}>1. Select Client</Text>
                    <Button
                        mode="outlined"
                        onPress={() => setModalVisible(true)}
                        style={styles.selectButton}
                        icon="account-search"
                    >
                        {selectedClient ? selectedClient.name : 'Choose a Client'}
                    </Button>

                    <Divider style={styles.divider} />

                    <Text style={styles.label}>2. Loan Start Date</Text>
                    {Platform.OS === 'web' ? (
                        <View style={styles.webDateWrapper}>
                            <input
                                type="date"
                                value={format(loanDate, 'yyyy-MM-dd')}
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    if (!isNaN(date.getTime())) {
                                        setLoanDate(date);
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '16px',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(0,0,0,0.2)',
                                    marginBottom: '20px',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            style={styles.dateSelector}
                            activeOpacity={0.7}
                        >
                            <View style={styles.dateInfo}>
                                <Text style={styles.dateValue}>{format(loanDate, 'PPPP')}</Text>
                                <Text style={styles.dateHint}>Tap to change start date</Text>
                            </View>
                            <TextInput.Icon icon="calendar" color="#6200ee" />
                        </TouchableOpacity>
                    )}

                    {showDatePicker && (
                        <DateTimePicker
                            value={loanDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                        />
                    )}

                    <Divider style={styles.divider} />

                    <Text style={styles.label}>3. Loan Amount & Fee</Text>
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
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                onPress={handleCreate}
                loading={mutation.isPending}
                disabled={!selectedClient || !amount || mutation.isPending}
                style={styles.sumbitButton}
                contentStyle={{ height: 50 }}
            >
                Issue Loan Now
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
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 8,
    },
    divider: {
        marginVertical: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    formCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        elevation: 2,
        marginBottom: 20,
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    dateInfo: {
        flex: 1,
    },
    dateValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    dateHint: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    webDateWrapper: {
        marginBottom: 10,
    },
    selectButton: {
        marginBottom: 10,
        paddingVertical: 4,
    },
    sumbitButton: {
        marginTop: 10,
        marginBottom: 30,
        borderRadius: 8,
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
        maxHeight: '80%',
    },
});
