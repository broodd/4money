import { Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';

import { AccountEntity, CategoryEntity } from '../entities';

interface OwnProps<T> {
  isOpen: boolean;
  initialSelected: T;
  list: Array<T>;
  onClose: (selected: T) => void;
}

export const SelectFromListModal = <T extends AccountEntity | CategoryEntity>({
  isOpen,
  initialSelected,
  list,
  onClose,
}: OwnProps<T>) => {
  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  return (
    <Modal
      animationType="none"
      visible={isOpen}
      onRequestClose={() => onClose(selected)}
      transparent={true}
    >
      <SafeAreaView
        style={{
          flex: 1,
          position: 'relative',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'stretch',
          height: '100%',
          width: '100%',
        }}
      >
        <View style={{ position: 'relative', height: '100%', width: '100%' }}>
          <TouchableOpacity
            onPress={() => onClose(selected)}
            style={{
              backgroundColor: 'rgba(0,0,0,.5)',
              position: 'absolute',
              height: '100%',
              width: '100%',
              zIndex: 1,
            }}
          ></TouchableOpacity>

          <ScrollView
            style={{
              backgroundColor: 'white',
              marginHorizontal: 30,
              marginVertical: 100,
              zIndex: 2,
            }}
          >
            {list.map((entity) => (
              <TouchableOpacity
                key={entity.id}
                onPress={() => onClose(entity)}
                style={{
                  padding: 10,
                  borderBottomColor: 'lightgray',
                  borderBottomWidth: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'stretch',
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <View
                    style={{
                      backgroundColor: entity.color,
                      borderRadius: 50,
                      marginRight: 10,
                      width: 20,
                      height: 20,
                    }}
                  ></View>
                  <Text>{entity.name}</Text>
                </View>
                <Text>
                  {(entity as AccountEntity).balance ||
                    (entity as CategoryEntity).transactionsTotal}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
