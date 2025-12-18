import React from 'react';
import { View, StyleSheet, ScrollView, FlatList, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Text, ActivityIndicator, Divider, Surface, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { getYearlyBalance } from '../api';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function Balance() {
    const theme = useTheme();
    const { data, isLoading, error } = useQuery({
        queryKey: ['stats', 'balance'],
        queryFn: getYearlyBalance,
    });

    if (isLoading) return <ActivityIndicator style={styles.loader} />;
    if (error) return <View style={styles.center}><Text>Failed to load balance</Text></View>;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Title style={styles.pageTitle}>Financial Overview {data?.year}</Title>

            <View style={styles.summaryRow}>
                <Surface style={[styles.summaryCard, { backgroundColor: '#f3e5f5' }]} elevation={1}>
                    <TrendingDown size={24} color="#7b1fa2" />
                    <Text style={styles.summaryLabel}>Total Loaned</Text>
                    <Text style={styles.summaryValue}>${data?.totalLoaned.toFixed(2)}</Text>
                </Surface>

                <Surface style={[styles.summaryCard, { backgroundColor: '#e8f5e9' }]} elevation={1}>
                    <TrendingUp size={24} color="#2e7d32" />
                    <Text style={styles.summaryLabel}>Total Earnings</Text>
                    <Text style={styles.summaryValue}>${data?.totalEarnings.toFixed(2)}</Text>
                </Surface>
            </View>

            <Surface style={styles.recoveredCard} elevation={1}>
                <DollarSign size={20} color="#0288d1" />
                <View style={{ marginLeft: 10 }}>
                    <Text style={styles.recoveredLabel}>Recovered Capital (Principal Returned)</Text>
                    <Text style={styles.recoveredValue}>${data?.totalRecovered.toFixed(2)}</Text>
                </View>
            </Surface>

            <Card style={styles.infoCard}>
                <Card.Content>
                    <Text style={styles.infoTitle}>What is ROI?</Text>
                    <Text style={styles.infoText}>
                        <Text style={{ fontWeight: 'bold' }}>Return on Investment (ROI)</Text> is the ratio of your profit (fees) to the amount you lent out.
                        It shows how much profit you made for every dollar invested.
                    </Text>
                </Card.Content>
            </Card>

            <Divider style={styles.divider} />

            <Title style={styles.sectionTitle}>Monthly Performance</Title>

            {data?.monthlyData.map((item: any, index: number) => (
                <Surface key={index} style={styles.monthRow} elevation={1}>
                    <View style={styles.monthHeader}>
                        <Calendar size={18} color="#666" />
                        <Text style={styles.monthName}>{item.month}</Text>
                        {item.loaned > 0 && (
                            <Text style={styles.roiBadge}>
                                ROI: {((item.earnings / item.loaned) * 100).toFixed(1)}%
                            </Text>
                        )}
                    </View>

                    <View style={styles.dataRow}>
                        <View style={styles.dataItem}>
                            <Text style={styles.dataLabel}>Issued</Text>
                            <Text style={[styles.dataValue, { color: '#666' }]}>${item.loaned.toFixed(2)}</Text>
                        </View>

                        <View style={styles.dataItem}>
                            <Text style={styles.dataLabel}>Recovered</Text>
                            <Text style={[styles.dataValue, { color: '#0288d1' }]}>${item.recovered.toFixed(2)}</Text>
                        </View>

                        <View style={styles.dataItem}>
                            <Text style={[styles.dataLabel, { textAlign: 'right' }]}>Earnings</Text>
                            <Text style={[styles.dataValue, { textAlign: 'right', color: '#2e7d32' }]}>
                                +${item.earnings.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </Surface>
            ))}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        padding: 20,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#6200ee',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    summaryCard: {
        width: (screenWidth - 50) / 2,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },
    recoveredCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e1f5fe',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
    },
    recoveredLabel: {
        fontSize: 12,
        color: '#01579b',
    },
    recoveredValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0288d1',
    },
    infoCard: {
        backgroundColor: '#fff9c4',
        marginBottom: 10,
        borderRadius: 12,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#f57f17',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#616161',
        lineHeight: 18,
    },
    divider: {
        marginVertical: 10,
        backgroundColor: 'transparent',
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 15,
        color: '#333',
    },
    monthRow: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
    },
    monthHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    monthName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444',
    },
    roiBadge: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 'bold',
    },
    dataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dataItem: {
        flex: 1,
    },
    dataLabel: {
        fontSize: 10,
        color: '#888',
        textTransform: 'uppercase',
    },
    dataValue: {
        fontSize: 14,
        fontWeight: '600',
    },
});
