/* eslint-disable no-console */
// import { useSendSegmentEvent } from './segment/segment';
import { useCallback } from 'react';
import { useSendGAEvent } from './google/google';
import { events, type EventInputData, type DispatchEvent, type AnalyticsConsumer } from './events';
import { useEnv } from '../../ui-components/hooks/useEnv';
import { type EventProcessor, defaultProcessor } from './processors';

export const useAnalytics = () => {
  const sendGAEvent = useSendGAEvent();
  // const sendSegmentEvent = useSendSegmentEvent();

  return {
    sendGAEvent
    //  sendSegmentEvent
  };
};

type DispatchMap<T> = {
  [key in AnalyticsConsumer]: DispatchEvent<keyof EventInputData, T>;
};

const useDispatchMap = <T>(): DispatchMap<T> => {
  const sendGAEvent = useSendGAEvent<T>();
  // const sendSegmentEvent = useSendSegmentEvent<T>();

  return {
    ga: sendGAEvent
    // segment: sendSegmentEvent
  };
};

export function useSendEvent<EventName extends keyof EventInputData>(eventName: EventName) {
  const dispatchMap = useDispatchMap<EventInputData[EventName]>();
  const {
    env: { EVENT_LOGGING }
  } = useEnv();
  const eventConfig = events[eventName];
  const consumers = Object.keys(eventConfig) as AnalyticsConsumer[];
  const sendEvent = useCallback(
    (
      data: EventInputData[EventName],
      options: {
        onSuccess?: () => void;
        onError?: (error: Error) => void;
      } = {}
    ) => {
      const consumerPromises = consumers.map(consumer => {
        const selectedProcessor = eventConfig[consumer];
        if (!selectedProcessor) return;
        const processor =
          typeof selectedProcessor === 'function' ? selectedProcessor : (defaultProcessor as EventProcessor<EventName>);

        const dispatcher = (action: EventName, params: EventInputData[EventName]) => {
          return dispatchMap[consumer](action, params).then(result => {
            if (EVENT_LOGGING) {
              console.group(`%c[${action}](${consumer})`, 'font-weight: bold;');
              console.log('input data:', data);
              console.log('sent data:', result);
              console.groupEnd();
            }
            return result;
          });
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return processor(eventName, dispatcher as DispatchEvent<EventName, any>, data).then(processedData => {
          return processedData as typeof data;
        });
      });

      Promise.all(consumerPromises)
        .then(() => {
          if (options.onSuccess) options.onSuccess();
        })
        .catch((error: Error) => {
          if (options.onError) options.onError(error);
          console.error(`Error processing event:`, error);
        });
    },
    [consumers, dispatchMap, eventConfig, EVENT_LOGGING, eventName]
  );

  return sendEvent;
}
