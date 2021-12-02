import {sharedTiming} from '@animated';
import {enhance} from '@common';
import React, {memo, useCallback, useEffect, useMemo} from 'react';
import equals from 'react-fast-compare';
import {Text, View} from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, {Circle, CircleProps} from 'react-native-svg';

import {COLOR_BG, COLOR_FG, RADIUS, STROKE_WIDTH} from '../constant';

import {styles} from './styles';
import {ProgressCircleProps} from './type';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedText = Animated.createAnimatedComponent(Text);

export const ProgressCircleComponent = ({
  round,
  bg = COLOR_BG,
  fg = COLOR_FG,
  radius = RADIUS,
  progress,
  strokeWidth = STROKE_WIDTH,
  showTextProgress = true,
  textProgressStyle,
}: ProgressCircleProps) => {
  // state
  const strokeDasharray = useMemo(
    () => `${radius * 2 * Math.PI} ${radius * 2 * Math.PI}`,
    [radius],
  );
  const progressValue = useSharedValue(0);
  const strokeDashoffset = useDerivedValue(
    () =>
      interpolate(
        progressValue.value,
        [0, 100],
        [Math.PI * 2, 0],
        Extrapolate.CLAMP,
      ) * radius,
  );
  // style
  const textStyles = useMemo(
    () => enhance([styles.textProgress, textProgressStyle]),
    [textProgressStyle],
  );

  // function
  const renderText = useCallback(() => {
    if (progress < 0) {
      return 0 + '';
    }
    if (progress > 100) {
      return 100 + '';
    }
    return progress + '';
  }, [progress]);

  // effect
  useEffect(() => {
    progressValue.value = sharedTiming(progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  // props
  const circleProps = useAnimatedProps<CircleProps>(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  // render
  return (
    <View style={styles.container}>
      {showTextProgress && (
        <AnimatedText style={[textStyles]} children={renderText()} />
      )}
      <View style={[styles.wrapCircle]}>
        <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
          <AnimatedCircle
            r={radius}
            x={radius + strokeWidth / 2}
            y={radius + strokeWidth / 2}
            stroke={bg}
            strokeWidth={strokeWidth}
          />
          <AnimatedCircle
            strokeLinecap={round ? 'round' : undefined}
            strokeDasharray={strokeDasharray}
            r={radius}
            x={radius + strokeWidth / 2}
            y={radius + strokeWidth / 2}
            stroke={fg}
            strokeWidth={strokeWidth}
            animatedProps={circleProps}
          />
        </Svg>
      </View>
    </View>
  );
};
export const ProgressCircle = memo(ProgressCircleComponent, equals);
