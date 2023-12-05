import { Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';

import { COLORS } from '../common/constants/colors';

interface OwnProps {
  isOpen: boolean;
  initialSelected: string;
  onClose: (selected?: string) => void;
}

export const SelectColorModal = ({ isOpen, initialSelected, onClose }: OwnProps) => {
  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  return (
    <Modal
      animationType="none"
      visible={isOpen}
      onRequestClose={() => onClose()}
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
            onPress={() => onClose()}
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
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                padding: 15,
              }}
            >
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => onClose(color)}
                  style={{
                    backgroundColor: color,
                    borderRadius: 50,
                    marginHorizontal: 5,
                    marginVertical: 5,
                    width: 50,
                    height: 50,
                  }}
                ></TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
