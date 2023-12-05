import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TouchableOpacity, SafeAreaView, TextInput, Modal, View, Text } from 'react-native';

import { AccountEntity, CategoryEntity, TransactionEntity } from '../../entities';
import { SelectFromListModal } from '../../components/SelectFromListModal';

interface OwnProps {
  isOpen: boolean;
  date: Date;
  initialCategory: CategoryEntity;
  initialTransaction: TransactionEntity;
  accounts: AccountEntity[];
  categories: CategoryEntity[];
  onClose: () => void;
  onSave: (transaction: TransactionEntity) => void;
  onDelete: (conditions: Partial<TransactionEntity>) => void;
}

export const CreateOrUpdateTransactionModal = ({
  initialTransaction,
  initialCategory,
  isOpen,
  date,
  accounts,
  categories,
  onClose,
  onSave,
}: OwnProps) => {
  if (!accounts) return;

  const { reset, control, handleSubmit } = useForm({
    defaultValues: initialTransaction,
  });

  useEffect(() => {
    reset(initialTransaction);
  }, [initialTransaction]);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const [selectedAccount, setSelectedAccount] = useState<AccountEntity>(accounts[0]);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<CategoryEntity>(initialCategory);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const onSubmit = (data: TransactionEntity) => {
    const now = new Date();
    now.setDate(date.getDate());
    now.setMonth(date.getMonth());
    now.setFullYear(date.getFullYear());
    onSave({ ...data, date: now, account: selectedAccount, category: selectedCategory });
    onClose();
  };

  return (
    <Modal animationType="fade" visible={isOpen} onRequestClose={onClose} transparent={true}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ flex: 0.3, backgroundColor: 'rgba(0,0,0,.5)' }}
          onPress={onClose}
        ></TouchableOpacity>
        <View style={{ flex: 0.7, backgroundColor: 'white' }}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              style={{ flex: 0.5, padding: 15, backgroundColor: selectedAccount.color }}
              onPress={() => setIsAccountModalOpen(true)}
            >
              <Text style={{ fontSize: 16 }}>Account</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text>{selectedAccount.name}</Text>
                <Text>{selectedAccount.balance}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 0.5,
                padding: 15,
                backgroundColor: selectedCategory.color,
              }}
              onPress={() => setIsCategoryModalOpen(true)}
            >
              <Text style={{ fontSize: 16 }}>Category</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text>{selectedCategory.name}</Text>
                <Text>{selectedCategory.transactionsTotal}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ padding: 15 }}>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Amount"
                  autoFocus={true}
                  value={value.toString()}
                  onBlur={onBlur}
                  onChangeText={(value) => onChange(value)}
                  style={{ fontSize: 20, marginBottom: 10 }}
                />
              )}
              name="amount"
              rules={{ required: true }}
            />
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Description"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={(value) => onChange(value)}
                  style={{ fontSize: 14, marginBottom: 10 }}
                />
              )}
              name="description"
            />
            <TouchableOpacity onPress={handleSubmit(onSubmit)}>
              <Text style={{ fontSize: 22, color: '#527853', fontWeight: 'bold' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <SelectFromListModal
          isOpen={isAccountModalOpen}
          onClose={(entity) => {
            setSelectedAccount(entity), setIsAccountModalOpen(false);
          }}
          list={accounts}
          initialSelected={selectedAccount}
        />
        <SelectFromListModal
          isOpen={isCategoryModalOpen}
          onClose={(entity) => {
            setSelectedCategory(entity), setIsCategoryModalOpen(false);
          }}
          list={categories}
          initialSelected={selectedCategory}
        />
      </SafeAreaView>
    </Modal>
  );
};
