import React, { useEffect } from 'react';
import { router } from 'expo-router';

export default function TransferAmountRedirect() {
  useEffect(() => {
    router.replace('/transfer/recipient');
  }, []);

  return null;
}