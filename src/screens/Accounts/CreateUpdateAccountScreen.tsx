import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TouchableOpacity, SafeAreaView, TextInput, Modal, View, Text } from 'react-native';

import { AccountEntity } from '../../entities';

interface OwnProps {
  isOpen: boolean;
  initialAccount: AccountEntity;
  onClose: () => void;
  onSave: (account: AccountEntity) => void;
  onDelete: (conditions: Partial<AccountEntity>) => void;
}

export const CreateOrUpdateAccountModal = ({
  initialAccount,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: OwnProps) => {
  const {
    reset,
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: initialAccount,
  });

  useEffect(() => {
    reset(initialAccount);
  }, [initialAccount]);

  const onSubmit = (data) => {
    onSave(data);
    onClose();
  };

  return (
    <Modal animationType="slide" visible={isOpen} onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            height: 50,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
          <Text>{initialAccount.id ? 'Edit account' : 'New account'}</Text>
          <TouchableOpacity onPress={handleSubmit(onSubmit)}>
            <Text>Save</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Name"
                autoFocus={true}
                value={value}
                onBlur={onBlur}
                onChangeText={(value) => onChange(value)}
              />
            )}
            name="name"
            rules={{ required: true }}
          />
          {errors.name && <Text style={{ color: 'red' }}>Name is required</Text>}
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Balance"
                inputMode="numeric"
                keyboardType="numeric"
                value={value?.toString()}
                onBlur={onBlur}
                onChangeText={(value) => {
                  value = value.replace(/[^0-9]/g, '');
                  onChange(value);
                }}
              />
            )}
            name="balance"
            rules={{ required: true }}
          />
          {errors.balance && <Text style={{ color: 'red' }}>Balance is required</Text>}
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                multiline
                numberOfLines={3}
                placeholder="Description"
                value={value}
                onBlur={onBlur}
                onChangeText={(value) => onChange(value)}
              />
            )}
            name="description"
          />

          {initialAccount.id && (
            <TouchableOpacity
              style={{ marginTop: 40 }}
              onPress={() => {
                onDelete({ id: initialAccount.id });
                onClose();
              }}
            >
              <Text>Delete account</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};
