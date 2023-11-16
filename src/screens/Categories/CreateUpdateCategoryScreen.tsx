import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TouchableOpacity, SafeAreaView, TextInput, Modal, View, Text } from 'react-native';

import { CategoryEntity } from '../../entities';

interface OwnProps {
  isOpen: boolean;
  initialCategory: CategoryEntity;
  onClose: () => void;
  onSave: (category: CategoryEntity) => void;
  onDelete: (conditions: Partial<CategoryEntity>) => void;
}

export const CreateOrUpdateCategoryModal = ({
  initialCategory,
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
    defaultValues: initialCategory,
  });

  useEffect(() => {
    reset(initialCategory);
  }, [initialCategory]);

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
          <Text>{initialCategory.id ? 'Edit category' : 'New category'}</Text>
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

          {initialCategory.id && (
            <TouchableOpacity
              style={{ marginTop: 40 }}
              onPress={() => {
                onDelete({ id: initialCategory.id });
                onClose();
              }}
            >
              <Text>Delete category</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};
