import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useMutation, useQuery } from 'react-query';

import { accountsService, categoriesService } from '../../data-sources/data-source';
import { CreateOrUpdateCategoryModal } from './CreateUpdateCategoryScreen';
import { CategoryTypeEnum } from '../../enums/category-type.enum';
import { CategoryEntity } from '../../entities';

export const CategoriesScreen = () => {
  const { data: categories = [], refetch } = useQuery(
    'categories',
    async () => await categoriesService.selectMany(),
  );
  const { data: accounts = [] } = useQuery(
    'accounts',
    async () => await accountsService.selectMany(),
  );

  const createOrEditMutation = useMutation(
    async (entityLike: Partial<CategoryEntity>) => await categoriesService.createOne(entityLike),
    { onSuccess: () => refetch() },
  );
  const deleteMutation = useMutation(
    async (conditions: Partial<CategoryEntity>) => await categoriesService.deleteOne(conditions),
    { onSuccess: () => refetch() },
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryEntity>(
    new CategoryEntity({ name: '', type: CategoryTypeEnum.EXPENSE }),
  );

  const handleClickEdit = (category: CategoryEntity) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleClickCreate = () => {
    setSelectedCategory(new CategoryEntity({ name: '', type: CategoryTypeEnum.EXPENSE }));
    setIsModalOpen(true);
  };

  return (
    <View>
      <View
        style={{
          height: 50,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            return;
          }}
        >
          <Text>Menu</Text>
        </TouchableOpacity>
        <Text>{accounts.reduce((acc, current) => (acc += current.balance), 0)}</Text>
        {isEditMode && (
          <TouchableOpacity onPress={handleClickCreate}>
            <Text>Add</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)}>
          <Text>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            onPress={() => handleClickEdit(category)}
          >
            <Text>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <CreateOrUpdateCategoryModal
        isOpen={isModalOpen}
        initialCategory={selectedCategory}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => await createOrEditMutation.mutateAsync(data)}
        onDelete={async (data) => await deleteMutation.mutateAsync(data)}
      />
    </View>
  );
};
