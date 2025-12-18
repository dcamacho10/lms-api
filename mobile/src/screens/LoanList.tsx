import React from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Card, Title, Paragraph, Button, Text, ActivityIndicator, Divider } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActiveLoans, payLoan } from '../api';
import { format } from 'date-fns';

export default function LoanList() {
    const queryClient = useQueryClient();

    const { data: loans, isLoading, error } = useQuery({
        queryKey: ['loans', 'active'],
        queryFn: getActiveLoans,
    });

    const payMutation = useMutation({
        mutationFn: payLoan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loans'] });
        },
    });

    const totalOwed = loans?.reduce((sum: number, loan: any) => sum + loan.totalOwed, 0) || 0;

    if (isLoading) return <ActivityIndicator style={styles.loader} />;

    return (
        <View style={styles.container}>
            <Card style={styles.summaryCard}>
                <Card.Content>
                    <Title>Total Owed</Title>
                    <Text style={styles.totalAmount}>${totalOwed.toFixed(2)}</Text>
                </Card.Content>
            </Card>

            <Title style={styles.title}>Active Loans</Title>

            <FlatList
                data={loans}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Card style={styles.loanCard}>
                        <Card.Content>
                            <View style={styles.row}>
                                <Title>{item.clientName}</Title>
                                {new Date(item.dueDate) < new Date() && (
                                    <Text style={styles.overdueLabel}>OVERDUE</Text>
                                )}
                            </View>
                            <Paragraph>Principal: ${parseFloat(item.principal).toFixed(2)}</Paragraph>
                            <Paragraph>Monthly Fee: {(parseFloat(item.monthlyFeeRate) * 100).toFixed(0)}%</Paragraph>
                            <Paragraph>Fees Accumulated: ${item.fees.toFixed(2)}</Paragraph>
                            <Paragraph>Total to Pay: ${item.totalOwed.toFixed(2)}</Paragraph>
                            <Paragraph>Due Date: {format(new Date(item.dueDate), 'MMM dd, yyyy')}</Paragraph>
                        </Card.Content>
                        <Card.Actions>
                            <Button
                                mode="contained"
                                onPress={() => payMutation.mutate(item.id)}
                                loading={payMutation.isPending && payMutation.variables === item.id}
                            >
                                Pay in Full
                            </Button>
                        </Card.Actions>
                    </Card>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                ListEmptyComponent={<Text style={styles.empty}>No active loans found.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f8f9fa',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    summaryCard: {
        marginBottom: 20,
        backgroundColor: '#e8def8',
    },
    totalAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#6200ee',
    },
    title: {
        marginBottom: 10,
    },
    loanCard: {
        backgroundColor: 'white',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    overdueLabel: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 12,
    },
    empty: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
});
