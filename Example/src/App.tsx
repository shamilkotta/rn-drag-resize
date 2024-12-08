import { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DragResizable from '@shamilkotta/rn-drag-resize';

export default function App() {
  const [bounds, setBounds] = useState({ width: 0, height: 0 });

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={styles.container}>
        <View
          onLayout={(ev) => {
            const layout = ev.nativeEvent.layout;
            setBounds({ width: layout.width, height: layout.height });
          }}
          style={styles.container}
        >
          <DragResizable
            heightBound={bounds.height}
            widthBound={bounds.width}
            left={10}
            top={10}
            onDragEnd={(value) => {
              console.log({ dragEnd: value });
            }}
            onDragStart={() => {
              console.log('drag started');
            }}
            onTap={() => {
              console.log('Tapped on box');
            }}
            onResizeEnd={(value) => {
              console.log({ resizeEnd: value });
            }}
            onResizeStart={() => {
              console.log('resize start');
            }}
          >
            <View style={styles.box} />
          </DragResizable>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  box: { backgroundColor: 'red', width: '100%', height: '100%' },
});
