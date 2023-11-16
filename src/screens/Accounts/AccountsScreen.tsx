import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

import { CreateOrUpdateAccountModal } from './CreateUpdateAccountScreen';
import { accountsService } from '../../data-sources/data-source';
import { useMutation, useQuery } from 'react-query';
import { AccountEntity } from '../../entities';

export const AccountsScreen = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountEntity>(
    new AccountEntity({ name: '', balance: 0, description: '' }),
  );
  const { data: accounts = [], refetch } = useQuery(
    'accounts',
    async () => await accountsService.selectMany(),
  );

  const createOrEditMutation = useMutation(
    async (entityLike: Partial<AccountEntity>) => await accountsService.createOne(entityLike),
    { onSuccess: () => refetch() },
  );
  const deleteMutation = useMutation(
    async (conditions: Partial<AccountEntity>) => await accountsService.deleteOne(conditions),
    { onSuccess: () => refetch() },
  );

  const handleClickEdit = (account: AccountEntity) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleClickCreate = () => {
    setSelectedAccount(new AccountEntity({ name: '', balance: 0, description: '' }));
    setIsModalOpen(true);
  };

  // const queryClient = useQueryClient();
  // const handleSave = () => {
  //   queryClient.invalidateQueries('accounts')
  // };

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
        <TouchableOpacity onPress={handleClickCreate}>
          <Text>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {accounts.map((account, index) => (
          <TouchableOpacity
            key={index}
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            onPress={() => handleClickEdit(account)}
          >
            <Text>{account.name}</Text>
            <Text>{account.balance}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <CreateOrUpdateAccountModal
        isOpen={isModalOpen}
        initialAccount={selectedAccount}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => createOrEditMutation.mutateAsync(data)}
        onDelete={(data) => deleteMutation.mutateAsync(data)}
      />

      {/* <Modal
        animationType="slide"
        transparent={true}
        visible={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <TouchableOpacity
          style={{ flex: 0.5 }}
          onPress={() => setIsModalOpen(false)}
        ></TouchableOpacity>
        <View
          style={{
            flex: 0.5,
            backgroundColor: 'white',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>{selectedAccount.name}</Text>
            <Text>{selectedAccount.balance}</Text>
          </View>
          <TouchableOpacity onPress={handleClickCreate}>
            <Text>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsModalOpen(false);
            }}
          >
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal> */}
    </View>
  );
};
