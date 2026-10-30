import React from 'react';
import {Composition} from 'remotion';
import {Rainbow} from './Rainbow';
import {RainbowV2} from './RainbowV2';
import tl from './timeline.json';
export const Root: React.FC = () => (<>
  <Composition id="Rainbow" component={Rainbow} durationInFrames={1620} fps={30} width={1080} height={1920} />
  <Composition id="RainbowV2" component={RainbowV2} durationInFrames={tl.total} fps={30} width={1080} height={1920} />
</>);
