import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Provider as PaperProvider, BottomNavigation, Text } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './src/theme';
import RegisterClient from './src/screens/RegisterClient';
import CreateLoan from './src/screens/CreateLoan';
import LoanList from './src/screens/LoanList';

const queryClient = new QueryClient();

export default function App() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'loans', title: 'Loans', focusedIcon: 'format-list-bulleted', unfocusedIcon: 'format-list-bulleted' },
    { key: 'register', title: 'Client+', focusedIcon: 'account-plus', unfocusedIcon: 'account-plus-outline' },
    { key: 'create', title: 'Loan+', focusedIcon: 'cash-plus', unfocusedIcon: 'cash' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    loans: LoanList,
    register: RegisterClient,
    create: CreateLoan,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <BottomNavigation
            navigationState={{ index, routes }}
            onIndexChange={setIndex}
            renderScene={renderScene}
          />
        </SafeAreaView>
      </PaperProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
