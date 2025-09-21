import React, { createContext, useContext, useMemo, useState } from "react";

export interface FormValues {
  [key: string]: any;
}

export interface FormContextValue {
  values: FormValues;
  setValue: (name: string, value: any) => void;
  errors: Record<string, string | undefined>;
  setError: (name: string, error?: string) => void;
  reset: (next?: FormValues) => void;
}

const FormContext = createContext<FormContextValue | undefined>(undefined);

export const useForm = (): FormContextValue => {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useForm must be used within <FormProvider>");
  return ctx;
};

export const FormProvider: React.FC<{
  initialValues?: FormValues;
  children: React.ReactNode;
}> = ({ initialValues = {}, children }) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const ctx = useMemo<FormContextValue>(
    () => ({
      values,
      setValue: (name, value) => setValues((v) => ({ ...v, [name]: value })),
      errors,
      setError: (name, error) => setErrors((e) => ({ ...e, [name]: error })),
      reset: (next = {}) => {
        setValues(next);
        setErrors({});
      },
    }),
    [values, errors],
  );

  return <FormContext.Provider value={ctx}>{children}</FormContext.Provider>;
};
