import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Title, HelperText, Snackbar } from 'react-native-paper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '../api';

export default function RegisterClient() {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [visible, setVisible] = useState(false);
    const [msg, setMsg] = useState('');

    const mutation = useMutation({
        mutationFn: createClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            setMsg('Client registered successfully!');
            setVisible(true);
            setName('');
            setAddress('');
            setPhone('');
        },
        onError: () => {
            setMsg('Failed to register client.');
            setVisible(true);
        },
    });

    const handleRegister = () => {
        if (!name || !address || !phone) return;
        mutation.mutate({ name, address, phone });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title style={styles.title}>Register New Client</Title>

            <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
            />
            {!name && <HelperText type="error">Name is required</HelperText>}

            <TextInput
                label="Address"
                value={address}
                onChangeText={setAddress}
                mode="outlined"
                style={styles.input}
            />
            {!address && <HelperText type="error">Address is required</HelperText>}

            <TextInput
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
            />
            {!phone && <HelperText type="error">Phone number is required</HelperText>}

            <Button
                mode="contained"
                onPress={handleRegister}
                loading={mutation.isPending}
                disabled={!name || !address || !phone || mutation.isPending}
                style={styles.button}
            >
                Register Client
            </Button>

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
        marginBottom: 10,
    },
    button: {
        marginTop: 20,
        paddingVertical: 5,
    },
});
