import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Provider as PaperProvider, BottomNavigation, Text } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './src/theme';
import RegisterClient from './src/screens/RegisterClient';
import CreateLoan from './src/screens/CreateLoan';
import LoanList from './src/screens/LoanList';
import Balance from './src/screens/Balance';

const queryClient = new QueryClient();

export default function App() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'loans', title: 'Loans', focusedIcon: 'format-list-bulleted' },
    { key: 'create', title: 'Loan+', focusedIcon: 'plus-box' },
    { key: 'register', title: 'Client+', focusedIcon: 'account-plus' },
    { key: 'balance', title: 'Balance', focusedIcon: 'chart-bar' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    loans: LoanList,
    create: CreateLoan,
    register: RegisterClient,
    balance: Balance,
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
