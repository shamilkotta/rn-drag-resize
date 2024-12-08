import { useCallback, type PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const clamp = (value: number, lowerBound: number, upperBound: number) => {
  'worklet';
  return Math.min(Math.max(lowerBound, value), upperBound);
};

type BoxDimension = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type Props = {
  heightBound: number;
  widthBound: number;
  minWidth?: number;
  minHeight?: number;
  height?: number;
  width?: number;
  left: number;
  top: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (state: BoxDimension) => void;
  onResizeStart?: () => void;
  onResizeEnd?: (state: BoxDimension) => void;
  onTap?: () => void;
  scale?: number;
  style?: StyleProp<ViewStyle>;
};

function DragResizable(props: PropsWithChildren<Props>) {
  const {
    left,
    top,
    heightBound,
    widthBound,
    height = 50,
    width = 150,
    minWidth = 50,
    minHeight = 50,
    isDraggable = true,
    isResizable = true,
    onDragStart,
    onDragEnd,
    onResizeStart,
    onResizeEnd,
    scale = 1,
    onTap,
    children,
    style,
  } = props;

  const boxX = useSharedValue(left);
  const boxY = useSharedValue(top);
  const boxHeight = useSharedValue(height);
  const boxWidth = useSharedValue(width);

  // shared
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const sHeight = useSharedValue(0);
  const sWidth = useSharedValue(0);

  const gestureHandler = Gesture.Pan()
    .enabled(isDraggable)
    .onStart(() => {
      offsetX.value = boxX.value;
      offsetY.value = boxY.value;
      if (onDragStart) runOnJS(onDragStart)();
    })
    .onUpdate((ev) => {
      boxX.value = clamp(
        offsetX.value + ev.translationX / scale,
        0,
        widthBound - boxWidth.value
      );
      boxY.value = clamp(
        offsetY.value + ev.translationY / scale,
        0,
        heightBound - boxHeight.value
      );
    })
    .onEnd(() => {
      if (onDragEnd) {
        runOnJS(onDragEnd)({
          width: boxWidth.value,
          height: boxHeight.value,
          left: boxX.value,
          top: boxY.value,
        });
      }
    })
    .onFinalize(() => {})
    .minDistance(0)
    .minPointers(1)
    .maxPointers(1);

  const tapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onStart(() => {
      if (onTap) runOnJS(onTap);
    })
    .onEnd(() => {});

  const createResizeHandler = useCallback(
    (corner: string) => {
      return Gesture.Pan()
        .enabled(isResizable)
        .onStart(() => {
          sHeight.value = boxHeight.value;
          sWidth.value = boxWidth.value;
          offsetX.value = boxX.value;
          offsetY.value = boxY.value;
          if (onResizeStart) runOnJS(onResizeStart)();
        })
        .onUpdate((ev) => {
          let updatedWidth = sWidth.value;
          let updatedHeight = sHeight.value;
          let updatedX = offsetX.value;
          let updatedY = offsetY.value;

          switch (corner) {
            case 'topLeft': {
              updatedWidth = clamp(
                sWidth.value - ev.translationX / scale,
                minWidth,
                widthBound - offsetX.value
              );
              updatedHeight = clamp(
                sHeight.value - ev.translationY / scale,
                minHeight,
                heightBound - updatedY
              );

              // Only update `boxX` if `updatedWidth` is valid and decreasing
              if (updatedWidth !== sWidth.value) {
                updatedX = offsetX.value + (sWidth.value - updatedWidth);
              }
              if (updatedHeight !== sHeight.value) {
                updatedY = clamp(
                  offsetY.value + ev.translationY / scale,
                  0,
                  heightBound - updatedHeight
                );
              }
              break;
            }
            case 'topRight': {
              updatedWidth = clamp(
                sWidth.value + ev.translationX / scale,
                minWidth,
                widthBound - offsetX.value
              );
              updatedHeight = clamp(
                sHeight.value - ev.translationY / scale,
                minHeight,
                heightBound - updatedY
              );
              if (updatedHeight !== sHeight.value) {
                updatedY = clamp(
                  offsetY.value + ev.translationY / scale,
                  0,
                  heightBound - updatedHeight
                );
              }
              break;
            }
            case 'bottomLeft': {
              updatedWidth = clamp(
                sWidth.value - ev.translationX / scale,
                minWidth,
                widthBound - offsetX.value
              );
              updatedHeight = clamp(
                sHeight.value + ev.translationY / scale,
                minHeight,
                heightBound - offsetY.value
              );

              // Only update `boxX` if `updatedWidth` is valid and decreasing
              if (updatedWidth !== sWidth.value) {
                updatedX = offsetX.value + (sWidth.value - updatedWidth);
              }
              break;
            }
            case 'bottomRight': {
              updatedWidth = clamp(
                sWidth.value + ev.translationX / scale,
                minWidth,
                widthBound - offsetX.value
              );
              updatedHeight = clamp(
                sHeight.value + ev.translationY / scale,
                minHeight,
                heightBound - offsetY.value
              );
              break;
            }
          }

          boxWidth.value = updatedWidth;
          boxHeight.value = updatedHeight;
          boxX.value = updatedX;
          boxY.value = updatedY;
        })
        .onEnd(() => {
          if (onResizeEnd) {
            runOnJS(onResizeEnd)({
              width: boxWidth.value,
              height: boxHeight.value,
              left: boxX.value,
              top: boxY.value,
            });
          }
        })
        .onFinalize(() => {})
        .minDistance(0)
        .minPointers(1)
        .maxPointers(1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      onResizeStart,
      scale,
      minWidth,
      widthBound,
      minHeight,
      heightBound,
      onResizeEnd,
    ]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: boxX.value,
      },
      {
        translateY: boxY.value,
      },
    ],
    height: boxHeight.value,
    width: boxWidth.value,
    position: 'absolute',
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <GestureDetector
        gesture={Gesture.Simultaneous(gestureHandler, tapGesture)}
      >
        {children}
      </GestureDetector>
      {isResizable ? (
        <>
          <GestureDetector gesture={createResizeHandler('topLeft')}>
            <Animated.View style={[styles.cornerHandle, styles.topLeft]}>
              <View style={[styles.handler]} />
            </Animated.View>
          </GestureDetector>
          <GestureDetector gesture={createResizeHandler('topRight')}>
            <Animated.View style={[styles.cornerHandle, styles.topRight]}>
              <View style={[styles.handler]} />
            </Animated.View>
          </GestureDetector>

          <GestureDetector gesture={createResizeHandler('bottomLeft')}>
            <Animated.View style={[styles.cornerHandle, styles.bottomLeft]}>
              <View style={[styles.handler]} />
            </Animated.View>
          </GestureDetector>
          <GestureDetector gesture={createResizeHandler('bottomRight')}>
            <Animated.View style={[styles.cornerHandle, styles.bottomRight]}>
              <View style={[styles.handler]} />
            </Animated.View>
          </GestureDetector>
        </>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cornerHandle: {
    position: 'absolute',
    zIndex: 1,
  },
  topLeft: {
    left: -10,
    top: -10,
  },
  topRight: {
    right: -10,
    top: -10,
  },
  bottomLeft: {
    left: -10,
    bottom: -10,
  },
  bottomRight: {
    right: -10,
    bottom: -10,
  },
  handler: {
    width: 20,
    height: 20,
    backgroundColor: '#ED4D5B',
    borderRadius: 10,
  },
});

export default DragResizable;
