import { type PropsWithChildren } from 'react';
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
  height?: number;
  width?: number;
  left: number;
  top: number;
  isDraggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (state: BoxDimension) => void;
  onTap?: () => void;
  scale?: number;
};

function DragResizable(props: PropsWithChildren<Props>) {
  const {
    left,
    top,
    heightBound,
    widthBound,
    height = 50,
    width = 150,
    isDraggable = true,
    onDragStart,
    onDragEnd,
    scale = 1,
    onTap,
    children,
  } = props;

  const boxX = useSharedValue(left);
  const boxY = useSharedValue(top);
  const boxHeight = useSharedValue(height);
  const boxWidth = useSharedValue(width);

  // shared
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const gestureHandler = Gesture.Pan()
    .enabled(isDraggable)
    .onStart(() => {
      offsetX.value = boxX.value;
      offsetY.value = boxY.value;
      if (onDragStart) runOnJS(onDragStart);
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
    <Animated.View style={[animatedStyle]}>
      <GestureDetector
        gesture={Gesture.Simultaneous(gestureHandler, tapGesture)}
      >
        {children}
      </GestureDetector>
    </Animated.View>
  );
}

export default DragResizable;
