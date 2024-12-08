import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DragResizable from 'rn-drag-resize';

export default function App() {
  const { width, height } = Dimensions.get('screen');

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <DragResizable
          heightBound={height}
          widthBound={width}
          left={10}
          top={10}
          onDragEnd={(val) => {
            console.log({ dragEnd: val });
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  box: { backgroundColor: 'red', width: '100%', height: '100%' },
});
