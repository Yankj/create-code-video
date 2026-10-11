import React from 'react';
import {Composition} from 'remotion';
import {MotionLab} from './MotionLab';
export const Root: React.FC = () => <Composition id="MotionLab" component={MotionLab} width={1080} height={1920} fps={30} durationInFrames={540}/>;
