import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TouchableOpacity, SafeAreaView, TextInput, Modal, View, Text } from 'react-native';

import { AccountEntity } from '../../entities';
import { SelectColorModal } from '../../components/SelectColorModal';
import { COLORS } from '../../common/constants/colors';

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
  const { reset, control, handleSubmit, setValue } = useForm({
    defaultValues: initialAccount,
  });

  const [selectedColor, setSelectedColor] = useState<string>(initialAccount.color);
  const [isColorModalOpen, setIsAccountModalOpen] = useState(false);

  useEffect(() => {
    reset(initialAccount);
    const color = initialAccount.color || COLORS[0];
    setSelectedColor(color);
    setValue('color', color);
  }, [initialAccount]);

  const onSubmit = (data) => {
    onSave(data);
    onClose();
  };

  return (
    <Modal animationType="none" visible={isOpen} onRequestClose={onClose} transparent={true}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ flex: 0.3, backgroundColor: 'rgba(0,0,0,.5)' }}
          onPress={onClose}
        ></TouchableOpacity>
        <View style={{ flex: 0.7, backgroundColor: 'white', padding: 15 }}>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TextInput
                  placeholder="Name"
                  autoFocus={true}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={(value) => onChange(value)}
                  style={{ fontSize: 22, marginBottom: 10 }}
                />
                <TouchableOpacity
                  onPress={() => setIsAccountModalOpen(true)}
                  style={{
                    backgroundColor: selectedColor,
                    borderRadius: 50,
                    marginRight: 10,
                    width: 40,
                    height: 40,
                  }}
                ></TouchableOpacity>
              </View>
            )}
            name="name"
            rules={{ required: true }}
          />
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Balance"
                value={value?.toString()}
                onBlur={onBlur}
                onChangeText={(value) => {
                  value = value.replace(/[^-0-9]/g, '');
                  onChange(value);
                }}
                style={{ fontSize: 18, marginBottom: 10 }}
              />
            )}
            name="balance"
            rules={{ required: true }}
          />
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

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
            {initialAccount.id && (
              <TouchableOpacity onPress={() => onDelete({ id: initialAccount.id })}>
                <Text style={{ fontSize: 22, color: 'tomato', fontWeight: 'bold' }}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSubmit(onSubmit)}>
              <Text style={{ fontSize: 22, color: '#527853', fontWeight: 'bold' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <SelectColorModal
              isOpen={isColorModalOpen}
              onClose={(color) => {
                if (!color) return;
                onChange(color);
                setSelectedColor(color), setIsAccountModalOpen(false);
              }}
              initialSelected={value}
            />
          )}
          name="color"
          rules={{ required: true }}
        />
      </SafeAreaView>
    </Modal>
  );
};
