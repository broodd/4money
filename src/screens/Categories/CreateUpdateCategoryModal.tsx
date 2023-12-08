import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TouchableOpacity, SafeAreaView, TextInput, Modal, View, Text } from 'react-native';

import { CategoryEntity } from '../../entities';
import { CategoryTypeEnum } from '../../enums/category-type.enum';
import { SelectColorModal } from '../../components/SelectColorModal';
import { COLORS } from '../../common/constants/colors';

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
  if (!initialCategory) return;

  const { reset, control, handleSubmit, setValue } = useForm({
    defaultValues: initialCategory,
  });

  const [selectedColor, setSelectedColor] = useState<string>(initialCategory.color);
  const [isColorModalOpen, setIsAccountModalOpen] = useState(false);

  useEffect(() => {
    reset(initialCategory);
    const color = initialCategory.color || COLORS[0];
    setSelectedColor(color);
    setValue('color', color);
  }, [initialCategory]);

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
        <View style={{ flex: 0.7, backgroundColor: 'white' }}>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={[
                    { flex: 0.5, padding: 15, borderColor: '#E97777', borderWidth: 4 },
                    value === 'EXPENSE' && { backgroundColor: 'tomato' },
                  ]}
                  onPress={() => onChange(CategoryTypeEnum.EXPENSE)}
                >
                  <Text
                    style={[
                      { fontSize: 16, fontWeight: 'bold' },
                      value === 'EXPENSE' && { color: 'white' },
                    ]}
                  >
                    Expenses
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    { flex: 0.5, padding: 15, borderColor: '#527853', borderWidth: 4 },
                    value === 'INCOME' && { backgroundColor: '#748E63' },
                  ]}
                  onPress={() => onChange(CategoryTypeEnum.INCOME)}
                >
                  <Text
                    style={[
                      { fontSize: 16, fontWeight: 'bold', color: 'black' },
                      value === 'INCOME' && { color: 'white' },
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            name="type"
            rules={{ required: true }}
          />

          <View style={{ padding: 15 }}>
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
                    style={{ fontSize: 22, marginTop: 10 }}
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

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
              {initialCategory.id && (
                <TouchableOpacity
                  onPress={() => {
                    onDelete({ id: initialCategory.id });
                    onClose();
                  }}
                >
                  <Text style={{ fontSize: 22, color: 'tomato', fontWeight: 'bold' }}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleSubmit(onSubmit)}>
                <Text style={{ fontSize: 22, color: '#527853', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
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
