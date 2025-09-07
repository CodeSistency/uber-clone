import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FormProvider, useForm } from './form/FormProvider';
import { Button } from './Button';
import { Tabs } from './Tabs';

export interface StepConfig {
  key: string;
  title: string;
  render: () => React.ReactNode;
  validate?: (values: Record<string, any>) => string | undefined; // return error message or undefined
}

export interface MultiStepFormProps {
  steps: StepConfig[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
}

const StepperHeader: React.FC<{ steps: StepConfig[]; index: number; onChange: (i: number) => void; }>
  = ({ steps, index, onChange }) => (
  <Tabs
    variant="segmented"
    items={steps.map((s) => ({ key: s.key, label: s.title }))}
    value={steps[index]?.key}
    onChange={(k) => onChange(Math.max(0, steps.findIndex(s => s.key === k)))}
    className="mb-3"
  />
);

export const MultiStepForm: React.FC<MultiStepFormProps> = ({ steps, initialValues = {}, onSubmit }) => {
  const [index, setIndex] = useState(0);
  const isLast = index === steps.length - 1;

  return (
    <FormProvider initialValues={initialValues}>
      <View className="w-full">
        <StepperHeader steps={steps} index={index} onChange={setIndex} />
        <View className="mt-2">
          {steps[index]?.render()}
        </View>
        <FooterNav
          index={index}
          total={steps.length}
          onNext={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
          onPrev={() => setIndex((i) => Math.max(0, i - 1))}
          onSubmit={() => onSubmit(useForm().values)}
          canSubmit={isLast}
        />
      </View>
    </FormProvider>
  );
};

const FooterNav: React.FC<{ index: number; total: number; onNext: () => void; onPrev: () => void; onSubmit: () => void; canSubmit: boolean; }>
  = ({ index, total, onNext, onPrev, onSubmit, canSubmit }) => (
  <View className="mt-6 flex-row justify-between">
    <Button title="Back" variant="outline" onPress={onPrev} disabled={index === 0} className="flex-1 mr-2" />
    {canSubmit ? (
      <Button title="Submit" onPress={onSubmit} className="flex-1 ml-2" />
    ) : (
      <Button title="Next" onPress={onNext} className="flex-1 ml-2" />
    )}
  </View>
);

export default MultiStepForm;


