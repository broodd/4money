import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useQuery, useQueryClient } from 'react-query';

import { CreateOrUpdateAccountModal } from './CreateUpdateAccountScreen';
import { accountsService } from '../../data-sources/data-source';
import { AccountEntity } from '../../entities';

export const AccountsScreen = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountEntity>(
    new AccountEntity({ name: '', balance: 0, description: '' }),
  );
  const { data: accounts = [] } = useQuery(
    'accounts',
    async () =>
      await accountsService.selectMany({
        order: { createdAt: 'desc' },
      }),
  );

  const handleSaveAccount = async (entityLike: Partial<AccountEntity>) => {
    await accountsService.createOne(entityLike);
    queryClient.refetchQueries('accounts');
  };

  const handleDeleteAccount = async (entityLike: Partial<AccountEntity>) => {
    setIsModalOpen(false);
    await accountsService.deleteOne(entityLike);
    queryClient.refetchQueries('accounts');
  };

  const handleClickEdit = (account: AccountEntity) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleClickCreate = () => {
    setSelectedAccount(new AccountEntity({ name: '', balance: 0, description: '' }));
    setIsModalOpen(true);
  };

  return (
    <View>
      <View
        style={{
          height: 50,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 15,
        }}
      >
        <Text style={{ fontSize: 22 }}>
          {accounts
            ?.reduce((acc, current) => (acc += parseFloat(current.balance as unknown as string)), 0)
            .toFixed(2)}
        </Text>
        <TouchableOpacity onPress={handleClickCreate}>
          <Text style={{ fontSize: 22 }}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {accounts.map((account) => (
          <TouchableOpacity
            key={account.id}
            onPress={() => handleClickEdit(account)}
            style={{
              padding: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottomWidth: 1,
              borderBottomColor: 'lightgray',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  backgroundColor: account.color,
                  borderRadius: 50,
                  marginRight: 10,
                  width: 30,
                  height: 30,
                }}
              ></View>
              <Text style={{ fontSize: 20 }}>{account.name}</Text>
            </View>
            <Text style={{ fontSize: 20 }}>{account.balance}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <CreateOrUpdateAccountModal
        isOpen={isModalOpen}
        initialAccount={selectedAccount}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
      />
    </View>
  );
};
